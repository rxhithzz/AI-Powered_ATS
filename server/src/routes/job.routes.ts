import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createJobController,
  getJobByIdController,
  getJobsController,
} from "../controllers/job.controller";
import {
  applyToJobController,
  getJobApplicantsController,
} from "../controllers/application.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { createJobSchema } from "../validations/job.validation";

const router = Router();

// GET /jobs (Public: list all open jobs)
router.get("/", getJobsController);

// GET /jobs/:id (Public: get single job details)
router.get("/:id", getJobByIdController);

// POST /jobs (Requires RECRUITER role)
router.post(
  "/",
  requireAuth,
  requireRole(Role.RECRUITER),
  validateBody(createJobSchema),
  createJobController
);

// POST /jobs/:id/apply (Requires CANDIDATE role)
router.post(
  "/:id/apply",
  requireAuth,
  requireRole(Role.CANDIDATE),
  applyToJobController
);

// GET /jobs/:id/applicants (Requires RECRUITER role who owns the job)
router.get(
  "/:id/applicants",
  requireAuth,
  requireRole(Role.RECRUITER),
  getJobApplicantsController
);

export default router;
