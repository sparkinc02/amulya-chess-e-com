// controllers/payment.controller.ts
import { validateCartItems } from "@/lib/helpers/common.helper";
import { validateRazorpaySignature } from "@/lib/helpers/payment.helper";
import type { VerifyPaymentRequestBody } from "@/lib/types";
import type { Request, Response } from "express";
import { prisma } from "@/config/data-source";
// import { razorpay } from "@/config/razorpay-config";
import { REFUND_REASON } from "@/lib/constants/payment.constant";
import {
  sendEmail,
  getOrderConfirmationEmail,
  getInvoiceHtmlAndText,
  generateInvoicePdf,
} from "@/lib/helpers/email.helper";
import type { OrderItem } from "generated/prisma";
import { BUSINESS_CONFIG } from "@/lib/constants/invoice.constant";

const SUPPORT_CONTACT = {
  EMAIL: process.env.SUPPORT_EMAIL || "support@yourstore.com",
  PHONE: process.env.SUPPORT_PHONE || "+1 (800) 123-4567",
  BUSINESS_HOURS: "9AM-6PM, Monday to Friday",
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@yourstore.com";

export const verifyPayment = async (
  req: Request<{}, {}, VerifyPaymentRequestBody>,
  res: Response
) => {
  const startTime = Date.now();
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems,
      address,
      saveInfo,
      subtotal: clientSubtotal,
      shipping: clientShipping,
      total: clientTotal,
    } = req.body;

    // 1. Validate payment signature
    const signatureValidation = validateRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (
      typeof signatureValidation === "object" &&
      "error" in signatureValidation
    ) {
      return res.status(signatureValidation.statusCode).json({
        message: `Payment verification failed: ${signatureValidation.error}`,
      });
    }

    if (!signatureValidation) {
      return res.status(400).json({
        message:
          "Invalid payment signature. Please contact support if this persists.",
        contact: SUPPORT_CONTACT,
      });
    }

    // 2. Validate user authentication
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Your session has expired. Please login and try again.",
      });
    }
    const userId = req.user.id;

    // 3. Validate cart items (moved inside transaction)

    // 4. Verify calculated amounts match client amounts (will be done after validation inside transaction)

    // 5. Verify payment capture status with Razorpay
    let payment;
    try {
      // payment = await razorpay.payments.fetch(razorpay_payment_id);

      // if (payment.status !== "captured") {
      //   return res.status(400).json({
      //     message: `Payment not completed. Status: ${payment.status}. No amount has been charged.`,
      //     actionRequired: "Try the payment again or contact support",
      //   });
      // }
    } catch (error: any) {
      return res.status(500).json({
        message:
          "We couldn't verify your payment status. Please contact support to confirm.",
        contact: SUPPORT_CONTACT,
      });
    }

    // 6. Process order creation with transaction
    var orderItems: any[] | undefined,
      calculatedSubtotal: number | undefined,
      calculatedShipping: number | undefined,
      calculatedTotal: number | undefined;
    try {
      const newOrder = await prisma.$transaction(async (tx) => {
        // Validate cart items inside transaction
        const cartValidation = await validateCartItems(
          cartItems,
          address.state
        );
        if (typeof cartValidation === "object" && "error" in cartValidation) {
          throw new Error(`Cart validation failed: ${cartValidation.error}`);
        }
        orderItems = cartValidation.orderItems;
        calculatedSubtotal = cartValidation.calculatedSubtotal;
        calculatedShipping = cartValidation.calculatedShipping;
        calculatedTotal = cartValidation.calculatedTotal;

        // Verify calculated amounts match client amounts
        if (
          clientSubtotal !== calculatedSubtotal ||
          clientShipping !== calculatedShipping ||
          clientTotal !== calculatedTotal
        ) {
          throw new Error(
            "Your cart has changed during checkout. Please review and try again."
          );
        }

        // Fetch all products in single query
        const productIds = orderItems.map((item) => item.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            stock: true,
            name: true,
          },
        });

        const productMap = new Map(products.map((p) => [p.id, p]));

        // Parallel stock validation
        await Promise.all(
          orderItems.map(async (item) => {
            const product = productMap.get(item.productId);
            if (!product) {
              throw new Error(`Product no longer available: ${item.productId}`);
            }

            if ((product.stock ?? 0) < item.quantity) {
              throw new Error(
                `Insufficient stock for ${product.name}. ` +
                `Available: ${product.stock}, Requested: ${item.quantity}`
              );
            }
          })
        );

        // Parallel stock updates
        await Promise.all(
          orderItems.map((item) =>
            tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          )
        );

        // Prepare order items for database
        const orderItemsForDb = orderItems.map(
          ({ itemTotal, ...rest }) => rest
        );

        // Create order record
        return await tx.order.create({
          data: {
            userId,
            orderItems: orderItemsForDb,
            shippingAddress: {
              addressLine: address.addressLine,
              apartment: address.apartment || "",
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              phone: address.phone,
            },
            amount: calculatedTotal!,
            subtotal: calculatedSubtotal!,
            shipping: calculatedShipping!,
            status: "ORDER_PLACED",
            paymentInfo: {
              paymentId: razorpay_payment_id,
              status: "Paid",
              method: "Unknown",
            },
            isPaid: true,
            paidAt: new Date(),
          },
        });
      });

      // Ensure variables are defined
      if (
        !orderItems ||
        calculatedSubtotal === undefined ||
        calculatedShipping === undefined ||
        calculatedTotal === undefined
      ) {
        throw new Error("Order calculation failed. Please try again.");
      }

      // 7. Update user address if requested (non-blocking)
      if (saveInfo) {
        prisma.user
          .update({
            where: { id: userId },
            data: {
              address: {
                addressLine: address.addressLine,
                apartment: address.apartment || "",
                city: address.city,
                state: address.state,
                pincode: address.pincode,
              },
            },
          })
          .catch((e) => console.error("Address save failed:", e));
      }

      // 8. Parallel non-blocking emails
      const orderLink = `${process.env.FRONTEND_BASE_URL}/profile?tab=orders`;
      const estimatedDelivery = new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      ).toLocaleDateString();

      // Build invoice data (moved up to fix linter error)
      const invoiceData = {
        invoiceNumber: newOrder.id,
        orderDate: newOrder.createdAt.toLocaleDateString(),
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
          name: req.user.name || req.user.email,
          email: req.user.email,
          address: `${address.addressLine}${address.apartment ? ", " + address.apartment : ""
            }, ${address.city}, ${address.state} - ${address.pincode}`,
          phone: address.phone,
        },
        items: orderItems.map((item: any) => ({
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
        subtotal: calculatedSubtotal!,
        shipping: calculatedShipping!,
        total: calculatedTotal!,
        paymentMethod: "Unknown",
        status: newOrder.status,
      };
      const { html: invoiceHtml, text: invoiceText } =
        getInvoiceHtmlAndText(invoiceData);
      const pdfBuffer = await generateInvoicePdf(invoiceData);

      // Improved HTML email for customer
      const customerEmailHtml = `
        <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:sans-serif;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 12px #0001;padding:32px 24px 24px 24px;">
            <div style="text-align:center;margin-bottom:24px;">
              <span style="display:inline-block;font-size:2rem;font-weight:700;color:#ec4899;letter-spacing:1px;">${BUSINESS_CONFIG.company.name
        }</span>
            </div>
            <h2 style="color:#ec4899;margin-bottom:8px;">Thank you for your order!</h2>
            <p style="font-size:1.1rem;margin-bottom:16px;">Hi <b>${req.user.name || req.user.email
        }</b>,<br>Your order <strong>#$${newOrder.id
        }</strong> has been placed successfully.</p>
            <ul style="padding-left:18px;margin-bottom:16px;">
              <li><b>Total:</b> <span style="color:#ec4899;">₹${calculatedTotal!}</span></li>
              <li><b>Estimated Delivery:</b> <span style="color:#ec4899;">${estimatedDelivery}</span></li>
              <li><b>Shipping Address:</b> <span style="color:#130f40;">${address.addressLine
        }${address.apartment ? ", " + address.apartment : ""}, ${address.city
        }, ${address.state} - ${address.pincode}</span></li>
            </ul>
            <div style="text-align:center;margin:32px 0;">
              <a href="${orderLink}" style="background:#ec4899;color:white;padding:12px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:1.1rem;display:inline-block;">Track Order</a>
            </div>
            <h3 style="color:#ec4899;margin-bottom:8px;">Order Summary</h3>
            <table style="border-collapse: collapse; width: 100%;margin-bottom:16px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #ec4899; padding: 8px; background:#fdf2f8;color:#ec4899;">Item</th>
                  <th style="border: 1px solid #ec4899; padding: 8px; background:#fdf2f8;color:#ec4899;">Qty</th>
                  <th style="border: 1px solid #ec4899; padding: 8px; background:#fdf2f8;color:#ec4899;">Price</th>
                  <th style="border: 1px solid #ec4899; padding: 8px; background:#fdf2f8;color:#ec4899;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems
          .map(
            (item: any) => `
                  <tr>
                    <td style="border: 1px solid #ec4899; padding: 8px;">${item.name
              }${item.size ? ` (${item.size})` : ""}${item.color ? `, ${item.color}` : ""
              }</td>
                    <td style="border: 1px solid #ec4899; padding: 8px; text-align:center;">${item.quantity
              }</td>
                    <td style="border: 1px solid #ec4899; padding: 8px;">₹${item.price
              }</td>
                    <td style="border: 1px solid #ec4899; padding: 8px;">₹${item.price * item.quantity
              }</td>
                  </tr>
                `
          )
          .join("")}
              </tbody>
            </table>
            <p style="color:#6b7280;font-size:0.97rem;margin-bottom:0;">If you have any questions, reply to this email or contact our support team at <a href="mailto:${SUPPORT_CONTACT.EMAIL
        }" style="color:#ec4899;">${SUPPORT_CONTACT.EMAIL}</a> or call ${SUPPORT_CONTACT.PHONE
        } (${SUPPORT_CONTACT.BUSINESS_HOURS}).</p>
            <p style="color: #888; font-size: 12px; margin-top: 16px;">Thank you for choosing us!</p>
          </div>
        </div>
      `;

      // Improved HTML email for admin
      const adminEmailHtml = `
        <div style="background:#f8fafc;padding:32px 0;min-height:100vh;font-family:sans-serif;">
          <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 12px #0001;padding:32px 24px 24px 24px;">
            <div style="text-align:center;margin-bottom:24px;">
              <span style="display:inline-block;font-size:2rem;font-weight:700;color:#ec4899;letter-spacing:1px;">${BUSINESS_CONFIG.company.name
        }</span>
            </div>
            <h2 style="color:#ec4899;margin-bottom:8px;">New Order Placed</h2>
            <ul style="padding-left:18px;margin-bottom:16px;">
              <li><b>Order ID:</b> <span style="color:#ec4899;">${newOrder.id
        }</span></li>
              <li><b>User:</b> ${req.user.email} (ID: ${userId})</li>
              <li><b>Payment ID:</b> ${razorpay_payment_id}</li>
              <li><b>Amount:</b> <span style="color:#ec4899;">₹${calculatedTotal!}</span></li>
              <li><b>Shipping Address:</b> <span style="color:#130f40;">${address.addressLine
        }${address.apartment ? ", " + address.apartment : ""}, ${address.city
        }, ${address.state}, ${address.pincode}</span></li>
              <li><b>Order Time:</b> ${new Date().toLocaleString()}</li>
            </ul>
            <h3 style="color:#ec4899;margin-bottom:8px;">Order Items</h3>
            <table style="border-collapse: collapse; width: 100%;margin-bottom:16px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #ec4899; padding: 8px; background:#fdf2f8;color:#ec4899;">Item</th>
                  <th style="border: 1px solid #ec4899; padding: 8px; background:#fdf2f8;color:#ec4899;">Qty</th>
                  <th style="border: 1px solid #ec4899; padding: 8px; background:#fdf2f8;color:#ec4899;">Price</th>
                  <th style="border: 1px solid #ec4899; padding: 8px; background:#fdf2f8;color:#ec4899;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems
          .map(
            (item: any) => `
                  <tr>
                    <td style="border: 1px solid #ec4899; padding: 8px;">${item.name
              }${item.size ? ` (${item.size})` : ""}${item.color ? `, ${item.color}` : ""
              }</td>
                    <td style="border: 1px solid #ec4899; padding: 8px; text-align:center;">${item.quantity
              }</td>
                    <td style="border: 1px solid #ec4899; padding: 8px;">₹${item.price
              }</td>
                    <td style="border: 1px solid #ec4899; padding: 8px;">₹${item.price * item.quantity
              }</td>
                  </tr>
                `
          )
          .join("")}
              </tbody>
            </table>
            <p style="color: #888; font-size: 12px; margin-top: 16px;">Please process the order promptly.</p>
          </div>
        </div>
      `;

      const emailPromises = [
        sendEmail({
          to: ADMIN_EMAIL,
          subject: `New Order Received - #${newOrder.id}`,
          html: adminEmailHtml,
          text: `New order #${newOrder.id} placed by ${req.user.email
            }. Total: ₹${calculatedTotal!}.`,
        }),
        sendEmail({
          to: req.user.email,
          subject: "Your Order Confirmation & Invoice",
          html: customerEmailHtml,
          text: `Thank you for your order #${newOrder.id
            }. Total: ₹${calculatedTotal!}. Estimated delivery: ${estimatedDelivery}.`,
          attachments: [
            {
              filename: `Invoice-${newOrder.id}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        }),
      ];

      Promise.allSettled(emailPromises).then((results) => {
        results.forEach((result, i) => {
          if (result.status === "rejected") {
            console.error(
              `Email ${i === 0 ? "admin" : "customer"} failed:`,
              result.reason
            );
          }
        });
      });

      // 9. Return success response with performance metrics
      return res.status(201).json({
        message: "Order placed successfully!",
        data: {
          orderId: newOrder.id,
          paymentId: razorpay_payment_id,
          estimatedDelivery: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          processingTime: `${Date.now() - startTime}ms`,
        },
      });
    } catch (error: any) {
      // 10. Handle transaction failure with automatic refund

      try {
        // const refund = await razorpay.payments.refund(razorpay_payment_id, {
        //   amount: payment.amount, // Convert to paise
        //   speed: "normal",
        //   notes: {
        //     reason: REFUND_REASON.ORDER_FAILURE,
        //     userId: userId,
        //     error: error.message.substring(0, 100),
        //   },
        // });

        // Improved HTML refund email for customer
        const refundEmailHtml = `
          <div style=\"font-family: Arial, sans-serif; color: #222;\">
            <h2 style=\"color: #c62828;\">Refund Initiated</h2>
            <p>Dear <b>${req.user.name || req.user.email}</b>,</p>
            <p>We couldn't process your order, but we've initiated your refund.</p>
            <ul>
              <li><b>Refund ID:</b></li>
              <li><b>Amount:</b> ₹${clientTotal ?? "unknown"}</li>
              <li><b>Expected in:</b> 5-7 business days</li>
            </ul>
            <p>If you have any questions, contact us at <a href=\"mailto:${SUPPORT_CONTACT.EMAIL
          }\">${SUPPORT_CONTACT.EMAIL}</a> or call ${SUPPORT_CONTACT.PHONE
          } (${SUPPORT_CONTACT.BUSINESS_HOURS}).</p>
          </div>
        `;

        // Non-blocking refund email
        sendEmail({
          to: req.user.email,
          subject: "Your Refund Initiation",
          html: refundEmailHtml,
          text: `Refund initiated for order. Refund ID:, Amount: ₹${clientTotal ?? "unknown"
            }. Expected in 5-7 business days.`,
        }).catch((e) => console.error("Refund email failed:", e));

        return res.status(500).json({
          message:
            "We couldn't complete your order, but we've initiated your refund",
          details: {
            // refundId: refund.id,
            amountRefunded: clientTotal ?? 0,
            contact: SUPPORT_CONTACT,
            expectedRefundTime: "5-7 business days",
          },
        });
      } catch (refundError: any) {
        // Prepare critical error details
        console.log("Refund failed:", refundError);

        const errorCode = `PAY-ERR-${Date.now().toString(36).slice(-6)}`;

        // Improved HTML critical failure email for admin
        const criticalEmailHtml = `
          <div style=\"font-family: Arial, sans-serif; color: #222;\">
            <h2 style=\"color: #c62828;\">URGENT: Payment processed but order and refund failed</h2>
            <ul>
              <li><b>User ID:</b> ${userId}</li>
              <li><b>Payment ID:</b> ${razorpay_payment_id}</li>
              <li><b>Amount:</b> ₹${clientTotal ?? "unknown"}</li>
              <li><b>Error Code:</b> ${errorCode}</li>
            </ul>
            <h3>Order Error:</h3>
            <pre>${error.message}</pre>
            <h3>Refund Error:</h3>
            <pre>${refundError.message}</pre>
            <p>Required Actions:</p>
            <ol>
              <li>Manually process refund for payment ${razorpay_payment_id}</li>
              <li>Contact customer ${req.user?.email || "No email"}</li>
            </ol>
          </div>
        `;

        // Non-blocking admin alert
        sendEmail({
          to: ADMIN_EMAIL,
          subject: "CRITICAL: Order & Refund Failure",
          html: criticalEmailHtml,
          text: `CRITICAL: Order and refund failed for user ${userId}, payment ${razorpay_payment_id}, amount ₹${clientTotal ?? "unknown"
            }. Error code: ${errorCode}.`,
        }).catch((e) => console.error("Admin alert failed:", e));

        // User message for critical failure
        return res.status(500).json({
          urgent: true,
          message: "We're experiencing technical difficulties with your order",
          instructions: `Please contact our support team immediately with this code: ${errorCode}`,
          contact: SUPPORT_CONTACT,
          reference: `UID-${userId.slice(0, 6)}`,
        });
      }
    }
  } catch (error: any) {
    return res.status(500).json({
      message: "An unexpected error occurred during payment processing",
      systemError: error.message,
      contact: SUPPORT_CONTACT,
    });
  }
};
