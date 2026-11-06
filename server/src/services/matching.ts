export interface JobSkillLike {
  skill: string;
  required?: boolean;
}

export interface CandidateSkillLike {
  skill: string;
}

export type JobSkillInput = string | JobSkillLike;
export type CandidateSkillInput = string | CandidateSkillLike;

export interface MatchDetails {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

function normalizeSkillName(skill: string): string {
  return skill.toLowerCase().trim().replace(/[-_.\s]/g, "");
}

/**
 * Pure rule-based scoring function:
 * Percentage of job skills the candidate possesses, with required skills counting double (weight 2 vs 1).
 * Returns an integer rounded from 0 to 100.
 */
export function scoreMatch(
  jobSkills: JobSkillInput[],
  candidateSkills: CandidateSkillInput[]
): number {
  if (!jobSkills || jobSkills.length === 0) {
    return 100;
  }

  const candidateSkillSet = new Set<string>();
  for (const cs of candidateSkills) {
    const rawName = typeof cs === "string" ? cs : cs?.skill;
    if (rawName) {
      candidateSkillSet.add(normalizeSkillName(rawName));
    }
  }

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const js of jobSkills) {
    const rawName = typeof js === "string" ? js : js?.skill;
    const isRequired = typeof js === "object" && js !== null ? js.required ?? true : true;
    const weight = isRequired ? 2 : 1;

    totalWeight += weight;

    if (rawName && candidateSkillSet.has(normalizeSkillName(rawName))) {
      earnedWeight += weight;
    }
  }

  if (totalWeight === 0) {
    return 100;
  }

  const percentage = (earnedWeight / totalWeight) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage)));
}

/**
 * Returns match score along with lists of matched and missing skills
 */
export function calculateMatchDetails(
  jobSkills: JobSkillInput[],
  candidateSkills: CandidateSkillInput[]
): MatchDetails {
  const score = scoreMatch(jobSkills, candidateSkills);

  const candidateSkillSet = new Set<string>();
  for (const cs of candidateSkills) {
    const rawName = typeof cs === "string" ? cs : cs?.skill;
    if (rawName) {
      candidateSkillSet.add(normalizeSkillName(rawName));
    }
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const js of jobSkills) {
    const rawName = typeof js === "string" ? js : js?.skill;
    if (!rawName) continue;

    if (candidateSkillSet.has(normalizeSkillName(rawName))) {
      matchedSkills.push(rawName);
    } else {
      missingSkills.push(rawName);
    }
  }

  return {
    matchScore: score,
    matchedSkills,
    missingSkills,
  };
}

