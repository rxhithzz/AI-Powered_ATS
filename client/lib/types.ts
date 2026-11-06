export type Role = "candidate" | "recruiter" | "CANDIDATE" | "RECRUITER";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  createdAt: string;
}

export interface JobSkillItem {
  id?: string;
  skill: string;
  required?: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type?: "Full-time" | "Part-time" | "Contract" | "Remote" | string;
  salary?: string;
  description: string;
  requirements?: string[];
  skills: string[];
  recruiterId: string;
  createdAt: string;
  recruiter?: {
    id: string;
    email: string;
  };
}

export type BackendApplicationStatus =
  | "APPLIED"
  | "REVIEWING"
  | "SHORTLISTED"
  | "INTERVIEWING"
  | "REJECTED"
  | "OFFERED";

export type ApplicationStatus =
  | BackendApplicationStatus
  | "Applied"
  | "Reviewing"
  | "Shortlisted"
  | "Interviewing"
  | "Rejected"
  | "Offered";

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  resumeFileName?: string;
  matchScore: number; // 0 - 100
  skillsMatched: string[];
  skillsMissing?: string[];
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  resumeName?: string;
  resumeSize?: number;
  uploadedAt?: string;
  extractedSkills: string[];
  experienceYears?: number;
  education?: string;
  summary?: string;
}

export interface AuthResponse {
  success?: boolean;
  token: string;
  user: User;
}

export interface CreateJobInput {
  title: string;
  description: string;
  location: string;
  type?: "Full-time" | "Part-time" | "Contract" | "Remote";
  salary?: string;
  skills: string[];
}
