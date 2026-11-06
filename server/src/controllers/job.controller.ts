import { NextFunction, Request, Response } from "express";
import { jobService } from "../services/job.service";

export const getJobsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobs = await jobService.getOpenJobs();
    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

export const createJobController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recruiterId = req.user!.userId;
    const newJob = await jobService.createJob(recruiterId, req.body);
    res.status(201).json({
      success: true,
      message: "Job opening created successfully",
      job: newJob,
    });
  } catch (error) {
    next(error);
  }
};

