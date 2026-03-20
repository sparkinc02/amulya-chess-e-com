import * as z from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  originalPrice: z.coerce.number().min(0, "Original price must be at least 0"),
  description: z.string().min(1, "Description is required"),
  stock: z.coerce.number().min(0, "Stock must be at least 0"),
  images: z.array(z.any()).optional(),
  colors: z.string().optional(),
  sizes: z.string().optional(),
  active: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});
