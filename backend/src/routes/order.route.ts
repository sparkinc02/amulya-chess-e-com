import {
  getAllOrders,
  placeOrder,
  updateOrderStatus,
  // getOrderInvoice,
  getOrderInvoicePdf,
} from "@/controllers/order.controller";
import { validateBody } from "@/lib/helpers/common.helper";
import { placeOrderSchema } from "@/lib/schemas/order.schema";
import { authenticate, authorizeAdmin } from "@/middlewares/auth.middleware";
import express from "express";

const router = express.Router();
router.get("/", authenticate, authorizeAdmin, getAllOrders);
router.put("/:orderId/status", authenticate, authorizeAdmin, updateOrderStatus);
router.post("/place", authenticate, validateBody(placeOrderSchema), placeOrder);
// router.get("/:orderId/invoice", authenticate, getOrderInvoice);
router.get("/:orderId/invoice/pdf", getOrderInvoicePdf);
// router.get("/:orderId/invoice/pdf", (req, res) => {
//   res.json("working");
// });
// router.post("/place",(req,res)=>{
//     console.log("working")
//     res.json({message:"Working"})
// })
export { router as orderRouter };
