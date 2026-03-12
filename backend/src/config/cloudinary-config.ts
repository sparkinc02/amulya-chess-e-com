import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import AppError from "@/lib/utils/appError";

dotenv.config();

const { CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// Validate Cloudinary environment variables
if (!CLOUD_NAME) {
    console.error("Cloudinary Config Error: CLOUD_NAME is not defined in environment variables.");
    throw new AppError("Server configuration error: Cloudinary Cloud Name missing.", 500);
}
if (!CLOUDINARY_API_KEY) {
    console.error("Cloudinary Config Error: CLOUDINARY_API_KEY is not defined in environment variables.");
    throw new AppError("Server configuration error: Cloudinary API Key missing.", 500);
}
if (!CLOUDINARY_API_SECRET) {
    console.error("Cloudinary Config Error: CLOUDINARY_API_SECRET is not defined in environment variables.");
    throw new AppError("Server configuration error: Cloudinary API Secret missing.", 500);
}

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

console.log("✔ Cloudinary configured successfully.");

export default cloudinary; 