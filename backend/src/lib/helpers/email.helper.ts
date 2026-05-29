import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import handlebars from "handlebars";
import { BUSINESS_CONFIG } from "@/lib/constants/invoice.constant";
import { toWords } from "number-to-words";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "onboarding@resend.dev";
const APP_NAME = process.env.APP_NAME || "Amulya Chess";

// Nodemailer Config (Current Fallback)
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

console.log(`[Email] Nodemailer initialized as primary for ${EMAIL_USER}`);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  attachments?: any[];
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments,
}: SendEmailOptions) => {
  console.log(
    `[Email] Request to send email to ${to} with subject: "${subject}"`,
  );

  // --- RESEND (ACTIVE) ---
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: `${APP_NAME} <${RESEND_FROM}>`,
        to,
        subject,
        text,
        html,
        attachments: attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          path: att.path,
          cid: att.cid,
        })),
      });
      if (error) throw error;
      console.log(`[Email] Resend completed. Message ID: ${data?.id}`);
      return data;
    } catch (err) {
      console.error("[Email] Resend failed, using fallback...", err);
    }
  }

  // --- NODEMAILER (ACTIVE) ---
  try {
    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: Array.isArray(to) ? to.join(",") : to,
      subject,
      text,
      html,
      attachments,
    });
    console.log(`[Email] Nodemailer sent. MessageId: ${info.messageId}`);
    return info;
  } catch (error: any) {
    console.error(`[Email] Error in Nodemailer:`, error);
    throw error;
  }
};

// --- Specialized Email Generators ---

export const getOrderConfirmationEmail = (order: {
  customerName: string;
  orderId: string;
  total: number | string;
  orderLink: string;
  estimatedDelivery?: string;
  address?: string;
}) => {
  const html = `
    <div style="background:#f4eede;padding:32px 0;min-height:100vh;font-family:'Playfair Display', 'Cormorant Garamond', serif;">
      <div style="max-width:480px;margin:0 auto;background:#fcfbf8;border-radius:16px;border:1px solid #d4a341;box-shadow:0 2px 12px #0001;padding:32px 24px 24px 24px;color:#3d2b1f;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;font-size:2rem;font-weight:700;color:#d4a341;letter-spacing:1px;font-family:'Playfair Display', serif;">${APP_NAME}</span>
        </div>
        <h2 style="color:#d4a341;margin-bottom:8px;font-family:'Playfair Display', serif;">Thank you for your order, ${
          order.customerName
        }!</h2>
        <p style="font-size:1.1rem;margin-bottom:16px;">Your order <strong>#${
          order.orderId
        }</strong> has been placed successfully.</p>
        <p style="font-size:1.1rem;margin-bottom:8px;">Total: <strong style="color:#ec4899;">₹${
          order.total
        }</strong></p>
        ${
          order.estimatedDelivery
            ? `<p style="margin-bottom:8px;">Estimated Delivery: <strong style="color:#ec4899;">${order.estimatedDelivery}</strong></p>`
            : ""
        }
        ${
          order.address
            ? `<p style="margin-bottom:16px;">Shipping Address: <span style="color:#130f40;">${order.address}</span></p>`
            : ""
        }
        <div style="text-align:center;margin:32px 0;">
          <a href="${
            order.orderLink
          }" style="background:#ec4899;color:white;padding:12px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:1.1rem;display:inline-block;">Track Order</a>
        </div>
        <p style="color:#897a6f;font-size:0.97rem;margin-bottom:0;">If you have any questions, reply to this email or contact our support team.</p>
      </div>
    </div>
  `;
  const text = `Thank you for your order, ${order.customerName}!
Order ID: #${order.orderId}
Total: ₹${order.total}
${
  order.estimatedDelivery
    ? `Estimated Delivery: ${order.estimatedDelivery}\n`
    : ""
}${order.address ? `Shipping Address: ${order.address}\n` : ""}Track Order: ${
    order.orderLink
  }`;
  return { html, text };
};

