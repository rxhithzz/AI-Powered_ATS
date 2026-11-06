import { Router } from "express";
import { Role } from "@prisma/client";
import { getRecruiterJobsController } from "../controllers/recruiter.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();

// GET /recruiter/jobs (Requires RECRUITER role)
router.get("/jobs", requireAuth, requireRole(Role.RECRUITER), getRecruiterJobsController);

export default router;

