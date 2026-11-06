import { Application, CandidateProfile, Job, Role, User } from "./types";

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const MOCK_USERS: Record<string, { user: User; password: string }> = {
  "candidate@example.com": {
    user: {
      id: "usr_cand_01",
      email: "candidate@example.com",
      name: "Alex Rivera",
      role: "candidate",
      createdAt: "2024-01-15T09:00:00Z",
    },
    password: "password123",
  },
  "recruiter@example.com": {
    user: {
      id: "usr_rec_01",
      email: "recruiter@example.com",
      name: "Sarah Chen",
      role: "recruiter",
      createdAt: "2024-01-10T08:30:00Z",
    },
    password: "password123",
  },
};

export const MOCK_JOBS: Job[] = [
  {
    id: "job_01",
    title: "Senior Full Stack Engineer (Next.js & AI)",
    company: "NeuralPulse AI",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-time",
    salary: "$160,000 - $195,000",
    description:
      "Join our core product team building next-generation AI workflows. You will design, build, and scale high-performance web applications powered by generative AI models, vector databases, and responsive UI components.",
    requirements: [
      "5+ years of software engineering experience with modern web stacks",
      "Expertise in TypeScript, React, Next.js (App Router), and Tailwind CSS",
      "Experience integrating LLM APIs (OpenAI, Anthropic, or Gemini)",
      "Strong background in API design, PostgreSQL, and state management",
      "Proven ability to mentor junior engineers and participate in architecture decisions",
    ],
    skills: ["TypeScript", "Next.js", "React", "Node.js", "Tailwind CSS", "PostgreSQL", "AI/LLM APIs"],
    recruiterId: "usr_rec_01",
    createdAt: "2024-02-01T12:00:00Z",
  },
  {
    id: "job_02",
    title: "AI / ML Platform Engineer",
    company: "CognitiveScale Tech",
    location: "Remote (US/Canada)",
    type: "Remote",
    salary: "$175,000 - $210,000",
    description:
      "We are looking for an ML Platform Engineer to build scalable evaluation and deployment pipelines for proprietary fine-tuned models. You will work closely with research scientists to bring state-of-the-art models to production.",
    requirements: [
      "Strong proficiency with Python, PyTorch, and ML inference runtimes",
      "Experience with Kubernetes, Docker, and cloud platforms (AWS / GCP)",
      "Knowledge of vector databases (Pinecone, Qdrant, Chroma) and RAG architectures",
      "Solid understanding of CI/CD for machine learning (MLOps)",
    ],
    skills: ["Python", "PyTorch", "Docker", "Kubernetes", "Vector Databases", "MLOps", "GCP"],
    recruiterId: "usr_rec_01",
    createdAt: "2024-02-03T10:00:00Z",
  },
  {
    id: "job_03",
    title: "Lead Frontend Architect",
    company: "Synthetix Labs",
    location: "New York, NY",
    type: "Full-time",
    salary: "$180,000 - $215,000",
    description:
      "Spearhead the frontend architecture across our enterprise analytics platforms. Lead design system implementations, performance benchmarks, and accessibility compliance.",
    requirements: [
      "7+ years engineering web applications with React and TypeScript",
      "Deep understanding of browser performance, caching, and SSR/SSG patterns",
      "Strong expertise creating design tokens, Tailwind component libraries, and Figma tokens",
      "Experience leading distributed frontend engineering teams",
    ],
    skills: ["React", "TypeScript", "Next.js", "Design Systems", "Web Performance", "Tailwind CSS"],
    recruiterId: "usr_rec_01",
    createdAt: "2024-02-05T14:30:00Z",
  },
  {
    id: "job_04",
    title: "Backend Engineer - High Throughput Distributed Systems",
    company: "Aether Cloud",
    location: "Austin, TX (Remote)",
    type: "Contract",
    salary: "$90 - $120 / hr",
    description:
      "Design fault-tolerant microservices handling millions of events daily. Optimize database indexing, caching strategies, and event streaming pipelines.",
    requirements: [
      "4+ years with Go, Python, or Node.js backend development",
      "Experience with Apache Kafka, Redis, and relational database tuning",
      "Familiarity with gRPC, REST, and distributed tracing",
    ],
    skills: ["Go", "Node.js", "PostgreSQL", "Kafka", "Redis", "Docker", "gRPC"],
    recruiterId: "usr_rec_02",
    createdAt: "2024-02-08T09:15:00Z",
  },
  {
    id: "job_05",
    title: "Product Designer (Design Systems & AI)",
    company: "NeuralPulse AI",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-time",
    salary: "$140,000 - $170,000",
    description:
      "Craft intuitive experiences for developers and enterprise customers interacting with agentic AI systems. Turn complex algorithmic behaviors into smooth, user-friendly UI patterns.",
    requirements: [
      "4+ years product design experience with enterprise SaaS or developer tools",
      "Expert knowledge of Figma, component libraries, and interactive prototyping",
      "Understanding of HTML/CSS/Tailwind primitives to collaborate effectively with frontend engineers",
    ],
    skills: ["Figma", "UI/UX", "Design Systems", "Prototyping", "Tailwind CSS", "User Research"],
    recruiterId: "usr_rec_01",
    createdAt: "2024-02-10T16:00:00Z",
  },
];

