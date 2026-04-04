import { prisma } from "@/config/data-source";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { CartItem } from "../types";
import { BUSINESS_CONFIG } from "../constants/invoice.constant";
import type { OrderItem, User } from "generated/prisma";

// Local Product type matching Prisma schema
export type Product = {
  id: string;
  name: string;
  description: string;
  specifications?: string | null;
  category: string;
  subcategory: string;
  images: string[];
  price?: number | null;
  originalPrice?: number | null;
  discount?: number | null;
  colors: string[];
  sizes: string[];
  stock?: number | null;
  isFeatured: boolean;
  active: boolean;
  createdAt: Date;
};

// Local User type matching Prisma schema

export function omitUserPrivateFields(user: User) {
  const {
    password,
    refreshToken,
    refreshTokenExpiresAt,
    createdAt,
    ...safeUser
  } = user;
  return safeUser;
}

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const firstError = result.error.errors[0];
        const errorMessage = firstError?.message || "Validation failed";
        res.status(400).json({
          message: errorMessage,
        });
        return;
      }
      req.body = result.data;
      next();
    } catch (error: any) {
      res.status(500).json({
        message: "Internal validation error occurred.",
      });
      return;
    }
  };
};

export const isValidObjectId = (id: string): boolean => {
  return /^[a-f\d]{24}$/i.test(id);
};

// lib/helpers/common.helper.ts
export async function validateCartItems(cartItems: CartItem[], state: string) {
  if (!state || typeof state !== "string") {
    return {
      error: "State is required to calculate shipping.",
      statusCode: 400,
    };
  }

  const productIds = cartItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));
  let subtotal = 0;
  const validatedItems = [];

  // Parallel validation checks
  const validationResults = await Promise.allSettled(
    cartItems.map(async (item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for ${item.productId}`);
      }
      if (item.quantity > (product.stock || 0)) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      if (typeof product.price !== "number") {
        throw new Error(`Invalid price for ${item.productId}`);
      }

      return {
        product,
        item,
        itemTotal: product.price * item.quantity,
      };
    }),
  );

  // Handle validation errors
  const firstError = validationResults.find(
    (r): r is PromiseRejectedResult => r.status === "rejected",
  );

  if (firstError) {
    return {
      error: firstError.reason.message,
      statusCode: 400,
    };
  }

  // Calculate totals
  for (const result of validationResults) {
    if (result.status === "fulfilled") {
      const { product, item, itemTotal } = result.value;
      subtotal += itemTotal;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size || "",
        color: item.color || "",
        price: product?.price || 0,
        name: product.name,
        image: product.images?.[0] || "",
        itemTotal,
      });
    }
  }

  // Shipping calculation
  const shipping =
    subtotal >= BUSINESS_CONFIG.pricing.shippingThreshold
      ? 0
      : BUSINESS_CONFIG.pricing.shippingCost;

  // GST calculation
  const gst = Math.round(
    subtotal * (BUSINESS_CONFIG.pricing.gstPercentage / 100),
  );

  const total = subtotal + shipping + gst;

  return {
    orderItems: validatedItems,
    calculatedSubtotal: subtotal,
    calculatedShipping: shipping,
    calculatedTotal: total,
    calculatedGst: gst,
  };
}
