import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";

export const updateApplicationStatusSchema = z.object({
  status: z.preprocess(
    (val) => (typeof val === "string" ? val.toUpperCase().trim() : val),
    z.nativeEnum(ApplicationStatus, {
      errorMap: () => ({
        message:
          "Status must be one of: APPLIED, REVIEWING, SHORTLISTED, INTERVIEWING, REJECTED, OFFERED",
      }),
    })
  ),
});

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;

