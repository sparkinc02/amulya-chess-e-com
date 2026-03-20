import { ImageFile } from "@/components/ImageUpload";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProductFormValues } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function formatDate(date: string | Date | undefined) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function createStructuredProductFormData(data: ProductFormValues) {
  const colorsArray = data.colors
    ? data.colors
        .split(",")
        .map((c: string) => c.trim())
        .filter(Boolean)
    : [];
  const sizesArray = data.sizes
    ? data.sizes
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];
  const formData = new FormData();
  const imageData = data.images.map((image: ImageFile) => {
    return {
      url: image.preview,
      isExisting: image.isExisting,
    };
  });
  formData.append("name", data.name);
  formData.append("category", data.category);
  formData.append("subcategory", data.subcategory);
  formData.append("price", data.price.toString());
  formData.append("originalPrice", data.originalPrice.toString());
  formData.append("description", data.description);
  formData.append("stock", data.stock.toString());
  formData.append("colors", colorsArray.join(","));
  formData.append("sizes", sizesArray.join(","));
  formData.append("active", data.active.toString());
  formData.append("isFeatured", data.isFeatured.toString());
  formData.append("imageData", JSON.stringify(imageData));

  data.images.forEach((image: ImageFile) => {
    if (!image.isExisting) formData.append("images", image);
  });

  return formData;
}
