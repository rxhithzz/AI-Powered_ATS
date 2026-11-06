import { Router } from "express";
import { Role } from "@prisma/client";
import { updateApplicationStatusController } from "../controllers/application.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { updateApplicationStatusSchema } from "../validations/application.validation";

const router = Router();

// PATCH /applications/:id/status (Requires RECRUITER who owns the job)
router.patch(
  "/:id/status",
  requireAuth,
  requireRole(Role.RECRUITER),
  validateBody(updateApplicationStatusSchema),
  updateApplicationStatusController
);

export default router;

