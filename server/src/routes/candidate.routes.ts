import { Router } from "express";
import { Role } from "@prisma/client";
import {
  addManualSkillsController,
  getCandidateApplicationsController,
  getCandidateProfileController,
  getCandidateSkillsController,
} from "../controllers/candidate.controller";
import { uploadResumeController } from "../controllers/resume.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { uploadResume } from "../middleware/upload.middleware";
import { manualSkillsSchema } from "../validations/candidate.validation";

const router = Router();

// POST /candidate/skills (Add manual skills)
router.post(
  "/skills",
  requireAuth,
  requireRole(Role.CANDIDATE),
  validateBody(manualSkillsSchema),
  addManualSkillsController
);

// GET /candidate/skills (Get all skills of authenticated candidate)
router.get("/skills", requireAuth, requireRole(Role.CANDIDATE), getCandidateSkillsController);

// GET /candidate/applications (Authenticated candidate's applications with job titles)
router.get(
  "/applications",
  requireAuth,
  requireRole(Role.CANDIDATE),
  getCandidateApplicationsController
);

// Support :id parameter for candidate applications
router.get("/:id/applications", requireAuth, getCandidateApplicationsController);

// Support :id parameter for candidate profile (used by client)
router.get("/:id/profile", requireAuth, getCandidateProfileController);

// Also support POST /candidate/resume (alias matching client's api.candidate.uploadResume)
router.post(
  "/resume",
  requireAuth,
  requireRole(Role.CANDIDATE),
  (req, res, next) => {
    uploadResume.fields([
      { name: "resume", maxCount: 1 },
      { name: "file", maxCount: 1 },
    ])(req, res, (err) => {
      if (err) return next(err);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      req.file = files?.resume?.[0] || files?.file?.[0] || undefined;
      next();
    });
  },
  uploadResumeController
);

export default router;