export const MOCK_CANDIDATE_PROFILE: CandidateProfile = {
  id: "profile_cand_01",
  userId: "usr_cand_01",
  resumeName: "alex_rivera_resume.pdf",
  resumeSize: 1.8 * 1024 * 1024,
  uploadedAt: "2024-02-10T11:20:00Z",
  extractedSkills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "PostgreSQL",
    "Docker",
    "Git",
    "REST APIs",
    "GraphQL",
  ],
  experienceYears: 6,
  education: "B.S. in Computer Science",
  summary:
    "Senior Full Stack Engineer with 6 years of experience building modern TypeScript, Next.js, and cloud-native applications.",
};

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "app_01",
    jobId: "job_01",
    jobTitle: "Senior Full Stack Engineer (Next.js & AI)",
    company: "NeuralPulse AI",
    location: "San Francisco, CA (Hybrid)",
    candidateId: "usr_cand_01",
    candidateName: "Alex Rivera",
    candidateEmail: "candidate@example.com",
    resumeFileName: "alex_rivera_resume.pdf",
    matchScore: 94,
    skillsMatched: ["TypeScript", "Next.js", "React", "Node.js", "Tailwind CSS", "PostgreSQL"],
    skillsMissing: ["AI/LLM APIs"],
    status: "Shortlisted",
    appliedAt: "2024-02-11T14:30:00Z",
    notes: "Exceptional frontend foundation, strong Next.js portfolio.",
  },
  {
    id: "app_02",
    jobId: "job_03",
    jobTitle: "Lead Frontend Architect",
    company: "Synthetix Labs",
    location: "New York, NY",
    candidateId: "usr_cand_01",
    candidateName: "Alex Rivera",
    candidateEmail: "candidate@example.com",
    resumeFileName: "alex_rivera_resume.pdf",
    matchScore: 88,
    skillsMatched: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    skillsMissing: ["Design Systems", "Web Performance"],
    status: "Reviewing",
    appliedAt: "2024-02-12T10:15:00Z",
    notes: "Great match for modern component architecture.",
  },
  {
    id: "app_03",
    jobId: "job_01",
    jobTitle: "Senior Full Stack Engineer (Next.js & AI)",
    company: "NeuralPulse AI",
    location: "San Francisco, CA (Hybrid)",
    candidateId: "usr_cand_02",
    candidateName: "Jordan Hayes",
    candidateEmail: "jordan.hayes@example.com",
    resumeFileName: "jordan_hayes_cv.pdf",
    matchScore: 89,
    skillsMatched: ["TypeScript", "React", "PostgreSQL", "AI/LLM APIs", "Node.js"],
    skillsMissing: ["Next.js"],
    status: "Interviewing",
    appliedAt: "2024-02-11T16:00:00Z",
  },
  {
    id: "app_04",
    jobId: "job_01",
    jobTitle: "Senior Full Stack Engineer (Next.js & AI)",
    company: "NeuralPulse AI",
    location: "San Francisco, CA (Hybrid)",
    candidateId: "usr_cand_03",
    candidateName: "Elena Rostova",
    candidateEmail: "elena.rostova@example.com",
    resumeFileName: "elena_r_portfolio.pdf",
    matchScore: 78,
    skillsMatched: ["React", "Tailwind CSS", "TypeScript"],
    skillsMissing: ["Next.js", "PostgreSQL", "AI/LLM APIs"],
    status: "Reviewing",
    appliedAt: "2024-02-12T08:45:00Z",
  },
  {
    id: "app_05",
    jobId: "job_01",
    jobTitle: "Senior Full Stack Engineer (Next.js & AI)",
    company: "NeuralPulse AI",
    location: "San Francisco, CA (Hybrid)",
    candidateId: "usr_cand_04",
    candidateName: "Marcus Vance",
    candidateEmail: "marcus.v@example.com",
    resumeFileName: "marcus_vance.pdf",
    matchScore: 65,
    skillsMatched: ["Node.js", "PostgreSQL"],
    skillsMissing: ["TypeScript", "Next.js", "Tailwind CSS", "AI/LLM APIs"],
    status: "Applied",
    appliedAt: "2024-02-13T11:00:00Z",
  },
  {
    id: "app_06",
    jobId: "job_02",
    jobTitle: "AI / ML Platform Engineer",
    company: "CognitiveScale Tech",
    location: "Remote (US/Canada)",
    candidateId: "usr_cand_05",
    candidateName: "Dr. Priyah Nair",
    candidateEmail: "priyah.nair@example.com",
    resumeFileName: "priyah_nair_phd.pdf",
    matchScore: 96,
    skillsMatched: ["Python", "PyTorch", "Kubernetes", "Vector Databases", "MLOps", "GCP"],
    skillsMissing: [],
    status: "Shortlisted",
    appliedAt: "2024-02-09T13:20:00Z",
  },
  {
    id: "app_07",
    jobId: "job_02",
    jobTitle: "AI / ML Platform Engineer",
    company: "CognitiveScale Tech",
    location: "Remote (US/Canada)",
    candidateId: "usr_cand_06",
    candidateName: "Devon Miller",
    candidateEmail: "devon.m@example.com",
    resumeFileName: "devon_miller_ml.pdf",
    matchScore: 82,
    skillsMatched: ["Python", "PyTorch", "Docker", "MLOps"],
    skillsMissing: ["Kubernetes", "Vector Databases"],
    status: "Reviewing",
    appliedAt: "2024-02-10T17:40:00Z",
  },
];

