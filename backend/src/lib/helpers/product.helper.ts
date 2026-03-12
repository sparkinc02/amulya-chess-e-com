import cloudinary from "@/config/cloudinary-config";
import streamifier from "streamifier";

export const streamUpload = (buffer: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
                if (result) {
                    resolve(result.secure_url);
                } else {
                    reject({ error: "Image upload to Cloudinary failed.", statusCode: 500 });
                }
            },
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

export const streamUploadHelper = async (files: Express.Multer.File[]) => {
    const uploadedUrls: string[] = [];
    if (!files || files.length === 0) {
        return uploadedUrls;
    }

    for (const file of files) {
        try {
            const url = await streamUpload(file.buffer);
            uploadedUrls.push(url);
        } catch (error: any) {
            console.log(error);
            // Continue with next file if upload fails
            continue;
        }
    }
    return uploadedUrls;
};

export const discountPercent = (originalPrice: number, sellingPrice: number) => {
    if (sellingPrice > originalPrice) {
        return 0;
    }
    if (originalPrice === 0) {
        return 0; // Avoid division by zero
    }
    return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
};

export const deleteCloudinaryImage = async (url: string | null | undefined): Promise<void | { error: string; statusCode: number }> => {
    if (!url || typeof url !== "string") {
        return; // Exit if URL is invalid
    }
    const publicId = extractPublicId(url);
    if (!publicId) {
        return;
    }

    try {
        const result = await cloudinary.uploader.destroy(`products/${publicId}`);
        if (result.result === "ok") {
        } else {
            return { error: `Failed to delete image products/${publicId} from Cloudinary: ${result.result}`, statusCode: 500 };
        }
    } catch (error: any) {
        if (typeof error === 'object' && 'error' in error) {
            return error; // Re-throw if it's already an error object
        } else {
            return { error: `Failed to delete image products/${publicId} from Cloudinary.`, statusCode: 500 };
        }
    }
};

const extractPublicId = (url: string) => {
    const parts = url.split("/");
    const file = parts[parts.length - 1];
    return file?.split(".")[0];
};