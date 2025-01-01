import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Please provide a valid email address")
      .min(3, "Email must be at least 3 characters")
      .max(255, "Email must not exceed 255 characters"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must not exceed 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  }),
});

export const registerSchema = loginSchema;