export const getOrderStatusEmail = (order: {
  customerName: string;
  orderId: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  note?: string;
}) => {
  const html = `
    <div style="background:#f4eede;padding:32px 0;min-height:100vh;font-family:'Playfair Display', 'Cormorant Garamond', serif;">
      <div style="max-width:480px;margin:0 auto;background:#fcfbf8;border-radius:16px;border:1px solid #d4a341;box-shadow:0 2px 12px #0001;padding:32px 24px 24px 24px;color:#3d2b1f;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;font-size:2rem;font-weight:700;color:#d4a341;letter-spacing:1px;font-family:'Playfair Display', serif;">${APP_NAME}</span>
        </div>
        <h2 style="color:#d4a341;margin-bottom:8px;font-family:'Playfair Display', serif;">Order Status Update</h2>
        <p style="font-size:1.1rem;margin-bottom:8px;">Dear ${
          order.customerName
        },</p>
        <p style="font-size:1.1rem;margin-bottom:8px;">Your order <strong>#${
          order.orderId
        }</strong> status has been updated to: <strong style="color:#d4a341;">${
          order.status
        }</strong></p>
        ${
          order.status === "SHIPPED" && order.trackingNumber
            ? `<p style="margin-bottom:8px;">Tracking Number: <strong style="color:#d4a341;">${order.trackingNumber}</strong></p>`
            : ""
        }
        ${
          order.estimatedDelivery
            ? `<p style="margin-bottom:8px;">Estimated Delivery: <strong style="color:#d4a341;">${order.estimatedDelivery}</strong></p>`
            : ""
        }
        ${
          order.note
            ? `<p style="margin-bottom:8px;">Note: <span style="color:#3d2b1f;">${order.note}</span></p>`
            : ""
        }
        <p style="color:#897a6f;font-size:0.97rem;margin-top:24px;">Thank you for shopping with ${APP_NAME}!</p>
      </div>
    </div>
  `;
  const text = `Dear ${order.customerName},\nYour order #${
    order.orderId
  } status has been updated to: ${order.status}\n${
    order.trackingNumber ? `Tracking Number: ${order.trackingNumber}\n` : ""
  }${
    order.estimatedDelivery
      ? `Estimated Delivery: ${order.estimatedDelivery}\n`
      : ""
  }${
    order.note ? `Note: ${order.note}\n` : ""
  }Thank you for shopping with ${APP_NAME}!`;
  return { html, text };
};

export const getPasswordResetEmail = (resetUrl: string) => {
  const html = `
    <div style="background:#f4eede;padding:32px 0;min-height:100vh;font-family:'Playfair Display', 'Cormorant Garamond', serif;">
      <div style="max-width:480px;margin:0 auto;background:#fcfbf8;border-radius:16px;border:1px solid #d4a341;box-shadow:0 2px 12px #0001;padding:32px 24px 24px 24px;color:#3d2b1f;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;font-size:2rem;font-weight:700;color:#d4a341;letter-spacing:1px;font-family:'Playfair Display', serif;">${APP_NAME}</span>
        </div>
        <h2 style="color:#d4a341;margin-bottom:8px;font-family:'Playfair Display', serif;">Password Reset Request</h2>
        <p style="font-size:1.1rem;margin-bottom:16px;">Click the button below to reset your password. This link will expire soon.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}" style="background:#d4a341;color:#fff;border:1px solid #d4a341;padding:12px 32px;text-decoration:none;font-weight:600;font-size:1.1rem;display:inline-block;text-transform:uppercase;letter-spacing:1px;font-family:'DM Mono', monospace;">Reset Password</a>
        </div>
        <p style="color:#897a6f;font-size:0.97rem;margin-bottom:0;">If you did not request this, please ignore this email.</p>
      </div>
    </div>
  `;
  const text = `Reset your password using this link: ${resetUrl}\nIf you did not request this, please ignore this email.`;
  return { html, text };
};

