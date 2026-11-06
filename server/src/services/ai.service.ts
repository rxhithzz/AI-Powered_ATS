import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { env } from "../lib/env";

const geminiSkillOutputSchema = z.object({
  skills: z.array(z.string()).default([]),
  yearsExperience: z.coerce.number().default(0),
});

export interface ExtractedSkillsResult {
  skills: string[];
  yearsExperience: number;
}

const SKILL_ALIASES: Record<string, string> = {
  reactjs: "React",
  "react.js": "React",
  react: "React",
  node: "Node.js",
  nodejs: "Node.js",
  "node.js": "Node.js",
  next: "Next.js",
  nextjs: "Next.js",
  "next.js": "Next.js",
  ts: "TypeScript",
  typescript: "TypeScript",
  js: "JavaScript",
  javascript: "JavaScript",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  psql: "PostgreSQL",
  py: "Python",
  python: "Python",
  k8s: "Kubernetes",
  kubernetes: "Kubernetes",
  docker: "Docker",
  aws: "AWS",
  gcp: "GCP",
  tailwind: "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
  graphql: "GraphQL",
  mongo: "MongoDB",
  mongodb: "MongoDB",
  vue: "Vue.js",
  vuejs: "Vue.js",
  golang: "Go",
};

export function normalizeSkillWithAlias(skill: string): string {
  const clean = skill.trim();
  const lower = clean.toLowerCase();
  if (SKILL_ALIASES[lower]) {
    return SKILL_ALIASES[lower];
  }
  // Standard capitalization for multi-word or single word
  return clean;
}

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
  }

  async extractSkills(text: string): Promise<ExtractedSkillsResult> {
    if (!this.genAI || !env.GEMINI_API_KEY || !text.trim()) {
      return { skills: [], yearsExperience: 0 };
    }

    const prompt = `You are an expert technical talent recruiter.
Extract the technical skills (programming languages, libraries, frameworks, cloud services, databases, DevOps tools) and estimated total years of professional engineering experience from the resume text below.

Respond with ONLY a valid, raw JSON object in this exact format (no markdown, no backticks, no extra text):
{
  "skills": ["Skill 1", "Skill 2"],
  "yearsExperience": 3
}

Resume content:
${text.slice(0, 15000)}
`;

    // Attempt Gemini call with 1 retry on parse failure
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: env.GEMINI_MODEL,
        });

        const result = await model.generateContent(prompt);
        const rawContent = result.response.text();

        // Extract JSON from response text (handling possible markdown fences ```json ... ```)
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON object found in Gemini response");
        }

        const parsedJson = JSON.parse(jsonMatch[0]);
        const validated = geminiSkillOutputSchema.parse(parsedJson);

        // Normalize skills through alias map & deduplicate
        const uniqueNormalizedSkills = Array.from(
          new Set(
            validated.skills
              .map(normalizeSkillWithAlias)
              .filter((s) => s.length > 0 && s.length < 50)
          )
        );

        return {
          skills: uniqueNormalizedSkills,
          yearsExperience: validated.yearsExperience,
        };
      } catch (err) {
        if (attempt === 2) {
          console.warn("⚠️ AIService: Gemini skill extraction failed after retry:", err);
          return { skills: [], yearsExperience: 0 };
        }
      }
    }

    return { skills: [], yearsExperience: 0 };
  }
}

export const aiService = new AIService();

