import { z } from "zod";

export const manualSkillsSchema = z.object({
  skills: z
    .array(z.string().trim().min(1, "Skill cannot be empty"))
    .min(1, "At least one skill is required"),
});

export type ManualSkillsInput = z.infer<typeof manualSkillsSchema>;