// In-memory runtime state for the session
const jobsState: Job[] = [...MOCK_JOBS];
const applicationsState: Application[] = [...MOCK_APPLICATIONS];
const candidateProfiles: Record<string, CandidateProfile> = {
  usr_cand_01: { ...MOCK_CANDIDATE_PROFILE },
};

export async function mockLogin(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; token: string; user: User }> {
  await delay();
  const entry = MOCK_USERS[email.toLowerCase().trim()];
  if (!entry || entry.password !== password) {
    throw new Error("Invalid email or password");
  }

  const token = `mock-jwt-token-${entry.user.id}-${Date.now()}`;
  return {
    success: true,
    message: "Signed in successfully",
    token,
    user: entry.user,
  };
}

export async function mockRegister(
  email: string,
  password: string,
  role: Role,
  name?: string
): Promise<{ success: boolean; message: string; token: string; user: User }> {
  await delay();
  const cleanEmail = email.toLowerCase().trim();
  if (MOCK_USERS[cleanEmail]) {
    throw new Error("An account with this email already exists");
  }

  const normalizedRole = role.toLowerCase() as Role;
  const newUser: User = {
    id: `usr_${normalizedRole.slice(0, 4)}_${Date.now()}`,
    email: cleanEmail,
    name: name || (normalizedRole === "candidate" ? "New Candidate" : "New Recruiter"),
    role: normalizedRole,
    createdAt: new Date().toISOString(),
  };

  MOCK_USERS[cleanEmail] = {
    user: newUser,
    password,
  };

  if (normalizedRole === "candidate") {
    candidateProfiles[newUser.id] = {
      id: `profile_${newUser.id}`,
      userId: newUser.id,
      extractedSkills: [],
    };
  }

  const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
  return {
    success: true,
    message: "User registered successfully",
    token,
    user: newUser,
  };
}

export async function mockGetMe(token?: string | null): Promise<{ success: boolean; user: User }> {
  await delay();
  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }

  const parts = token.split("-");
  const userId = parts[3];

  const found = Object.values(MOCK_USERS).find((u) => u.user.id === userId);
  if (found) {
    return { success: true, user: found.user };
  }

  return { success: true, user: MOCK_USERS["candidate@example.com"].user };
}

export async function mockGetJobs(
  search?: string,
  skillFilter?: string
): Promise<{ success: boolean; count: number; jobs: Job[] }> {
  await delay();
  let results = [...jobsState];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (skillFilter) {
    results = results.filter((job) =>
      job.skills.some((s) => s.toLowerCase() === skillFilter.toLowerCase())
    );
  }

  return {
    success: true,
    count: results.length,
    jobs: results,
  };
}

export async function mockGetJobById(id: string): Promise<{ success: boolean; job: Job | null }> {
  await delay();
  const job = jobsState.find((j) => j.id === id);
  return {
    success: true,
    job: job || null,
  };
}

export async function mockCreateJob(
  recruiterId: string,
  input: {
    title: string;
    description: string;
    location: string;
    type?: "Full-time" | "Part-time" | "Contract" | "Remote";
    salary?: string;
    skills: string[];
  }
): Promise<{ success: boolean; message: string; job: Job }> {
  await delay();
  const recruiter = Object.values(MOCK_USERS).find((u) => u.user.id === recruiterId)?.user;
  const companyName = recruiter ? `${recruiter.name}'s Company` : "Innovative Labs";

  const newJob: Job = {
    id: `job_${Date.now()}`,
    title: input.title,
    company: companyName,
    location: input.location,
    type: input.type || "Full-time",
    salary: input.salary || "$130,000 - $165,000",
    description: input.description,
    requirements: [
      "Demonstrated experience with the required tech stack",
      "Excellent communication and collaboration skills",
      "Problem-solving mindset and independent project delivery",
    ],
    skills: input.skills,
    recruiterId,
    createdAt: new Date().toISOString(),
  };

  jobsState.unshift(newJob);
  return {
    success: true,
    message: "Job opening created successfully",
    job: newJob,
  };
}

