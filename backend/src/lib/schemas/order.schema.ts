import { z } from "zod";

export const cartItemSchema = z.object({
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

// Main schema for placeOrder request body
export const placeOrderSchema = z.object({
    cartItems: z
        .array(cartItemSchema, {
            required_error: "Cart items are required.",
            invalid_type_error: "Cart items must be an array.",
        })
        .nonempty("Cart must contain at least one item."),
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
    state: z
        .string({
            required_error: "State is required for shipping calculation.",
            invalid_type_error: "State must be a string."
        })
        .min(1, "State cannot be empty.")
        .max(100, "State cannot exceed 100 characters.")
        .trim(),
});