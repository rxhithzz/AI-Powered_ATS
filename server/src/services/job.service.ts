import { JobStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { NotFoundError } from "../lib/errors";
import { CreateJobInput } from "../validations/job.validation";

export class JobService {
  /**
   * Public: List all open jobs, including required/optional skills
   */
  async getOpenJobs() {
    return prisma.job.findMany({
      where: {
        status: JobStatus.OPEN,
      },
      include: {
        skills: {
          select: {
            id: true,
            skill: true,
            required: true,
          },
        },
        recruiter: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Public: Get job details by ID
   */
  async getJobById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        skills: {
          select: {
            id: true,
            skill: true,
            required: true,
          },
        },
        recruiter: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError(`Job with ID '${id}' was not found`);
    }

    return job;
  }

  /**
   * Recruiter: Create a new job posting with skill tags
   */
  async createJob(recruiterId: string, input: CreateJobInput) {
    // Normalize skills to object shape: { skill: string, required: boolean }
    const formattedSkills = input.skills.map((item) => {
      if (typeof item === "string") {
        return { skill: item.trim(), required: true };
      }
      return { skill: item.skill.trim(), required: item.required ?? true };
    });

    // Create job and associated skills in a single transaction
    const newJob = await prisma.job.create({
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        location: input.location.trim(),
        status: JobStatus.OPEN,
        recruiterId,
        skills: {
          create: formattedSkills,
        },
      },
      include: {
        skills: {
          select: {
            id: true,
            skill: true,
            required: true,
          },
        },
        recruiter: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return newJob;
  }

  /**
   * Recruiter: Get all jobs owned by the authenticated recruiter
   */
  async getRecruiterJobs(recruiterId: string) {
    return prisma.job.findMany({
      where: {
        recruiterId,
      },
      include: {
        skills: {
          select: {
            id: true,
            skill: true,
            required: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export const jobService = new JobService();