export const getPasswordResetOtpEmail = (otp: string) => {
  const html = `
    <div style="background:#f4eede;padding:32px 0;min-height:100vh;font-family:'Playfair Display', 'Cormorant Garamond', serif;">
      <div style="max-width:480px;margin:0 auto;background:#fcfbf8;border-radius:16px;border:1px solid #d4a341;box-shadow:0 2px 12px #0001;padding:32px 24px 24px 24px;color:#3d2b1f;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;font-size:2rem;font-weight:700;color:#d4a341;letter-spacing:1px;font-family:'Playfair Display', serif;">${APP_NAME}</span>
        </div>
        <h2 style="color:#d4a341;margin-bottom:8px;font-family:'Playfair Display', serif;">Password Reset Request</h2>
        <p style="font-size:1.1rem;margin-bottom:16px;">Your password reset verification code is:</p>
        <div style="text-align:center;margin:32px 0;">
          <span style="font-size:2.5rem;font-weight:700;color:#d4a341;letter-spacing:4px;font-family:monospace;">${otp}</span>
        </div>
        <p style="color:#897a6f;font-size:0.97rem;margin-bottom:24px;">This code will expire in 15 minutes.</p>
        <p style="color:#897a6f;font-size:0.97rem;margin-bottom:0;">If you did not request this, please ignore this email.</p>
      </div>
    </div>
  `;
  const text = `Your password reset verification code is ${otp}. It will expire in 15 minutes. If you did not request this, please ignore this email.`;
  return { html, text };
};


export const getOtpEmail = (otp: string) => {
  const html = `
    <div style="background:#f4eede;padding:32px 0;min-height:100vh;font-family:'Playfair Display', 'Cormorant Garamond', serif;">
      <div style="max-width:480px;margin:0 auto;background:#fcfbf8;border-radius:16px;border:1px solid #d4a341;box-shadow:0 2px 12px #0001;padding:32px 24px 24px 24px;color:#3d2b1f;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;font-size:2rem;font-weight:700;color:#d4a341;letter-spacing:1px;font-family:'Playfair Display', serif;">${APP_NAME}</span>
        </div>
        <h2 style="color:#d4a341;margin-bottom:8px;font-family:'Playfair Display', serif;">Your OTP Code</h2>
        <p style="font-size:1.1rem;margin-bottom:16px;">Your OTP is <strong style="color:#d4a341;">${otp}</strong>. It will expire in 10 minutes.</p>
      </div>
    </div>
  `;
  const text = `Your OTP is ${otp}. It will expire in 10 minutes.`;
  return { html, text };
};

export interface InvoiceData {
  invoiceNumber: string;
  orderDate: string;
  dueDate?: string;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gst?: string;
    logo?: string;
    signature?: string;
  };
  customer: {
    name: string;
    email: string;
    address: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
    size?: string;
    color?: string;
  }>;
  subtotal: number;
  shipping: number;
  gst?: number;
  total: number;
  paymentMethod: string;
  status: string;
  terms?: string[];
  signature?: string;
  qrCodeUrl?: string;
}

