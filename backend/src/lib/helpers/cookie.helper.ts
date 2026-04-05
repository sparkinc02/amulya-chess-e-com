import type { CookieOptions } from "express";
import { AUTH_CONSTANTS } from "../constants/auth.constant";

/**
 * Generates standardized cookie options for refresh tokens.
 * Handles production vs development environment differences.
 */
export const getRefreshTokenCookieOptions = (): CookieOptions => {
  const isProd = process.env.MODE === "prod" || process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProd, // true in production (requires HTTPS)
    sameSite: isProd ? "none" : "lax", // "none" required for cross-site cookies in prod
    maxAge: AUTH_CONSTANTS.SEVEN_DAYS_VALUE,
    // IMPORTANT: No 'domain' attribute should be set for standard *.onrender.com subdomains.
    // Setting domain: ".onrender.com" will cause the browser to reject the cookie.
  };
};
