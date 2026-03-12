import Razorpay from "razorpay";
import dotenv from "dotenv";
import AppError from "@/lib/utils/appError";

dotenv.config();

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

// Validate Razorpay environment variables
if (!RAZORPAY_KEY_ID) {
    console.error("Razorpay Config Error: RAZORPAY_KEY_ID is not defined in environment variables.");
    throw new AppError("Server configuration error: Razorpay Key ID missing.", 500);
}
if (!RAZORPAY_KEY_SECRET) {
    console.error("Razorpay Config Error: RAZORPAY_KEY_SECRET is not defined in environment variables.");
    throw new AppError("Server configuration error: Razorpay Key Secret missing.", 500);
}

export const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});