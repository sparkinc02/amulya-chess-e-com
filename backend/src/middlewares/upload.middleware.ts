import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import AppError from "@/lib/utils/appError";

const storage = multer.memoryStorage();

const uploadMulter = multer({
    storage,
    limits: {
        files: 5,                 // Max 5 files per request
        fileSize: 10 * 1024 * 1024 // Max 10 MB per file
    },
});

export const upload = (req: Request, res: Response, next: NextFunction) => {
    uploadMulter.array('images', 5)(req, res, (err: any) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    throw new AppError("File too large. Maximum file size is 10MB.", 413);
                } else if (err.code === 'LIMIT_FILE_COUNT') {
                    throw new AppError("Too many files. Maximum 5 images allowed.", 413);
                } else {
                    // Generic Multer error
                    throw new AppError(`File upload error: ${err.message}`, 400);
                }
            } else {
                // Other unexpected errors during upload
                throw new AppError(`File upload failed: ${err.message || "An unknown error occurred."}.`, 500);
            }
        }
        next();
    });
};
