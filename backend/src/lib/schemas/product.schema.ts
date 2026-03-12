import { z } from "zod"
export const addProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    category: z.string().min(1, "Category is required"),
    subcategory: z.string().min(1, "Subcategory is required"),

    // Transform string to number with better error handling
    price: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") {
            return undefined; // Will trigger required error
        }
        if (typeof val === "string") {
            const num = parseFloat(val);
            return isNaN(num) ? val : num;
        }
        return val;
    }, z.number().positive("Price must be greater than 0")),

    originalPrice: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") {
            return undefined;
        }
        if (typeof val === "string") {
            const num = parseFloat(val);
            return isNaN(num) ? val : num;
        }
        return val;
    }, z.number().positive("Original price must be greater than 0")),

    stock: z.preprocess((val) => {
        if (val === undefined || val === null || val === "") {
            return undefined;
        }
        if (typeof val === "string") {
            const num = parseInt(val, 10);
            return isNaN(num) ? val : num;
        }
        return val;
    }, z.number().nonnegative("Stock must be 0 or greater")),

    description: z.string().min(1, "Description is required"),

    colors: z.preprocess(
        (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;

            if (typeof val === "string") {
                if (val.trim() === "") return [];

                try {
                    const parsed = JSON.parse(val);
                    return Array.isArray(parsed) ? parsed : [val];
                } catch {
                    return val
                        .split(",")
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0);
                }
            }

            return [];
        },
        z.array(z.string()).min(1, "At least one color is required"),
    ),

    sizes: z.preprocess(
        (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;

            if (typeof val === "string") {
                if (val.trim() === "") return [];

                try {
                    const parsed = JSON.parse(val);
                    return Array.isArray(parsed) ? parsed : [val];
                } catch {
                    return val
                        .split(",")
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0);
                }
            }

            return [];
        },
        z.array(z.string()).min(1, "At least one size is required"),
    ),

    active: z.preprocess((val) => {
        if (val === undefined || val === null) return true; // default to true
        if (typeof val === "string") {
            return val.toLowerCase() === "true";
        }
        return Boolean(val);
    }, z.boolean()),
    isFeatured: z.preprocess((val) => {
        if (val === undefined || val === null) return true; // default to true
        if (typeof val === "string") {
            return val.toLowerCase() === "true";
        }
        return Boolean(val);
    }, z.boolean()),
});
export const updateProductSchema = z.object({
    name: z.string().min(1, "Product name is required").optional(), // Optional for updates
    category: z.string().min(1, "Category is required").optional(), // Optional for updates
    subcategory: z.string().min(1, "Subcategory is required").optional(), // Optional for updates

    // Transform string to number with better error handling
    price: z
        .preprocess((val) => {
            if (val === undefined || val === null || val === "") {
                return undefined; // Will trigger required error if not optional, or pass undefined if optional
            }
            if (typeof val === "string") {
                const num = parseFloat(val);
                return isNaN(num) ? val : num; // Return original value if not a valid number string
            }
            return val;
        }, z.number().positive("Price must be greater than 0"))
        .optional(), // Optional for updates

    originalPrice: z
        .preprocess((val) => {
            if (val === undefined || val === null || val === "") {
                return undefined;
            }
            if (typeof val === "string") {
                const num = parseFloat(val);
                return isNaN(num) ? val : num;
            }
            return val;
        }, z.number().positive("Original price must be greater than 0"))
        .optional(), // Optional for updates

    stock: z
        .preprocess((val) => {
            if (val === undefined || val === null || val === "") {
                return undefined;
            }
            if (typeof val === "string") {
                const num = parseInt(val, 10);
                return isNaN(num) ? val : num;
            }
            return val;
        }, z.number().nonnegative("Stock must be 0 or greater"))
        .optional(), // Optional for updates

    description: z.string().min(1, "Description is required").optional(), // Optional for updates

    colors: z
        .preprocess(
            (val) => {
                if (!val) return [];
                if (Array.isArray(val)) return val;

                if (typeof val === "string") {
                    if (val.trim() === "") return [];

                    try {
                        const parsed = JSON.parse(val);
                        return Array.isArray(parsed) ? parsed : [val]; // Handle case where it's not an array after parse
                    } catch {
                        // Fallback for comma-separated string if not valid JSON
                        return val
                            .split(",")
                            .map((item) => item.trim())
                            .filter((item) => item.length > 0);
                    }
                }
                return [];
            },
            z.array(z.string()).min(1, "At least one color is required"),
        )
        .optional(), // Optional for updates

    sizes: z
        .preprocess(
            (val) => {
                if (!val) return [];
                if (Array.isArray(val)) return val;

                if (typeof val === "string") {
                    if (val.trim() === "") return [];

                    try {
                        const parsed = JSON.parse(val);
                        return Array.isArray(parsed) ? parsed : [val];
                    } catch {
                        return val
                            .split(",")
                            .map((item) => item.trim())
                            .filter((item) => item.length > 0);
                    }
                }
                return [];
            },
            z.array(z.string()).min(1, "At least one size is required"),
        )
        .optional(), // Optional for updates

    active: z
        .preprocess((val) => {
            if (val === undefined || val === null) return true; // default to true if not provided
            if (typeof val === "string") {
                return val.toLowerCase() === "true";
            }
            return Boolean(val);
        }, z.boolean())
        .optional(), // Optional for updates

    isFeatured: z
        .preprocess((val) => {
            if (val === undefined || val === null) return true; // default to true if not provided
            if (typeof val === "string") {
                return val.toLowerCase() === "true";
            }
            return Boolean(val);
        }, z.boolean())
        .optional(), // Optional for updates

    // --- NEW: Add imageData validation ---
    imageData: z.preprocess(
        (val) => {
            // If no value, return an empty array or undefined to fail validation
            if (val === undefined || val === null || val === "") return [];

            // If it's already an array (e.g., from a test or if Multer parses it directly)
            if (Array.isArray(val)) return val;

            // If it's a string, attempt to parse it as JSON
            if (typeof val === "string") {
                try {
                    const parsed = JSON.parse(val);
                    return Array.isArray(parsed) ? parsed : []; // Ensure it's an array after parsing
                } catch (e) {
                    console.error("Failed to parse imageData string:", e);
                    return []; // Return empty array or throw error for invalid JSON
                }
            }
            // For any other unexpected type, return an empty array
            return [];
        },
        z
            .array(
                z.object({
                    url: z.string().url("Image URL must be a valid URL"), // Validate URLs
                    isExisting: z.boolean(),
                }),
            )
            .optional(), // Make the entire imageData field optional for updates
    ),
});