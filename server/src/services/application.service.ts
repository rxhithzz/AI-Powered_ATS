import { ApplicationStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../lib/errors";
import { calculateMatchDetails, scoreMatch } from "./matching";

export class ApplicationService {
  /**
   * Candidate applies to an open job:
   * Calculates rule-based match score at apply time.
   * Required skills count double.
   * Catches unique constraint (jobId, candidateId) and returns 409 Conflict.
   */
  async applyToJob(jobId: string, candidateId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        skills: {
          select: {
            id: true,
            skill: true,
            required: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError("Job posting not found");
    }

    if (job.status !== "OPEN") {
      throw new BadRequestError("This job posting is closed and no longer accepting applications");
    }

    // Check if candidate already applied
    const existing = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("You have already applied to this position");
    }

    // Get candidate skills
    const candidateSkills = await prisma.candidateSkill.findMany({
      where: { candidateId },
      select: { skill: true },
    });

    // Calculate matchScore
    const matchScore = scoreMatch(job.skills, candidateSkills);
    const matchDetails = calculateMatchDetails(job.skills, candidateSkills);

    try {
      const application = await prisma.application.create({
        data: {
          jobId,
          candidateId,
          matchScore,
          status: ApplicationStatus.APPLIED,
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              recruiter: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      return {
        id: application.id,
        jobId: application.jobId,
        candidateId: application.candidateId,
        matchScore: application.matchScore,
        createdAt: application.createdAt,
        jobTitle: application.job.title,
        company: application.job.recruiter?.email || "Hiring Team",
        location: application.job.location,
        skillsMatched: matchDetails.matchedSkills,
        skillsMissing: matchDetails.missingSkills,
        status: application.status,
      };
    } catch (err: any) {
      if (err.code === "P2002") {
        throw new ConflictError("You have already applied to this position");
      }
      throw err;
    }
  }

  /**
   * Candidate: Get all submitted applications with job titles
   */
  async getCandidateApplications(candidateId: string) {
    const applications = await prisma.application.findMany({
      where: { candidateId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            recruiter: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      company: app.job.recruiter?.email || "Hiring Team",
      location: app.job.location,
      candidateId: app.candidateId,
      matchScore: app.matchScore,
      status: app.status,
      appliedAt: app.createdAt.toISOString(),
      createdAt: app.createdAt,
    }));
  }

  /**
   * Recruiter: Get applicants for a specific job, sorted by matchScore descending.
   * Requires that the authenticated recruiter owns the job.
   */
  async getJobApplicants(jobId: string, recruiterId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, recruiterId: true },
    });

    if (!job) {
      throw new NotFoundError("Job posting not found");
    }

    if (job.recruiterId !== recruiterId) {
      throw new ForbiddenError("You can only view applicants for your own job postings");
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            resumes: {
              select: { fileUrl: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            candidateSkills: {
              select: { skill: true, source: true },
            },
          },
        },
      },
      orderBy: { matchScore: "desc" },
    });

    return applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: job.title,
      candidateId: app.candidate.id,
      candidateName: app.candidate.email.split("@")[0],
      candidateEmail: app.candidate.email,
      matchScore: app.matchScore,
      resumeUrl: app.candidate.resumes[0]?.fileUrl || null,
      resumeFileName: app.candidate.resumes[0]?.fileUrl?.split("/").pop() || "resume.pdf",
      skills: app.candidate.candidateSkills.map((s) => s.skill),
      skillsMatched: app.candidate.candidateSkills.map((s) => s.skill),
      status: app.status,
      appliedAt: app.createdAt.toISOString(),
    }));
  }

  /**
   * Recruiter: Update application review status (PATCH /applications/:id/status).
   * Requires that the authenticated recruiter owns the job the application belongs to.
   * Creates an ApplicationEvent row recording the status transition.
   */
  async updateStatus(
    applicationId: string,
    recruiterId: string,
    newStatus: ApplicationStatus
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            id: true,
            recruiterId: true,
            title: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    if (application.job.recruiterId !== recruiterId) {
      throw new ForbiddenError(
        "You can only update application statuses for your own job postings"
      );
    }

    const fromStatus = application.status;

    // Update Application status and write audit row to application_events in a transaction
    const [updatedApplication] = await prisma.$transaction([
      prisma.application.update({
        where: { id: applicationId },
        data: {
          status: newStatus,
        },
      }),
      prisma.applicationEvent.create({
        data: {
          applicationId,
          fromStatus,
          toStatus: newStatus,
          actorId: recruiterId,
        },
      }),
    ]);

    return updatedApplication;
  }
}

export const applicationService = new ApplicationService();
