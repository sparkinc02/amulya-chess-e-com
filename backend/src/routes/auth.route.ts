import express from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  sendEmailVerificationOtp,
  verifyEmail,
  googleLogin,
} from "@/controllers/auth.controller";
import { loginSchema, signupSchema } from "@/lib/schemas/auth.schema";
import { validateBody } from "@/lib/helpers/common.helper";

const router = express.Router();

router.post("/signup", validateBody(signupSchema), signup);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/send-otp", sendEmailVerificationOtp);
router.post("/verify-email", verifyEmail);
router.post("/google", googleLogin);
export { router as authRouter };
