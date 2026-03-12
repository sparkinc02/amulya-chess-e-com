import { verifyPayment } from "@/controllers/payment.controller";
import { validateBody } from "@/lib/helpers/common.helper";
import { verifyPaymentSchema } from "@/lib/schemas/payment.schema";
import { authenticate, } from "@/middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.post("/verify", authenticate, validateBody(verifyPaymentSchema), verifyPayment);

export { router as paymentRouter };
