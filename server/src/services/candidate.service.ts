import pdf from "pdf-parse";
import { SkillSource } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { storageService } from "./storage.service";
import { aiService, normalizeSkillWithAlias } from "./ai.service";

export class CandidateService {
  /**
   * Upload and process PDF resume:
   * 1. Stores the file through StorageService
   * 2. Extracts raw text with pdf-parse
   * 3. Saves to Resume table
   * 4. Extracts skills with Gemini AIService
   * 5. Replaces previous PARSED skills in CandidateSkill table
   */
  async uploadResume(candidateId: string, file: Express.Multer.File) {
    // 1. Extract text with pdf-parse
    let rawText = "";
    try {
      const pdfData = await pdf(file.buffer);
      rawText = pdfData.text || "";
    } catch (err) {
      console.warn("⚠️ PDF text extraction warning:", err);
    }

    // 2. Store file via StorageService (LocalStorage / Cloudinary)
    const stored = await storageService.uploadFile(file, "resumes");

    // 3. Save Resume record in database
    const resume = await prisma.resume.create({
      data: {
        candidateId,
        fileUrl: stored.fileUrl,
        rawText: rawText.trim() ? rawText : null,
      },
    });

    // 4. Extract skills with Gemini
    const { skills: extractedSkills } = await aiService.extractSkills(rawText);

    // 5. Replace previous PARSED CandidateSkill rows
    await prisma.$transaction(async (tx) => {
      await tx.candidateSkill.deleteMany({
        where: {
          candidateId,
          source: SkillSource.PARSED,
        },
      });

      if (extractedSkills.length > 0) {
        await tx.candidateSkill.createMany({
          data: extractedSkills.map((skill) => ({
            candidateId,
            skill,
            source: SkillSource.PARSED,
          })),
        });
      }
    });

    return {
      id: resume.id,
      resumeId: resume.id,
      fileUrl: resume.fileUrl,
      fileName: stored.fileName,
      size: stored.size,
      rawText: resume.rawText,
      extractedSkills,
    };
  }

  /**
   * Add manual skills for candidate (source: MANUAL)
   */
  async addManualSkills(candidateId: string, skills: string[]) {
    const normalized = skills
      .map(normalizeSkillWithAlias)
      .filter((s) => s.length > 0);

    // Fetch existing skills to prevent duplicates
    const existing = await prisma.candidateSkill.findMany({
      where: { candidateId },
      select: { skill: true },
    });
    const existingSet = new Set(existing.map((e) => e.skill.toLowerCase()));

    const toInsert = normalized.filter((s) => !existingSet.has(s.toLowerCase()));

    if (toInsert.length > 0) {
      await prisma.candidateSkill.createMany({
        data: toInsert.map((skill) => ({
          candidateId,
          skill,
          source: SkillSource.MANUAL,
        })),
      });
    }

    return prisma.candidateSkill.findMany({
      where: { candidateId },
      orderBy: { skill: "asc" },
    });
  }

  /**
   * Get all skills for a candidate
   */
  async getCandidateSkills(candidateId: string) {
    return prisma.candidateSkill.findMany({
      where: { candidateId },
      orderBy: { skill: "asc" },
    });
  }

  /**
   * Get profile data for candidate (active resume + skills)
   */
  async getCandidateProfile(candidateId: string) {
    const [latestResume, skills] = await Promise.all([
      prisma.resume.findFirst({
        where: { candidateId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.candidateSkill.findMany({
        where: { candidateId },
        select: { skill: true, source: true },
        orderBy: { skill: "asc" },
      }),
    ]);

    const extractedSkills = skills.map((s) => s.skill);

    const fileName = latestResume
      ? latestResume.fileUrl.split("/").pop() || "resume.pdf"
      : undefined;

    return {
      id: `profile_${candidateId}`,
      userId: candidateId,
      resumeName: fileName,
      fileUrl: latestResume?.fileUrl,
      uploadedAt: latestResume?.createdAt.toISOString(),
      extractedSkills,
      skills,
    };
  }
}

export const candidateService = new CandidateService();

