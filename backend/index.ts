import express from "express";
import { authRouter } from "@/routes/auth.route";
import { productRouter } from "@/routes/product.route";
import { userRouter } from "@/routes/user.route";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { orderRouter } from "@/routes/order.route";
import { paymentRouter } from "@/routes/payment.route";
import { prisma } from "@/config/data-source";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || "http://localhost:8080";

// --- Middleware Setup ---
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_BASE_URL, // Support multiple origins
    credentials: true,
    exposedHeaders: ["X-Auth-Error"],
  })
);

// --- Routes ---
app.get("/health", async (req, res) => {
  try {
    await prisma.user.count(); // Use a simple query to check DB connection for MongoDB
    res.status(200).json({ status: "UP", database: "connected" });
  } catch (error) {
    console.error("Health check failed: Database connection error", error);
    res
      .status(500)
      .json({
        status: "DOWN",
        database: "disconnected",
        error: "Database connection failed",
      });
  }
});
app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/users", userRouter);
app.use("/orders", orderRouter);
app.use("/payments", paymentRouter);

// --- Centralized Error Handling Middleware ---
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(`Unhandled Error: ${err.message}`, err); // Log the full error for debugging
    const statusCode = err.statusCode || 500;
    const message = err.message || "An unexpected error occurred.";

    res.status(statusCode).json({
      status: "error",
      message,
    });
  }
);

// --- Server Startup ---
(async () => {
  try {
    await prisma.$connect();
    console.log("✔ Database connected successfully.");
    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"
        } mode.`
      );
    });
  } catch (error) {
    console.error(
      "✖ Failed to start server: Database connection error.",
      error
    );
    process.exit(1); // Exit with a non-zero code to indicate failure
  }
})();

// --- Graceful Shutdown ---
process.on("SIGINT", async () => {
  console.log("🔌 Shutting down server gracefully...");
  await prisma.$disconnect();
  console.log("✔ Database disconnected.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🔌 Shutting down server gracefully...");
  await prisma.$disconnect();
  console.log("✔ Database disconnected.");
  process.exit(0);
});
