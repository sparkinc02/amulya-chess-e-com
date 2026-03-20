import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail, getPasswordResetEmail, getOtpEmail } from "./email.helper";

const JWT_SECRET = process.env.JWT_SECRET;

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  plain: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(plain, hash);
};

export const generateToken = (
  userId: string,
): string | { error: string; statusCode: number } => {
  if (!JWT_SECRET) {
    return {
      error: "Server configuration error: JWT secret missing.",
      statusCode: 500,
    };
  }
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

export const verifyToken = (
  token: any,
): any | { error: string; statusCode: number } => {
  if (!JWT_SECRET) {
    return {
      error: "Server configuration error: JWT secret missing.",
      statusCode: 500,
    };
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error: any) {
    return { error: "Invalid or expired token.", statusCode: 401 };
  }
};

export const verifyRefreshToken = (
  refreshToken: string,
): boolean | { error: string; statusCode: number } => {
  const isValid: boolean = Boolean(refreshToken && refreshToken.length === 128); // Explicitly cast to boolean
  if (!isValid) {
    return { error: "Invalid refresh token.", statusCode: 401 };
  }
  return isValid;
};

export const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};
