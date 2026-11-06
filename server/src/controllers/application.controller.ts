import { NextFunction, Request, Response } from "express";
import { applicationService } from "../services/application.service";

export const applyToJobController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobId = req.params.id;
    const candidateId = req.user!.userId;
    const application = await applicationService.applyToJob(jobId, candidateId);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobApplicantsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobId = req.params.id;
    const recruiterId = req.user!.userId;
    const applicants = await applicationService.getJobApplicants(jobId, recruiterId);

    res.status(200).json({
      success: true,
      count: applicants.length,
      applicants,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const applicationId = req.params.id;
    const recruiterId = req.user!.userId;
    const { status } = req.body;

    const application = await applicationService.updateStatus(
      applicationId,
      recruiterId,
      status
    );

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};