export async function mockGetCandidateProfile(
  userId: string
): Promise<{ success: boolean; profile: CandidateProfile }> {
  await delay();
  if (candidateProfiles[userId]) {
    return { success: true, profile: candidateProfiles[userId] };
  }

  const defaultProfile: CandidateProfile = {
    id: `profile_${userId}`,
    userId,
    extractedSkills: [],
  };
  candidateProfiles[userId] = defaultProfile;
  return { success: true, profile: defaultProfile };
}

export async function mockUploadResume(
  userId: string,
  file: { name: string; size: number }
): Promise<{ success: boolean; profile: CandidateProfile; extractedSkills: string[] }> {
  await delay(800);

  const standardExtracted = [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "PostgreSQL",
    "Docker",
    "Git",
    "REST APIs",
    "GraphQL",
    "CI/CD",
  ];

  const profile: CandidateProfile = {
    id: `profile_${userId}`,
    userId,
    resumeName: file.name,
    resumeSize: file.size,
    uploadedAt: new Date().toISOString(),
    extractedSkills: standardExtracted,
    experienceYears: 5,
    education: "B.S. in Computer Science",
    summary: `Extracted profile for ${file.name}. Demonstrates strong full-stack web and cloud experience.`,
  };

  candidateProfiles[userId] = profile;
  return {
    success: true,
    profile,
    extractedSkills: standardExtracted,
  };
}

export async function mockGetCandidateApplications(
  candidateId: string
): Promise<{ success: boolean; count: number; applications: Application[] }> {
  await delay();
  const list = applicationsState.filter((app) => app.candidateId === candidateId);
  return {
    success: true,
    count: list.length,
    applications: list,
  };
}

export async function mockApplyToJob(
  jobId: string,
  candidate: User
): Promise<{ success: boolean; application: Application }> {
  await delay();
  const job = jobsState.find((j) => j.id === jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  const existing = applicationsState.find(
    (app) => app.jobId === jobId && app.candidateId === candidate.id
  );
  if (existing) {
    throw new Error("You have already applied to this position");
  }

  const profile = candidateProfiles[candidate.id] || MOCK_CANDIDATE_PROFILE;
  const candidateSkills = profile.extractedSkills || [];

  const matched = job.skills.filter((reqSkill) =>
    candidateSkills.some((cSkill) => cSkill.toLowerCase() === reqSkill.toLowerCase())
  );
  const missing = job.skills.filter((reqSkill) => !matched.includes(reqSkill));
  const matchScore =
    job.skills.length > 0
      ? Math.round((matched.length / job.skills.length) * 100)
      : 85;

  const newApp: Application = {
    id: `app_${Date.now()}`,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    location: job.location,
    candidateId: candidate.id,
    candidateName: candidate.name || candidate.email.split("@")[0],
    candidateEmail: candidate.email,
    resumeFileName: profile.resumeName || "resume_submission.pdf",
    matchScore: Math.max(matchScore, 50),
    skillsMatched: matched.length > 0 ? matched : ["General Software Engineering"],
    skillsMissing: missing,
    status: "Applied",
    appliedAt: new Date().toISOString(),
  };

  applicationsState.unshift(newApp);
  return {
    success: true,
    application: newApp,
  };
}

export async function mockGetRecruiterApplicants(
  recruiterId: string,
  jobId?: string
): Promise<{ success: boolean; count: number; jobs: { job: Job; applicants: Application[] }[] }> {
  await delay();

  const recruiterJobs = jobsState.filter(
    (j) => j.recruiterId === recruiterId || recruiterId === "usr_rec_01"
  );

  const targetJobs = jobId
    ? recruiterJobs.filter((j) => j.id === jobId)
    : recruiterJobs;

  const results = targetJobs.map((job) => {
    const applicants = applicationsState
      .filter((app) => app.jobId === job.id)
      .sort((a, b) => b.matchScore - a.matchScore);

    return { job, applicants };
  });

  return {
    success: true,
    count: results.length,
    jobs: results,
  };
}

export async function mockUpdateApplicationStatus(
  applicationId: string,
  status: Application["status"]
): Promise<{ success: boolean; application: Application }> {
  await delay();
  const index = applicationsState.findIndex((app) => app.id === applicationId);
  if (index === -1) {
    throw new Error("Application not found");
  }
  applicationsState[index] = {
    ...applicationsState[index],
    status,
  };
  return {
    success: true,
    application: applicationsState[index],
  };
}
