// import { razorpay } from "@/config/razorpay-config";
import type { PlaceOrderRequestBody } from "@/lib/types";
import type { Request, Response } from "express";
import { validateCartItems } from "@/lib/helpers/common.helper";
import { prisma } from "@/config/data-source";
import {
  sendEmail,
  getOrderStatusEmail,
  getInvoiceHtmlAndText,
  generateInvoicePdf,
} from "@/lib/helpers/email.helper";
import { BUSINESS_CONFIG } from "@/lib/constants/invoice.constant";

export const placeOrder = async (
  req: Request<{}, {}, PlaceOrderRequestBody & { state: string }>,
  res: Response
) => {
  const {
    cartItems,
    subtotal: clientSubtotal,
    shipping: clientShipping,
    total: clientTotal,
    state,
  } = req.body;
  try {
    const validationResult = await validateCartItems(cartItems, state);

    if (typeof validationResult === "object" && "error" in validationResult) {
      res.status(validationResult.statusCode || 400).json({
        message: validationResult.error,
      });
      return;
    }

    const {
      orderItems,
      calculatedSubtotal,
      calculatedShipping,
      calculatedTotal,
    } = validationResult;
    // console.log(validationResult)
    if (
      clientSubtotal !== calculatedSubtotal ||
      clientShipping !== calculatedShipping ||
      clientTotal !== calculatedTotal
    ) {
      res.status(400).json({
        message: "Cart values mismatch. Please refresh and try again.",
        solution: "Refresh the page and try again.",
      });
      return;
    }

    const options = {
      amount: Math.round((calculatedTotal || 0) * 100),
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };
    // const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      message: "Order placed successfully. Proceed to payment.",
      data: {
        // razorpayOrderId: razorpayOrder.id,
        // amount: Number(razorpayOrder?.amount) / 100,
        // currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        orderItems,
      },
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
      },
    });
    res.status(200).json({
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch orders",
    });
    return;
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status, trackingNumber, note, notifyCustomer, estimatedDelivery } =
    req.body;

  // Validate required fields
  if (!orderId || !status) {
    res.status(400).json({
      message: "Order ID and status are required",
    });
    return;
  }

  // Validate status enum values
  const validStatuses = [
    "ORDER_PLACED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(status)) {
    res.status(400).json({
      message:
        "Invalid status. Must be one of: ORDER_PLACED, PROCESSING, SHIPPED, DELIVERED, CANCELLED",
    });
    return;
  }

  try {
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
      },
    });

    if (!order) {
      res.status(404).json({
        message: "Order not found",
      });
      return;
    }

    // Validate status transitions
    if (order.status === "DELIVERED") {
      res.status(400).json({
        message: "Cannot update order that is already delivered",
      });
      return;
    }

    if (order.status === "CANCELLED") {
      res.status(400).json({
        message: "Cannot update order that is already cancelled",
      });
      return;
    }

    // Validate SHIPPED status requirements
    if (status === "SHIPPED") {
      if (!trackingNumber || !estimatedDelivery) {
        res.status(400).json({
          message:
            "Tracking number and estimated delivery date are required when marking order as shipped",
        });
        return;
      }

      // Validate tracking number format (basic validation)
      if (
        typeof trackingNumber !== "string" ||
        trackingNumber.trim().length < 3
      ) {
        res.status(400).json({
          message:
            "Tracking number must be a valid string with at least 3 characters",
        });
        return;
      }

      // Validate estimated delivery date
      const deliveryDate = new Date(estimatedDelivery);
      if (isNaN(deliveryDate.getTime())) {
        res.status(400).json({
          message: "Invalid estimated delivery date format",
        });
        return;
      }

      // Ensure delivery date is in the future
      if (deliveryDate <= new Date()) {
        res.status(400).json({
          message: "Estimated delivery date must be in the future",
        });
        return;
      }
    }

    // Validate note length if provided
    if (note && typeof note === "string" && note.length > 500) {
      res.status(400).json({
        message: "Note cannot exceed 500 characters",
      });
      return;
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Add shipping information for SHIPPED status
    if (status === "SHIPPED") {
      updateData.shippingInfo = {
        trackingNumber: trackingNumber.trim(),
        estimatedDelivery: new Date(estimatedDelivery),
        note: note ? note.trim() : "",
      };
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Send email notification if notifyCustomer is true
    if (notifyCustomer && order.user?.email) {
      try {
        const { html, text } = getOrderStatusEmail({
          customerName: order.user.userName,
          orderId,
          status,
          trackingNumber,
          estimatedDelivery: estimatedDelivery
            ? new Date(estimatedDelivery).toLocaleDateString()
            : undefined,
          note,
        });
        await sendEmail({
          to: order.user.email,
          subject: `Order Status Update - Order #${orderId}`,
          text,
          html,
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the entire request if email fails
      }
    }

    res.status(200).json({
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      message: "Failed to update order status. Please try again.",
    });
    return;
  }
};

// export const getOrderInvoice = async (req: Request, res: Response) => {
//   const { orderId } = req.params;
//   try {
//     // Fetch order with user
//     const order = await prisma.order.findUnique({
//       where: { id: orderId },
//       include: { user: true },
//     });
//     if (!order) {
//       res.status(404).json({ message: "Order not found" });
//       return;
//     }
//     // Only allow order owner or admin
//     if (
//       !req.user ||
//       (order.userId !== req.user.id && req.user.role !== "admin")
//     ) {
//       res.status(403).json({ message: "Not authorized to view this invoice" });
//       return;
//     }
//     // Build invoice data
//     const invoiceData = {
//       invoiceNumber: order.id,
//       orderDate: order.createdAt.toLocaleDateString(),
//       dueDate: undefined,
//       company: {
//         name: BUSINESS_CONFIG.company.name,
//         address: BUSINESS_CONFIG.company.address,
//         phone: BUSINESS_CONFIG.company.phone,
//         email: BUSINESS_CONFIG.company.email,
//         gst: BUSINESS_CONFIG.company.gst,
//         logo: BUSINESS_CONFIG.company.logo,
//       },
//       customer: {
//         name: order.user.userName,
//         email: order.user.email,
//         address: `${order.shippingAddress.addressLine}${
//           order.shippingAddress.apartment
//             ? ", " + order.shippingAddress.apartment
//             : ""
//         }, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${
//           order.shippingAddress.pincode
//         }`,
//         phone: order.shippingAddress.phone,
//       },
//       items: order.orderItems.map((item: any) => ({
//         name: item.name,
//         quantity: item.quantity,
//         price: item.price,
//         total: item.price * item.quantity,
//         size: item.size,
//         color: item.color,
//         hsn: item.hsn,
//         unit: item.unit,
//         mrp: item.mrp,
//         rate: item.rate,
//       })),
//       subtotal: order.subtotal,
//       shipping: order.shipping,
//       total: order.amount,
//       paymentMethod: order.paymentInfo.method,
//       status: order.status,
//     };
//     const { html, text } = getInvoiceHtmlAndText(invoiceData);
//     res.status(200).json({ html, text, invoiceData });
//     return;
//   } catch (error) {
//     console.error("Invoice generation failed:", error);
//     res.status(500).json({ message: "Failed to generate invoice" });
//     return;
//   }
// };

// export const sendOrderInvoiceEmail = async (orderId: string) => {
//   const order = await prisma.order.findUnique({
//     where: { id: orderId },
//     include: { user: true },
//   });
//   if (!order) throw new Error("Order not found");
//   const invoiceData = {
//     invoiceNumber: order.id,
//     orderDate: order.createdAt.toLocaleDateString(),
//     dueDate: undefined,
//     company: {
//       name: BUSINESS_CONFIG.company.name,
//       address: BUSINESS_CONFIG.company.address,
//       phone: BUSINESS_CONFIG.company.phone,
//       email: BUSINESS_CONFIG.company.email,
//       gst: BUSINESS_CONFIG.company.gst,
//       logo: BUSINESS_CONFIG.company.logo,
//     },
//     customer: {
//       name: order.user.userName,
//       email: order.user.email,
//       address: `${order.shippingAddress.addressLine}${
//         order.shippingAddress.apartment
//           ? ", " + order.shippingAddress.apartment
//           : ""
//       }, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${
//         order.shippingAddress.pincode
//       }`,
//       phone: order.shippingAddress.phone,
//     },
//     items: order.orderItems.map((item: any) => ({
//       name: item.name,
//       quantity: item.quantity,
//       price: item.price,
//       total: item.price * item.quantity,
//       size: item.size,
//       color: item.color,
//       hsn: item.hsn,
//       unit: item.unit,
//       mrp: item.mrp,
//       rate: item.rate,
//     })),
//     subtotal: order.subtotal,
//     shipping: order.shipping,
//     total: order.amount,
//     paymentMethod: order.paymentInfo.method,
//     status: order.status,
//   };
//   const { html, text } = getInvoiceHtmlAndText(invoiceData);
//   await sendEmail({
//     to: order.user.email,
//     subject: `Your Invoice for Order #${order.id}`,
//     text,
//     html,
//   });
// };

// GET /orders/:orderId/invoice/pdf
export const getOrderInvoicePdf = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  try {
    // Fetch order with user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    // Only allow order owner or admin
    // if (
    //   !req.user ||
    //   (order.userId !== req.user.id && req.user.role !== "admin")
    // ) {
    //   res.status(403).json({ message: "Not authorized to view this invoice" });
    //   return;
    // }
    // Build invoice data
    const invoiceData = {
      invoiceNumber: order.id,
      orderDate: order.createdAt.toLocaleDateString(),
      dueDate: undefined,
      company: {
        name: BUSINESS_CONFIG.company.name,
        address: BUSINESS_CONFIG.company.address,
        phone: BUSINESS_CONFIG.company.phone,
        email: BUSINESS_CONFIG.company.email,
        gst: BUSINESS_CONFIG.company.gst,
        logo: BUSINESS_CONFIG.company.logo,
      },
      customer: {
        name: order.user.userName,
        email: order.user.email,
        address: `${order.shippingAddress.addressLine}${order.shippingAddress.apartment
            ? ", " + order.shippingAddress.apartment
            : ""
          }, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode
          }`,
        phone: order.shippingAddress.phone,
      },
      items: order.orderItems.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        size: item.size,
        color: item.color,
        hsn: item.hsn,
        unit: item.unit,
        mrp: item.mrp,
        rate: item.rate,
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.amount,
      paymentMethod: order.paymentInfo.method,
      status: order.status,
    };
    const pdfBuffer = await generateInvoicePdf(invoiceData);
    console.log("PDF buffer length:", pdfBuffer.length);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${order.id}.pdf`
    );
    res.send(pdfBuffer);
    return;
  } catch (error) {
    console.error("Invoice PDF generation failed:", error);
    res.status(500).json({ message: "Failed to generate invoice PDF" });
    return;
  }
};
