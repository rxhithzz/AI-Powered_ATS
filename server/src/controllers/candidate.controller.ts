import { NextFunction, Request, Response } from "express";
import { candidateService } from "../services/candidate.service";
import { applicationService } from "../services/application.service";

export const addManualSkillsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const candidateId = req.user!.userId;
    const skills = await candidateService.addManualSkills(candidateId, req.body.skills);
    res.status(200).json({
      success: true,
      message: "Skills added successfully",
      skills,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateSkillsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const candidateId = req.user!.userId;
    const skills = await candidateService.getCandidateSkills(candidateId);
    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateApplicationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // If route has :id param (e.g. /candidates/:id/applications) or /candidate/applications
    const candidateId = req.params.id || req.user!.userId;
    const applications = await applicationService.getCandidateApplications(candidateId);
    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const candidateId = req.params.id || req.user!.userId;
    const profile = await candidateService.getCandidateProfile(candidateId);
    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

