import type { Request, Response, RequestHandler } from "express";

import { AUTH_CONSTANTS } from "@/lib/constants/auth.constant";
import {
  hashPassword,
  generateToken,
  generateRefreshToken,
  comparePassword,
  verifyToken,
} from "@/lib/helpers/auth.helper";
import { omitUserPrivateFields } from "@/lib/helpers/common.helper";
import { prisma } from "@/config/data-source";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  sendEmail,
  getPasswordResetEmail,
  getOtpEmail,
} from "@/lib/helpers/email.helper";
import { OAuth2Client } from "google-auth-library";
const MODE = process.env.MODE;

export const signup: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, userName, password, phone } = req.body;

    if (!email || !userName || !password) {
      res.status(400).json({
        message:
          "Missing required fields. Please provide email, username, and password.",
      });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({
        message:
          "An account with this email address already exists. Please try logging in instead.",
      });
      return;
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        userName,
        password: hashed,
        role: "user",
      },
    });

    const accessToken = generateToken(user.id.toString());
    if (typeof accessToken === "object" && "error" in accessToken) {
      res.status(accessToken.statusCode).json({
        message: accessToken.error,
      });
      return;
    }
    const refreshToken = generateRefreshToken();
    const refreshTokenExpiresAt = new Date(
      Date.now() + AUTH_CONSTANTS.SEVEN_DAYS_VALUE
    );

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      include: { orders: { orderBy: { createdAt: 'desc' } } },
      data: { refreshToken, refreshTokenExpiresAt },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: MODE !== "dev", // true in production; false in dev
      sameSite: MODE !== "dev" ? "none" : "lax",
      maxAge: AUTH_CONSTANTS.SEVEN_DAYS_VALUE,
      ...(MODE !== "dev" && { domain: ".onrender.com" }), // only for prod
    });

    res.status(201).json({
      message: `Welcome ${user.userName}! Your account has been created successfully. You are now logged in.`,
      data: {
        user: omitUserPrivateFields(updatedUser),
        accessToken,
        tokenExpiresIn: "15 minutes",
      },
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

export const login: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Please provide both email and password to log in.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { orders: { orderBy: { createdAt: 'desc' } } },
    });
    if (!user) {
      res.status(401).json({
        message:
          "We couldn't find an account with that email address. Please check your email or sign up for a new account.",
      });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        message:
          "The password you entered is incorrect. Please try again or reset your password if you've forgotten it.",
      });
      return;
    }

    const accessToken = generateToken(user.id.toString());
    if (typeof accessToken === "object" && "error" in accessToken) {
      res.status(accessToken.statusCode).json({
        message: accessToken.error,
      });
      return;
    }
    const refreshToken = generateRefreshToken();
    const refreshTokenExpiresAt = new Date(
      Date.now() + AUTH_CONSTANTS.SEVEN_DAYS_VALUE
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, refreshTokenExpiresAt },
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: MODE !== "dev", // true in production; false in dev
      sameSite: MODE !== "dev" ? "none" : "lax",
      maxAge: AUTH_CONSTANTS.SEVEN_DAYS_VALUE,
    });

    res.status(200).json({
      message: `Welcome back, ${user.userName}! You have been logged in successfully.`,
      data: {
        user: omitUserPrivateFields(user),
        orders: user.orders,
        accessToken,
      },
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

export const refreshToken: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      message: "Session expired. Please log in again to continue.",
    });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        refreshToken,
        refreshTokenExpiresAt: { gt: new Date() },
      },
      include: { orders: { orderBy: { createdAt: 'desc' } } },
    });

    if (!user) {
      res.status(401).json({
        message: "Your session has expired. Please log in again to continue.",
      });
      return;
    }

    const newAccessToken = generateToken(user.id.toString());
    if (typeof newAccessToken === "object" && "error" in newAccessToken) {
      res.status(newAccessToken.statusCode).json({
        message: newAccessToken.error,
      });
      return;
    }
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenExpiresAt = new Date(
      Date.now() + AUTH_CONSTANTS.SEVEN_DAYS_VALUE
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: newRefreshTokenExpiresAt,
      },
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: MODE !== "dev", // true in production; false in dev
      sameSite: MODE !== "dev" ? "none" : "lax",
      maxAge: AUTH_CONSTANTS.SEVEN_DAYS_VALUE,
    });

    res.status(200).json({
      message:
        "Session refreshed successfully. You can continue using the application.",
      data: {
        user: omitUserPrivateFields(user),
        accessToken: newAccessToken,
      },
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

export const logout: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(200).json({
      message: "You have been logged out successfully.",
    });
    return;
  }

  try {
    await prisma.user.updateMany({
      where: { refreshToken },
      data: { refreshToken: null, refreshTokenExpiresAt: null },
    });

    res.clearCookie("refreshToken");
    res.status(200).json({
      message: "You have been logged out successfully.",
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: "Logout failed. Please try again.",
    });
    return;
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 1. Generate JWT token (expires in 15 mins)
    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        message: "Server configuration error: JWT secret missing.",
      });
      return;
    }
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // 2. Construct reset URL
    const resetUrl = `${process.env.FRONTEND_BASE_URL}/reset-password/${token}`;
    const { html, text } = getPasswordResetEmail(resetUrl);
    
    // 3. Send email
    try {
      await sendEmail({ to: email, subject: "Reset Your Password", text, html });
      res.json({ message: "Reset link sent to your email." });
    } catch (emailError: any) {
      console.error("[ForgotPassword] Error sending email:", emailError);
      res.status(500).json({ 
        message: "We couldn't send the reset email. Please try again later or contact support.",
        error: process.env.NODE_ENV === "development" ? emailError.message : undefined
      });
    }
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: "Token and new password required." });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        message: "Server configuration error: JWT secret missing.",
      });
      return;
    }
    // 1. Verify JWT
    const decoded = verifyToken(token);
    if (typeof decoded === "object" && "error" in decoded) {
      res.status(decoded.statusCode).json({ message: decoded.error });
      return;
    }

    // 2. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // 3. Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: decoded.email },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password reset successful." });
    return;
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Invalid or expired token." });
    return;
  }
};

