import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  getCategories,
} from "@/controllers/product.controller";
import { validateBody } from "@/lib/helpers/common.helper";
import { addProductSchema, updateProductSchema } from "@/lib/schemas/product.schema";

import { authenticate, authorizeAdmin } from "@/middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";
import express from "express";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/categories", getCategories);
router.get("/:id", getProduct);
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  upload,
  validateBody(addProductSchema),
  createProduct,
);
router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  upload,
  validateBody(updateProductSchema),
  updateProduct,
);

router.delete("/:id", authenticate, authorizeAdmin, deleteProduct);

export { router as productRouter };
