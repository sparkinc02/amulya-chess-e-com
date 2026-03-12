// types/express/index.d.ts
import type { User } from "@/models/User";
import type { z } from "zod";
import type { cartItemSchema, placeOrderSchema } from "./schemas/order.schema";
import type { verifyPaymentSchema } from "./schemas/payment.schema";


declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
export type CartItem = z.infer<typeof cartItemSchema>
export type PlaceOrderRequestBody = z.infer<typeof placeOrderSchema>
export type VerifyPaymentRequestBody = z.infer<typeof verifyPaymentSchema>