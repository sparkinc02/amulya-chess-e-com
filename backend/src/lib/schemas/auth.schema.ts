import { z } from "zod";

const phonePattern = /^\+?[\d\s\-\(\)]+$/;

export const signupSchema = z.object({
  userName: z
    .string({
      required_error: "Username is required.",
      invalid_type_error: "Username must be a string.",
    })
    .min(1, "Username cannot be empty.")
    .min(2, "Username must be at least 2 characters long.")
    .max(50, "Username cannot exceed 50 characters.")
    .trim(),
  phone: z
    .string({
      required_error: "Phone number is required.",
      invalid_type_error: "Phone number must be a string.",
    })
    .min(1, "Phone number cannot be empty.")
    .min(10, "Phone number must be at least 10 digits long.")
    .max(15, "Phone number cannot exceed 15 digits.")
    .regex(phonePattern, "Invalid phone number format. Please include country code if applicable.")
    .trim(),
  email: z
    .string({
      required_error: "Email address is required.",
      invalid_type_error: "Email must be a string.",
    })
    .min(1, "Email address cannot be empty.")
    .email("Invalid email address format. Please enter a valid email (e.g., user@example.com).")
    .toLowerCase()
    .trim(),
  password: z
    .string({
      required_error: "Password is required.",
      invalid_type_error: "Password must be a string.",
    })
    .min(1, "Password cannot be empty.")
    .min(8, "Password must be at least 8 characters long.")
    .max(100, "Password cannot exceed 100 characters."),
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email address is required.",
      invalid_type_error: "Email must be a string.",
    })
    .min(1, "Email address cannot be empty.")
    .email("Invalid email address format.")
    .toLowerCase()
    .trim(),
  password: z
    .string({
      required_error: "Password is required.",
      invalid_type_error: "Password must be a string.",
    })
    .min(1, "Password cannot be empty."),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({
      required_error: "Refresh token is required.",
      invalid_type_error: "Refresh token must be a string.",
    })
    .min(1, "Refresh token cannot be empty.")
    .length(128, "Invalid refresh token format."),
});
