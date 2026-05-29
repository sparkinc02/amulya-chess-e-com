import {
  streamUploadHelper,
  discountPercent,
  deleteCloudinaryImage,
} from "@/lib/helpers/product.helper";
import type { Request, Response } from "express";
import { isValidObjectId } from "@/lib/helpers/common.helper";
import { prisma } from "@/config/data-source";
import { verifyToken } from "@/lib/helpers/auth.helper";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    let all = req.query.all === "true";
    if (all) {
      let isAdmin = false;
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        try {
          const decoded = verifyToken(token);
          if (decoded && !decoded.error && decoded.id) {
            const user = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (user && user.role === "admin") {
              isAdmin = true;
            }
          }
        } catch (err) {
          // Ignore invalid token
        }
      }
      if (!isAdmin) {
        all = false;
      }
    }

    let products;
    let whereClause: any = {};
    if (!all) {
      whereClause.active = true;
    }

    if (req.query.query) {
      const query = req.query.query as string;
      products = await prisma.product.findMany({
        where: {
          ...whereClause,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { subcategory: { contains: query, mode: "insensitive" } },
          ],
        },
      });
    } else if (req.query.isFeatured) {
      products = await prisma.product.findMany({
        where: {
          ...whereClause,
          isFeatured: true,
        },
      });
    } else if (req.query.category) {
      const category = req.query.category as string;
      products = await prisma.product.findMany({
        where: {
          ...whereClause,
          category: category,
        },
      });
    } else {
      products = await prisma.product.findMany({
        where: whereClause,
      });
    }
    res.status(200).json({
      message: "Products fetched successfully.",
      data: products,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: "Failed to retrieve products.",
    });
    return;
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      res.status(400).json({
        message: "Product ID is required.",
      });
      return;
    }
    if (!isValidObjectId(productId)) {
      res.status(400).json({
        message: "Invalid product ID.",
      });
      return;
    }
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      res.status(404).json({
        message: "Product not found.",
      });
      return;
    }
    res.status(200).json({
      message: "Product fetched successfully.",
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, category, subcategory, originalPrice, price } = req.body;
    const files = req.files as Express.Multer.File[];

    // Ensure originalPrice and price are numbers for discount calculation
    const parsedOriginalPrice = parseFloat(originalPrice) || 0;
    const parsedPrice = parseFloat(price) || 0;

    if (!files || files.length < 1) {
      res.status(400).json({
        message: "At least one image is required.",
      });
      return;
    }
    if (files.length > 5) {
      res.status(400).json({
        message: "You can upload a maximum of 5 images.",
      });
      return;
    }

    const isProductExist = await prisma.product.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    if (isProductExist) {
      res.status(400).json({
        message: `A product with the name "${name}" already exists. Please choose a different name.`,
      });
      return;
    }
    // This check below is somewhat redundant with !files || files.length < 1 and files.length > 5 checks above,
    // but keeping it for robustness against unexpected req.files structure.
    if (!Array.isArray(req.files)) {
      res.status(400).json({
        message:
          "No images uploaded. Please attach minimum one product image to proceed.",
      });
      return;
    }

    const uploadedUrls = await streamUploadHelper(files);
    if (uploadedUrls.length === 0 && files.length > 0) {
      res.status(500).json({
        message: "Failed to upload images. Please try again later.",
      });
      return;
    }
    if (files.length !== uploadedUrls.length) {
      console.warn(
        "Create Product Warning: Mismatch in number of files uploaded vs. expected. Continuing with uploaded."
      );
    }

    const newProductData = {
      ...req.body,
      discount: discountPercent(parsedOriginalPrice, parsedPrice),
      images: uploadedUrls,
    };
    const newProduct = await prisma.product.create({ data: newProductData });
    res.status(201).json({
      message: `Product "${newProduct.name}" has been created successfully.`,
      data: newProduct,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      res.status(400).json({
        message: "Product ID is required.",
      });
      return;
    }
    if (!isValidObjectId(productId)) {
      res.status(400).json({
        message: "Invalid product ID.",
      });
      return;
    }

    let existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) {
      res.status(404).json({
        message: "Product not found.",
      });
      return;
    }

    const files = (req.files as Express.Multer.File[]) || [];
    let uploadedUrls: string[] = [];

    if (files.length > 0) {
      uploadedUrls = await streamUploadHelper(files);
      if (uploadedUrls.length === 0 && files.length > 0) {
        res.status(500).json({
          message: "Failed to upload new images. Please try again later.",
        });
        return;
      }
    }

    // Validate imageData
    const incomingImages = req.body.imageData;
    if (!incomingImages || !Array.isArray(incomingImages)) {
      res.status(400).json({
        message:
          "Invalid image data provided. Please provide a valid image array.",
      });
      return;
    }

    // Validate that we have at least one image
    if (incomingImages.length === 0) {
      res.status(400).json({
        message: "At least one image is required.",
      });
      return;
    }

    // Validate that we don't exceed 5 images
    if (incomingImages.length > 5) {
      res.status(400).json({
        message: "You can upload a maximum of 5 images.",
      });
      return;
    }

    const finalImages: string[] = [];
    let uploadedIndex = 0;

    for (const image of incomingImages) {
      // Validate image object structure
      if (!image || typeof image !== "object") {
        res.status(400).json({
          message: "Invalid image data structure.",
        });
        return;
      }

      if (image.isExisting) {
        if (!image.url || typeof image.url !== "string") {
          res.status(400).json({
            message: "Invalid existing image URL.",
          });
          return;
        }
        finalImages.push(image.url);
      } else {
        // Check if we have enough uploaded URLs
        if (uploadedIndex >= uploadedUrls.length) {
          res.status(400).json({
            message: "Mismatch between new images and uploaded files.",
          });
          return;
        }
        const uploadedUrl = uploadedUrls[uploadedIndex];
        if (!uploadedUrl) {
          res.status(400).json({
            message: "Invalid uploaded file URL.",
          });
          return;
        }
        finalImages.push(uploadedUrl);
        uploadedIndex++;
      }
    }

    // Identify removed images for cleanup
    const existingImageUrls = existingProduct.images || [];
    const removedImages = existingImageUrls.filter(
      (url: string) => !finalImages.includes(url)
    );

    // Delete removed images from Cloudinary
    if (removedImages.length > 0) {
      try {
        for (const url of removedImages) {
          await deleteCloudinaryImage(url);
        }
      } catch (error) {
        console.error("Failed to delete some images from Cloudinary:", error);
        // Don't throw error here as the main operation should still succeed
      }
    }

    // Validate required fields
    if (!req.body.name || !req.body.category || !req.body.subcategory) {
      res.status(400).json({
        message: "Name, category, and subcategory are required fields.",
      });
      return;
    }

    const updatedProductData = {
      name: req.body.name,
      category: req.body.category,
      subcategory: req.body.subcategory,
      originalPrice: parseFloat(String(req.body.originalPrice ?? "")) || 0,
      price: parseFloat(String(req.body.price ?? "")) || 0,
      description: req.body.description || "",
      isFeatured: req.body.isFeatured === true,
      active: req.body.active !== false, // Default to true
      stock: parseInt(String(req.body.stock ?? "")) || 0,
      colors: Array.isArray(req.body.colors)
        ? (req.body.colors as string[])
        : typeof req.body.colors === "string"
        ? String(req.body.colors)
            .split(",")
            .map((c: string) => c.trim())
            .filter(Boolean)
        : [],
      sizes: Array.isArray(req.body.sizes)
        ? (req.body.sizes as string[])
        : typeof req.body.sizes === "string"
        ? String(req.body.sizes)
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      images: finalImages,
      discount: discountPercent(
        parseFloat(String(req.body.originalPrice ?? "")) || 0,
        parseFloat(String(req.body.price ?? "")) || 0
      ),
    };

    existingProduct = await prisma.product.update({
      where: { id: productId },
      data: updatedProductData,
    });

    res.status(200).json({
      message: `Product "${existingProduct.name}" updated successfully.`,
      data: existingProduct,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      res.status(400).json({
        message: "Product ID is required.",
      });
      return;
    }
    if (!isValidObjectId(productId)) {
      res.status(400).json({
        message: "Invalid product ID. Please check and try again.",
      });
      return;
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) {
      res.status(404).json({
        message: "Product not found. It may have already been deleted.",
      });
      return;
    }

    if (existingProduct.images && existingProduct.images.length > 0) {
      for (const imageUrl of existingProduct.images) {
        await deleteCloudinaryImage(imageUrl);
      }
    }

    await prisma.product.delete({ where: { id: productId } });
    res.status(200).json({
      message: `Product "${existingProduct.name}" has been deleted successfully.`,
      data: null, // No data returned on deletion
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};
export const getCategories = async (req: Request, res: Response) => {
  try {
    let all = req.query.all === "true";
    if (all) {
      let isAdmin = false;
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        try {
          const decoded = verifyToken(token);
          if (decoded && !decoded.error && decoded.id) {
            const user = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (user && user.role === "admin") {
              isAdmin = true;
            }
          }
        } catch (err) {
          // Ignore invalid token
        }
      }
      if (!isAdmin) {
        all = false;
      }
    }

    const categories = await prisma.product.findMany({
      where: all ? {} : { active: true },
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    res.status(200).json({
      message: "Categories fetched successfully.",
      data: categories.map((c) => c.category),
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch categories.",
    });
  }
};
