import { z } from "zod";

export const skillItemSchema = z.union([
  z.string().trim().min(1, "Skill name cannot be empty"),
  z.object({
    skill: z.string().trim().min(1, "Skill name cannot be empty"),
    required: z.boolean().default(true),
  }),
]);

export const createJobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters long"),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters long"),
  skills: z
    .array(skillItemSchema)
    .min(1, "At least one skill is required"),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

