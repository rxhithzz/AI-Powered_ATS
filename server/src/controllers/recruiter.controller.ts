import { NextFunction, Request, Response } from "express";
import { jobService } from "../services/job.service";

export const getRecruiterJobsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recruiterId = req.user!.userId;
    const jobs = await jobService.getRecruiterJobs(recruiterId);
    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

