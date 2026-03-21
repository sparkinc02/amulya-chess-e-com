// src/schemas/payment.schema.ts

import { z } from "zod";

// --- Cart Item Schema ---
const cartItemsSchema = z.object({
    productId: z
        .string({
            required_error: "Product ID is required.",
            invalid_type_error: "Product ID must be a string.",
        })
        .min(1, "Product ID cannot be empty.")
        .trim(),
    quantity: z
        .number({
            required_error: "Quantity is required.",
            invalid_type_error: "Quantity must be a number.",
        })
        .int("Quantity must be a whole number.")
        .positive("Quantity must be greater than zero."),
    size: z.string().optional(),
    color: z.string().optional(),
});

// --- Address Schema ---
const addressSchema = z.object({
    addressLine: z
        .string({
            required_error: "Address Line is required.",
            invalid_type_error: "Address Line must be a string.",
        })
        .min(1, "Address Line cannot be empty.")
        .max(200, "Address Line cannot exceed 200 characters.")
        .trim(),
    apartment: z.string().max(100, "Apartment details cannot exceed 100 characters.").trim().optional(),
    city: z
        .string({
            required_error: "City is required.",
            invalid_type_error: "City must be a string.",
        })
        .min(1, "City cannot be empty.")
        .max(100, "City cannot exceed 100 characters.")
        .trim(),
    state: z
        .string({
            required_error: "State is required.",
            invalid_type_error: "State must be a string.",
        })
        .min(1, "State cannot be empty.")
        .max(100, "State cannot exceed 100 characters.")
        .trim(),
    pincode: z
        .string({
            required_error: "PIN code is required.",
            invalid_type_error: "PIN code must be a string.",
        })
        .regex(/^\d{6}$/, { message: "PIN code must be exactly 6 digits." })
        .trim(),
    phone: z
        .string({
            required_error: "Phone number is required.",
            invalid_type_error: "Phone number must be a string.",
        })
        .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits." })
        .trim(),
});

// --- Verify Payment Schema ---
export const verifyPaymentSchema = z.object({
    razorpay_order_id: z
        .string({
            required_error: "Razorpay Order ID is required.",
            invalid_type_error: "Razorpay Order ID must be a string.",
        })
        .min(1, "Razorpay Order ID cannot be empty.")
        .trim(),
    razorpay_payment_id: z
        .string({
            required_error: "Razorpay Payment ID is required.",
            invalid_type_error: "Razorpay Payment ID must be a string.",
        })
        .min(1, "Razorpay Payment ID cannot be empty.")
        .trim(),
    razorpay_signature: z
        .string({
            required_error: "Razorpay Signature is required.",
            invalid_type_error: "Razorpay Signature must be a string.",
        })
        .min(1, "Razorpay Signature cannot be empty.")
        .trim(),
    cartItems: z
        .array(cartItemsSchema, {
            required_error: "Cart items are required.",
            invalid_type_error: "Cart items must be an array.",
        })
        .nonempty("Cart cannot be empty."),
    address: addressSchema,
    subtotal: z
        .number({
            required_error: "Subtotal is required.",
            invalid_type_error: "Subtotal must be a number.",
        })
        .nonnegative("Subtotal cannot be negative."),
    shipping: z
        .number({
            required_error: "Shipping is required.",
            invalid_type_error: "Shipping must be a number.",
        })
        .nonnegative("Shipping cannot be negative."),
    total: z
        .number({
            required_error: "Total is required.",
            invalid_type_error: "Total must be a number.",
        })
        .nonnegative("Total cannot be negative."),
    saveInfo: z.boolean({
        invalid_type_error: "Save info must be a boolean."
    }).default(true),
});