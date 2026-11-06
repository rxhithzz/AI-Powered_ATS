import { Router } from "express";
import { Role } from "@prisma/client";
import { uploadResumeController } from "../controllers/resume.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { uploadResume } from "../middleware/upload.middleware";

const router = Router();

// POST /resumes (Requires CANDIDATE role, multipart PDF upload, max 5 MB)
router.post(
  "/",
  requireAuth,
  requireRole(Role.CANDIDATE),
  (req, res, next) => {
    // Accept either "resume" or "file" as field name
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

