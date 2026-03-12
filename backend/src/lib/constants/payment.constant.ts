export const REFUND_REASON = {
  ORDER_FAILURE: "order_creation_failed",
  // Other possible reasons:
  OUT_OF_STOCK: "product_out_of_stock",
  CUSTOMER_REQUEST: "customer_request",
  DUPLICATE_PAYMENT: "duplicate_payment",
  FRAUDULENT: "fraudulent_transaction",
  DISPUTE: "customer_dispute",
  CANCELLATION: "order_cancelled",
} as const;