// --- Handlebars Invoice Template (Table-based for perfect PDF/print) ---
const INVOICE_TEMPLATE = `
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Inter', Arial, Helvetica, sans-serif; }
  .invoice-container {
    width: 794px;
    min-height: 1122px;
    margin: 0 auto;
    background: #fff;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border-radius: 18px;
    box-shadow: 0 8px 32px #0002;
    overflow: hidden;
  }
  .header-bar {
    background: linear-gradient(90deg, #d4a341 0%, #3d2b1f 100%);
    color: #fff;
    padding: 32px 32px 18px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .header-bar .logo {
    width: 64px;
    height: 64px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    color: #d4a341;
    border: 2px solid #fff;
    overflow: hidden;
    margin-right: 18px;
  }
  .header-bar .company-info {
    flex: 1;
  }
  .header-bar .company-info h1 {
    font-size: 26px;
    font-weight: 700;
    margin: 0 0 2px 0;
    letter-spacing: 0.5px;
    color: #fff;
  }
  .header-bar .company-details {
    font-size: 13px;
    color: #f4eede;
    line-height: 1.5;
  }
  .header-bar .invoice-title {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 1px;
    background: #fff2;
    padding: 10px 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px #0001;
    text-shadow: 0 1px 2px #0002;
  }
  .section {
    padding: 24px 32px 0 32px;
    display: flex;
    gap: 32px;
    background: #fafafa;
    margin-bottom:10px;
  }
  .section .bill-to, .section .invoice-details {
    flex: 1;
    font-size: 14px;
  }
  .section .bill-to h3, .section .invoice-details h3 {
    font-size: 14px;
    font-weight: 700;
    color: #d4a341;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
  }
  .section .bill-to p, .section .invoice-details p {
    margin: 2px 0;
    color: #444;
  }
  .section .invoice-details .badge {
    display: inline-block;
    background: #22c55e;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    border-radius: 8px;
    padding: 3px 12px;
    margin-top: 4px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .section .invoice-details .badge.unpaid {
    background: #f59e42;
  }
  .section .invoice-details .badge.cancelled {
    background: #ef4444;
  }
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0;
    font-size: 13px;
    background: #fff;
    border: 1.5px solid #d4a341;
    page-break-inside: auto;
    box-shadow: 0 2px 8px #d4a84333;
  }
  .items-table-header th {
    background: linear-gradient(90deg, #fcfbf8 0%, #f4eede 100%);
    color: #3d2b1f;
    padding: 12px 8px;
    text-align: left;
    font-size: 13px;
    font-weight: 700;
    border-right: 1px solid #d4a341;
    border-bottom: 2px solid #d4a341;
  }
  .items-table-header th:last-child {
    border-right: none;
  }
  .items-table-row:nth-child(even) {
    background: #fcfbf8;
  }
  .items-table-row td {
    padding: 10px 8px;
    border-bottom: 1px solid #e1be71;
    border-right: 1px solid #e1be71;
    font-size: 13px;
    color: #222;
    font-weight: 400;
    vertical-align: top;
  }
  .items-table-row td:last-child {
    border-right: none;
    text-align: right;
    font-weight: 600;
  }
  .items-table-row td.center {
    text-align: center;
  }
  .items-table-row td.right {
    text-align: right;
  }
  .summary-section {
    display: flex;
    justify-content: center;
    gap: 24px;
    padding: 24px 32px 0 32px;
    background: #fafafa;
    font-size: 14px;
    page-break-inside: avoid;
  }
  .summary-table {
    min-width: 280px;
    font-size: 14px;
    border-collapse: collapse;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px #d4a84333;
    overflow: hidden;
  }
  .summary-table td {
    padding: 8px 6px;
  }
  .summary-table .label {
    text-align: left;
    color: #222;
    font-weight: 400;
    padding-right: 12px;
  }
  .summary-table .value {
    color: #3d2b1f;
    min-width: 90px;
    text-align: right;
    font-weight: 700;
  }
  .summary-table .total-row {
    font-size: 18px;
    border-top: 2px solid #3d2b1f;
    border-bottom: 2px solid #3d2b1f;
    padding-top: 10px;
    margin: 10px 0px;
    font-weight: 900;
    background: linear-gradient(90deg, #fcfbf8 0%, #f4eede 100%);
    color: #3d2b1f;
  }
  .summary-table .amount-words {
    color: #d4a341;
    font-style: italic;
    text-align: right;
    font-size: 13px;
  }
  .summary-table .status-row .value {
    color: #22c55e;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .summary-table .status-row .value.unpaid {
    color: #f59e42;
  }
  .summary-table .status-row .value.cancelled {
    color: #ef4444;
  }
  .qr-section {
    margin-top: 18px;
    text-align: right;
  }
  .qr-section img {
    width: 90px;
    height: 90px;
    border: 1.5px solid #d4a341;
    border-radius: 12px;
    background: #fff;
    padding: 6px;
  }
  .bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    padding: 0 32px 32px 32px;
    gap: 0;
    margin-top: 0;
    min-height: 120px;
    page-break-inside: avoid;
  }
  .terms-section {
    flex: 2;
    font-size: 13px;
    color: #444;
    padding: 14px 28px 0 0;
    margin-right: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .terms-section h4 {
    font-weight: 700;
    margin-bottom: 8px;
    color: #d4a341;
    letter-spacing: 0.5px;
    font-size: 14px;
  }
  .terms-section ol {
    margin-left: 18px;
    padding-left: 0;
  }
  .signature-section {
    flex: 1;
    text-align: right;
    padding: 14px 0 0 28px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .signature-box {
    width: 140px;
    height: 48px;
    border: 1.5px solid #d4a341;
    margin-left: auto;
    margin-bottom: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-style: italic;
    font-size: 16px;
    color: #d4a341;
    background: #fafafa;
    font-weight: 500;
    border-radius: 8px;
  }
  .signature-text {
    font-size: 12px;
    font-weight: 700;
    color: #d4a341;
  }
  .footer {
    width: 100%;
    background: #f4eede;
    color: #3d2b1f;
    text-align: center;
    font-size: 13px;
    padding: 12px 0 8px 0;
    border-top: 2px solid #d4a341;
    margin-top: 18px;
    letter-spacing: 0.5px;
  }
  @media print {
    body { -webkit-print-color-adjust: exact !important; }
    .invoice-container { width: 794px; min-height: 1122px; }
    .summary-section, .bottom-row { page-break-inside: avoid; }
  }
</style>
<!-- Puppeteer PDF config: { format: 'A4', printBackground: true, margin: {top: 0, right: 0, bottom: 0, left: 0} } -->
<div class="invoice-container">
  <div class="header-bar">
    <div style="display: flex; align-items: center;">
      <div class="logo">
        {{#if company.logo}}
          <img src="{{company.logo}}" alt="Logo" style="max-width: 100%; max-height: 100%;" />
        {{else}}
          {{company.name.[0]}}
        {{/if}}
      </div>
      <div class="company-info">
        <h1>{{company.name}}</h1>
        <div class="company-details">
          {{company.address}}<br>
          <b>Mobile:</b> {{company.phone}}<br>
          <b>Email:</b> {{company.email}}<br>
          {{#if company.gst}}<b>GST:</b> {{company.gst}}<br>{{/if}}
        </div>
      </div>
    </div>
    <div class="invoice-title">INVOICE</div>
  </div>
  <div class="section">
    <div class="bill-to">
      <h3>BILL TO :</h3>
      <p><strong>{{customer.name}}</strong></p>
      <p>{{customer.address}}</p>
      <p>Mobile: {{customer.phone}}</p>
      <p>Email: {{customer.email}}</p>
    </div>
    <div class="invoice-details">
      <h3>INVOICE DETAILS</h3>
      <p><b>Invoice Number:</b> {{invoiceNumber}}</p>
      <p><b>Invoice Date:</b> {{orderDate}}</p>
      {{#if dueDate}}<p><b>Due Date:</b> {{dueDate}}</p>{{/if}}
      <p><b>Payment Method:</b> {{paymentMethod}}</p>
      <span class="badge {{status}}">{{status}}</span>
    </div>
  </div>
  <table class="items-table">
    <thead>
      <tr class="items-table-header">
        <th>NAME</th>
        <th>QUANTITY</th>
        <th>PRICE</th>
        <th>COLOR</th>
        <th>SIZE</th>
        <th>TOTAL</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr class="items-table-row">
        <td>{{name}}</td>
        <td class="center">{{quantity}}</td>
        <td class="right">₹{{price}}</td>
        <td class="center">{{color}}</td>
        <td class="center">{{size}}</td>
        <td class="right">₹{{total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  <div class="summary-section">
    <table class="summary-table">
      <tr><td class="label"><b>Subtotal :</b></td><td class="value">₹ {{subtotal}}</td></tr>
      <tr><td class="label"><b>Shipping :</b></td><td class="value">₹ {{shipping}}</td></tr>
      {{#if gst}}
      <tr><td class="label"><b>GST (18%) :</b></td><td class="value">₹ {{gst}}</td></tr>
      {{/if}}
      <tr class="total-row"><td class="label"><b>Total :</b></td><td class="value">₹ {{total}}</td></tr>
      <tr><td class="label"><b>Amount in Words :</b></td><td class="value amount-words">{{amountInWords}}</td></tr>
    </table>
    <div class="qr-section">
      {{#if qrCodeUrl}}
        <img src="{{qrCodeUrl}}" alt="QR Code" />
        <div style="font-size:11px;color:#d4a341;margin-top:4px;">Scan for order info</div>
      {{/if}}
    </div>
  </div>
  <div class="bottom-row">
    <div class="terms-section">
      <h4>TERMS AND CONDITIONS</h4>
      <ol>
        {{#each terms}}
        <li>{{this}}</li>
        {{/each}}
      </ol>
    </div>
    <div class="signature-section">
      <div class="signature-box">
        {{#if company.signature}}
          <img src="{{company.signature}}" alt="Signature" style="max-height: 44px; max-width: 120px; object-fit: contain; display: block; margin: 0 auto;" />
        {{else}}
          {{signature}}
        {{/if}}
      </div>
      <div class="signature-text">
        AUTHORISED SIGNATORY FOR<br>
        {{company.name}}
      </div>
    </div>
  </div>
  <div class="footer">
    For support, contact us at <b>{{company.email}}</b> or <b>{{company.phone}}</b> &mdash; Thank you for shopping with {{company.name}}!
  </div>
</div>
`;

