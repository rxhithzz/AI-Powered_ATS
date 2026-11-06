import { Router } from "express";
import authRoutes from "./auth.routes";
import jobRoutes from "./job.routes";
import recruiterRoutes from "./recruiter.routes";
import healthRoutes from "./health.routes";
import resumeRoutes from "./resume.routes";
import candidateRoutes from "./candidate.routes";
import applicationRoutes from "./application.routes";

export const registerRoutes = (router: Router): void => {
  router.use("/auth", authRoutes);
  router.use("/jobs", jobRoutes);
  router.use("/recruiter", recruiterRoutes);
  router.use("/resumes", resumeRoutes);
  router.use("/candidate", candidateRoutes);
  router.use("/candidates", candidateRoutes);
  router.use("/applications", applicationRoutes);
  router.use("/health", healthRoutes);
};

const mainRouter = Router();
registerRoutes(mainRouter);

export default mainRouter;