// OTP GENERATION + EMAIL
export const sendEmailVerificationOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        message: "Email is required",
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      res.status(400).json({
        message:
          "Your Email Id already Existing. Please Try With Another Email Id",
      });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        message: "Server configuration error: JWT secret missing.",
      });
      return;
    }
    const otpToken = jwt.sign({ email, otp }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    const { html, text } = getOtpEmail(otp);
    try {
      await sendEmail({
        to: email,
        subject: "Email Verification - Amulya Chess",
        text,
        html,
      });
    } catch (emailError: any) {
      console.error("[SendOtp] Error sending email:", emailError);
      res.status(500).json({ 
        message: "We couldn't send the verification code. Please try again later or contact support.",
        error: process.env.NODE_ENV === "development" ? emailError.message : undefined
      });
      return;
    }

    res.status(200).json({
      message: "OTP sent to your email.",
      data: {
        otpToken,
      },
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { otp, token } = req.body;
    if (!otp || !token) {
      res.status(400).json({
        message: "OTP and token are required",
      });
      return;
    }

    const decoded = verifyToken(token);
    if (typeof decoded === "object" && "error" in decoded) {
      res.status(decoded.statusCode).json({
        message: decoded.error,
      });
      return;
    }

    if (String(decoded.otp) !== String(otp)) {
      res.status(400).json({
        message: "Invalid OTP",
      });
      return;
    }

    res.status(200).json({
      message: "Email verified successfully.",
      data: {
        email: decoded.email,
      },
    });
    return;
  } catch (err) {
    // console.log(err);

    res.status(400).json({
      message: "OTP expired or invalid",
    });
    return;
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    if (!GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_CLIENT_ID is not defined");
    }

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        message: "Google token is required",
      });
      return
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email_verified) {
      res.status(401).json({
        message: "Google authentication failed",
      });
      return
    }

    const user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      googleId: payload.sub,
    };

    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { orders: { orderBy: { createdAt: 'desc' } } },
    });

    if (!dbUser) {
      const generatedPassword = await hashPassword(
        Math.random().toString(36).slice(-12) + "A1!"
      );
      
      const newUser = await prisma.user.create({
        data: {
          email: user.email!,
          userName: user.name || "Google User",
          password: generatedPassword,
          phone: "GoogleAuthUser",
          picture: user.picture,
        },
      });
      // Fetch the newly created user with included relations to match standard structure
      dbUser = (await prisma.user.findUnique({
        where: { id: newUser.id },
        include: { orders: { orderBy: { createdAt: 'desc' } } },
      }))!;
    }

    const accessToken = generateToken(dbUser.id.toString());
    if (typeof accessToken === "object" && "error" in accessToken) {
      res.status(accessToken.statusCode).json({ message: accessToken.error });
      return;
    }

    const refreshToken = generateRefreshToken();
    const refreshTokenExpiresAt = new Date(
      Date.now() + AUTH_CONSTANTS.SEVEN_DAYS_VALUE
    );

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { refreshToken, refreshTokenExpiresAt },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: MODE !== "dev",
      sameSite: MODE !== "dev" ? "none" : "lax",
      maxAge: AUTH_CONSTANTS.SEVEN_DAYS_VALUE,
    });

    res.status(200).json({
      message: "Google login successful",
      data: {
        user: omitUserPrivateFields(dbUser),
        orders: dbUser.orders || [],
        accessToken,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);

    res.status(401).json({
      message: "Invalid Google token",
    });
    return
  }
}

