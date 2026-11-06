import {
  Application,
  CandidateProfile,
  CreateJobInput,
  Job,
  Role,
  User,
} from "./types";
import {
  mockApplyToJob,
  mockCreateJob,
  mockGetCandidateApplications,
  mockGetCandidateProfile,
  mockGetJobById,
  mockGetJobs,
  mockGetMe,
  mockGetRecruiterApplicants,
  mockLogin,
  mockRegister,
  mockUpdateApplicationStatus,
  mockUploadResume,
} from "./mocks";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_MOCKS === undefined
    ? true
    : process.env.NEXT_PUBLIC_USE_MOCKS === "true";

let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null) {
  inMemoryToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryToken;
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export const APPLICATION_STATUS_MAP: Record<string, string> = {
  APPLIED: "Applied",
  REVIEWING: "Reviewing",
  SHORTLISTED: "Shortlisted",
  INTERVIEWING: "Interviewing",
  REJECTED: "Rejected",
  OFFERED: "Offered",
  Applied: "Applied",
  Reviewing: "Reviewing",
  Shortlisted: "Shortlisted",
  Interviewing: "Interviewing",
  Rejected: "Rejected",
  Offered: "Offered",
};

export const BACKEND_STATUSES = [
  "APPLIED",
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEWING",
  "REJECTED",
  "OFFERED",
] as const;

export function formatApplicationStatus(status?: string | null): string {
  if (!status) return "Applied";
  const upper = String(status).toUpperCase();
  return APPLICATION_STATUS_MAP[upper] || status;
}

export function toBackendStatus(status?: string | null): string {
  if (!status) return "APPLIED";
  return String(status).toUpperCase();
}

export function normalizeJob(rawJob: any): Job {
  if (!rawJob) return rawJob;

  const skills = Array.isArray(rawJob.skills)
    ? rawJob.skills.map((s: any) => {
        if (typeof s === "string") return s;
        if (s && typeof s === "object" && "skill" in s) return s.skill;
        return String(s);
      })
    : [];

  const company =
    rawJob.company ||
    (rawJob.recruiter?.email
      ? `${rawJob.recruiter.email.split("@")[0]}'s Tech`
      : "Tech Innovators");

  return {
    ...rawJob,
    company,
    type: rawJob.type || "Full-time",
    requirements: Array.isArray(rawJob.requirements) ? rawJob.requirements : [],
    skills,
  };
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (options.requiresAuth !== false && inMemoryToken) {
    headers["Authorization"] = `Bearer ${inMemoryToken}`;
  }

  // Clean double-slashes when joining base url
  const cleanBase = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const response = await fetch(`${cleanBase}${cleanPath}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "An unexpected error occurred";
    try {
      const errorData = await response.json();
      errorMessage =
        errorData.message ||
        (Array.isArray(errorData.errors) ? errorData.errors.map((e: any) => e.message).join(", ") : null) ||
        errorData.detail ||
        errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  auth: {
    async login(email: string, password: string): Promise<{ token: string; user: User }> {
      let res: any;
      if (USE_MOCKS) {
        res = await mockLogin(email, password);
      } else {
        res = await request<any>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
          requiresAuth: false,
        });
      }

      const token = res.token;
      const user = res.user;
      setAuthToken(token);
      return { token, user };
    },

    async register(
      email: string,
      password: string,
      role: Role,
      name?: string
    ): Promise<{ token: string; user: User }> {
      let res: any;
      if (USE_MOCKS) {
        res = await mockRegister(email, password, role, name);
      } else {
        // Backend expects role as "CANDIDATE" | "RECRUITER" (uppercase enum)
        const rolePayload = role.toUpperCase();
        res = await request<any>("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, role: rolePayload, name }),
          requiresAuth: false,
        });
      }

      const token = res.token;
      const user = res.user;
      setAuthToken(token);
      return { token, user };
    },

    async getMe(): Promise<User> {
      let rawData: any;
      if (USE_MOCKS) {
        rawData = await mockGetMe(inMemoryToken);
      } else {
        rawData = await request<any>("/auth/me", {
          method: "GET",
        });
      }

      const user = rawData && "user" in rawData ? rawData.user : rawData;
      return user;
    },

    logout() {
      setAuthToken(null);
    },
  },

  jobs: {
    async getAll(search?: string, skill?: string): Promise<Job[]> {
      let rawData: any;
      if (USE_MOCKS) {
        rawData = await mockGetJobs(search, skill);
      } else {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (skill) params.append("skill", skill);
        const query = params.toString() ? `?${params.toString()}` : "";
        rawData = await request<any>(`/jobs${query}`, { method: "GET", requiresAuth: false });
      }

      // Unwrap { success: true, count, jobs: [...] } or plain array
      const jobArray = Array.isArray(rawData) ? rawData : rawData?.jobs || rawData?.data || [];
      return jobArray.map(normalizeJob);
    },

    async getById(id: string): Promise<Job | null> {
      let rawData: any;
      if (USE_MOCKS) {
        rawData = await mockGetJobById(id);
      } else {
        rawData = await request<any>(`/jobs/${id}`, { method: "GET", requiresAuth: false });
      }

      // Unwrap { success: true, job: {...} } or plain job
      const job = rawData && "job" in rawData ? rawData.job : rawData;
      return job ? normalizeJob(job) : null;
    },

    async create(input: CreateJobInput, recruiterId: string): Promise<Job> {
      let rawData: any;
      if (USE_MOCKS) {
        rawData = await mockCreateJob(recruiterId, input);
      } else {
        rawData = await request<any>("/jobs", {
          method: "POST",
          body: JSON.stringify(input),
        });
      }

      // Unwrap { success: true, job: {...} } or plain job
      const job = rawData && "job" in rawData ? rawData.job : rawData;
      return normalizeJob(job);
    },
  },

  candidate: {
    async getProfile(userId: string): Promise<CandidateProfile> {
      let rawData: any;
      if (USE_MOCKS) {
        rawData = await mockGetCandidateProfile(userId);
      } else {
        rawData = await request<any>(`/candidates/${userId}/profile`, { method: "GET" });
      }

      const profile = rawData && "profile" in rawData ? rawData.profile : rawData;
      return profile;
    },

    async uploadResume(
      userId: string,
      file: File
    ): Promise<{ profile: CandidateProfile; extractedSkills: string[] }> {
      if (USE_MOCKS) {
        const res = await mockUploadResume(userId, { name: file.name, size: file.size });
        return { profile: res.profile, extractedSkills: res.extractedSkills };
      }

      const formData = new FormData();
      formData.append("resume", file);

      const cleanBase = API_BASE_URL.replace(/\/+$/, "");
      const response = await fetch(`${cleanBase}/resumes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${inMemoryToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = "Failed to upload resume";
        try {
          const errData = await response.json();
          errorMsg = errData.message || errorMsg;
        } catch {
          // ignore json parse error
        }
        throw new Error(errorMsg);
      }
      const rawData = await response.json();
      return {
        profile: rawData.profile || rawData,
        extractedSkills: rawData.extractedSkills || [],
      };
    },

    async getApplications(candidateId: string): Promise<Application[]> {
      let rawData: any;
      if (USE_MOCKS) {
        rawData = await mockGetCandidateApplications(candidateId);
      } else {
        rawData = await request<any>("/candidate/applications", {
          method: "GET",
        });
      }

      const list = Array.isArray(rawData) ? rawData : rawData?.applications || rawData?.data || [];
      return list;
    },

    async apply(jobId: string, candidate: User): Promise<Application> {
      let rawData: any;
      if (USE_MOCKS) {
        rawData = await mockApplyToJob(jobId, candidate);
      } else {
        rawData = await request<any>(`/jobs/${jobId}/apply`, {
          method: "POST",
        });
      }

      const app = rawData && "application" in rawData ? rawData.application : rawData;
      return app;
    },
  },

  recruiter: {
    async getApplicants(
      recruiterId: string,
      jobId?: string
    ): Promise<{ job: Job; applicants: Application[] }[]> {
      let rawData: any;
      if (USE_MOCKS) {
        rawData = await mockGetRecruiterApplicants(recruiterId, jobId);
      } else if (jobId && jobId !== "all") {
        try {
          const [jobRes, appRes] = await Promise.all([
            api.jobs.getById(jobId),
            request<any>(`/jobs/${jobId}/applicants`, { method: "GET" }),
          ]);
          const applicants = Array.isArray(appRes) ? appRes : appRes?.applicants || [];
          return [
            {
              job: jobRes!,
              applicants,
            },
          ];
        } catch {
          rawData = await request<any>(`/recruiter/jobs`, { method: "GET" });
        }
      } else {
        rawData = await request<any>(`/recruiter/jobs`, { method: "GET" });
      }

      const rawList = Array.isArray(rawData)
        ? rawData
        : rawData?.jobs || rawData?.applicants || rawData?.data || [];

      return rawList.map((item: any) => {
        if (item.job && Array.isArray(item.applicants)) {
          return {
            job: normalizeJob(item.job),
            applicants: item.applicants,
          };
        }
        return {
          job: normalizeJob(item),
          applicants: item.applications || [],
        };
      });
    },

    async updateStatus(
      applicationId: string,
      status: Application["status"] | string
    ): Promise<Application> {
      const backendStatus = toBackendStatus(status);
      let rawData: any;
      if (USE_MOCKS) {
        rawData = await mockUpdateApplicationStatus(applicationId, backendStatus as any);
      } else {
        rawData = await request<any>(`/applications/${applicationId}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: backendStatus }),
        });
      }

      return rawData && "application" in rawData ? rawData.application : rawData;
    },
  },
};
