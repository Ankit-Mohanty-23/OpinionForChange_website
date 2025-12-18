import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId format",
  });

export const loginSchema = {
  body: z.object({
    email: z.string().trim().min(1, "Email is required"),
    fullname: z.string().trim().min(1, "fullname is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
};

export const signupSchema = {
  body: z.object({
    email: z.email("Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
};

export const getUserIdSchema = {
  user: z.object({
    _id: objectIdSchema,
  }),
};

export const getOtpSchema = {
  body: z.object({
    email: z.email("Valid Email is required"),
    fullname: z.string().trim().min(1, "Full name required"),
  }),
};

export const getBioSchema = {
  user: z.object({
    _id: objectIdSchema,
  }),

  body: z.object({
    bio: z
      .string()
      .trim()
      .min(1, "Bio is required")
      .max(100, "Bio exceeded limit"),
  }),
};

export const profilepicSchema = {
  user: z.object({
    _id: objectIdSchema,
  }),

  file: z.object({
    originalname: z.string(),
    mimetype: z.enum(["image/jpeg", "image/png", "image/webp"]),
    size: z.number().max(5 * 1024 * 1024),
  }),
};
