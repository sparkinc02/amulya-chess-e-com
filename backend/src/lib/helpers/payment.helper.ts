// src/controllers/payment.utils.ts

/**
 * Secure signature verification using constant-time comparison
 */
import crypto from "crypto";

export const validateRazorpaySignature = (
    orderId: string,
    paymentId: string,
    signature: string
): boolean | { error: string; statusCode: number } => {
    if (!process.env.RAZORPAY_KEY_SECRET) {
        return { error: "Server configuration error: Payment secret missing.", statusCode: 500 };
    }

    const body = `${orderId}|${paymentId}`;

    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    const isValid = generatedSignature === signature;

    if (isValid) {
        return isValid;
    } else {
        return { error: "Invalid Razorpay signature.", statusCode: 400 };
    }
};