// --- Handlebars Invoice Renderer ---
function renderInvoiceHtml(
  data: InvoiceData & { amountInWords: string },
): string {
  const template = handlebars.compile(INVOICE_TEMPLATE);
  return template(data);
}

// --- Invoice Data Mapper (MUST match the template fields exactly) ---
function mapInvoiceData(
  raw: InvoiceData,
): InvoiceData & { amountInWords: string } {
  const config = BUSINESS_CONFIG;
  const items = (raw.items || []).map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    color: item.color || "-",
    size: item.size || "-",
    total: item.price * item.quantity,
  }));
  const subtotal = raw.subtotal;
  const total = raw.total;
  return {
    ...raw,
    company: {
      ...config.company,
      ...raw.company,
    },
    items,
    subtotal,
    shipping: raw.shipping,
    gst: raw.gst,
    total,
    amountInWords:
      toWords(Number(total)).replace(/\b\w/g, (c: string) => c.toUpperCase()) +
      " Rupees Only",
    terms: raw.terms || config.terms,
    signature: raw.signature || "Signature",
  };
}

// --- Invoice HTML/Text Generator ---
export function getInvoiceHtmlAndText(invoice: InvoiceData) {
  const mapped = mapInvoiceData(invoice);
  const html = renderInvoiceHtml(mapped);
  const text = `Invoice #${mapped.invoiceNumber}\nCustomer: ${mapped.customer.name}\nTotal: ₹${mapped.total}`;
  return { html, text };
}

export async function generateInvoicePdf(invoice: any): Promise<Buffer> {
  const { html } = getInvoiceHtmlAndText(invoice);

  // Force Puppeteer to use its own Chromium
  const browser = await puppeteer.launch({
    executablePath: puppeteer.executablePath(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  return Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
}
