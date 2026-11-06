import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Must be a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
  role: z.enum(["CANDIDATE", "RECRUITER"], {
    errorMap: () => ({ message: "Role must be either CANDIDATE or RECRUITER" }),
  }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Must be a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

