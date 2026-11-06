import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../lib/errors";
import { candidateService } from "../services/candidate.service";

export const uploadResumeController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new BadRequestError("A PDF file is required (form field: 'resume' or 'file')");
    }

    const candidateId = req.user!.userId;
    const result = await candidateService.uploadResume(candidateId, req.file);

    // Return 201 with resume id and fileUrl
    res.status(201).json({
      success: true,
      message: "Resume uploaded and processed successfully",
      resumeId: result.id,
      fileUrl: result.fileUrl,
      fileName: result.fileName,
      extractedSkills: result.extractedSkills,
      profile: {
        id: `profile_${candidateId}`,
        userId: candidateId,
        resumeName: result.fileName,
        fileUrl: result.fileUrl,
        extractedSkills: result.extractedSkills,
      },
    });
  } catch (error) {
    next(error);
  }
};

