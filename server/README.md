# ATS Flow - Express + TypeScript + Prisma Backend

High-performance Express.js backend for ATS Flow built with TypeScript, Prisma ORM, and PostgreSQL 16. Includes PDF resume text extraction, Google Gemini AI skill extraction with alias normalization, and rule-based candidate application scoring.

---

## 🛠️ Tech Stack & Architecture

- **Runtime**: Node.js + Express
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 16
- **ORM**: Prisma 5
- **Authentication**: JWT (Bearer tokens with 1 day expiry, bcryptjs hashing)
- **AI & Document Processing**: Google Gemini API (`@google/generative-ai`), `pdf-parse`, `multer`
- **Validation**: Zod schema validation on request payloads and AI outputs
- **Containerization**: Docker Compose (PostgreSQL 16)

---

## 📂 Directory Structure

```
server/
├── prisma/
│   └── schema.prisma        # Prisma data models: User, Job, JobSkill, Resume, CandidateSkill, Application
├── src/
│   ├── controllers/         # Thin request controllers
│   │   ├── application.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── candidate.controller.ts
│   │   ├── job.controller.ts
│   │   ├── recruiter.controller.ts
│   │   └── resume.controller.ts
│   ├── lib/                 # Core utilities
│   │   ├── env.ts           # Zod validated environment variables
│   │   ├── errors.ts        # Structured AppError classes
│   │   └── prisma.ts        # Prisma Client singleton
│   ├── middleware/          # Express middlewares
│   │   ├── auth.middleware.ts     # requireAuth & requireRole(...roles)
│   │   ├── error.middleware.ts    # Centralized error handler
│   │   ├── upload.middleware.ts   # Multer memory storage & PDF-only validator
│   │   └── validate.middleware.ts # Zod body validation middleware
│   ├── routes/              # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── candidate.routes.ts
│   │   ├── health.routes.ts
│   │   ├── index.ts
│   │   ├── job.routes.ts
│   │   ├── recruiter.routes.ts
│   │   └── resume.routes.ts
│   ├── services/            # Business logic layer
│   │   ├── ai.service.ts          # Gemini AI skill extraction & normalization
│   │   ├── application.service.ts # Application creation, ranking, and queries
│   │   ├── auth.service.ts        # Registration & login
│   │   ├── candidate.service.ts   # Resume handling & skill management
│   │   ├── job.service.ts         # Job creation & queries
│   │   ├── matching.ts            # Pure rule-based scoreMatch() algorithm
│   │   ├── matching.test.ts       # Automated unit tests for scoreMatch
│   │   └── storage.service.ts     # StorageService interface (LocalStorage + Cloudinary stub)
│   ├── types/               # TypeScript definitions
│   │   └── index.ts
│   ├── validations/         # Zod schemas for request payloads
│   │   ├── auth.validation.ts
│   │   ├── candidate.validation.ts
│   │   └── job.validation.ts
│   ├── app.ts               # Express application setup
│   └── index.ts             # Server entry point & graceful shutdown
├── .env.example             # Environment template
├── docker-compose.yml       # PostgreSQL 16 container definition
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [Docker & Docker Compose](https://www.docker.com/) (for running PostgreSQL locally)

### 2. Start PostgreSQL 16
```bash
docker compose up -d
```
*(Runs Postgres 16 on port `5432` with user `postgres`, password `postgres`, and db `ats_db`)*

### 3. Install Dependencies
```bash
cd server
npm install
```

### 4. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```

Environment variables:
```env
PORT=8000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ats_db?schema=public
JWT_SECRET=ats_dev_jwt_secret_key_1234567890
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:3000

# Google Gemini AI (Optional: if empty, app works with safe fallback)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

# Storage
UPLOAD_DIR=uploads
```

### 5. Synchronize the Database Schema
```bash
npx prisma db push
```

### 6. Run Unit Tests
```bash
npm test
```
Tests the pure rule-based `scoreMatch(jobSkills, candidateSkills)` logic.

### 7. Run the Development Server
```bash
npm run dev
```
The server will start at [http://localhost:8000](http://localhost:8000).

---

## 📡 API Endpoints Specification

All endpoints are also available under `/api/*` (e.g., `/api/resumes`).

### 1. Authentication
* **`POST /auth/register`**: Register new user (`CANDIDATE` or `RECRUITER`).
* **`POST /auth/login`**: Sign in and receive 1-day JWT.
* **`GET /auth/me`**: Get current user profile.

---

### 2. Jobs
* **`GET /jobs`**: Public list of open jobs.
* **`GET /jobs/:id`**: Public job details.
* **`POST /jobs`**: Requires `RECRUITER`. Creates a job with skills tags.
* **`POST /jobs/:id/apply`**: Requires `CANDIDATE`. Applies to an open job.
  * Calculates `matchScore` using the rule-based formula: candidate's percentage of job skills, with required skills counting double (weight 2 vs 1), rounded to integer `0-100`.
  * Returns `409 Conflict` if the candidate has already applied.
* **`GET /jobs/:id/applicants`**: Requires `RECRUITER` who owns the job. Returns candidate applicants with name, email, matchScore, and skills, sorted by `matchScore` descending.

---

### 3. Resume & Skill Extraction
* **`POST /resumes`**: Requires `CANDIDATE`.
  * Accepts multipart form data with a single PDF file (max 5 MB).
  * Stores the file through `StorageService` (`LocalStorage` writing to `/uploads`).
  * Extracts raw text using `pdf-parse` and saves to `Resume.rawText`.
  * Calls Gemini AI (`extractSkills`) asking for strict JSON: `{ "skills": string[], "yearsExperience": number }` with automatic retry and Zod validation.
  * Normalizes skill names through an alias map (e.g., `reactjs` -> `React`, `node` -> `Node.js`).
  * Replaces previous `PARSED` rows in `CandidateSkill`.
  * If `GEMINI_API_KEY` is missing, skips Gemini and returns empty skills gracefully.
  * Returns `201 Created` with `{ resumeId, fileUrl, extractedSkills }`.
* **`POST /candidate/skills`**: Requires `CANDIDATE`. Add manual skills (`source: MANUAL`).
* **`GET /candidate/skills`**: Requires `CANDIDATE`. Get all skills for the authenticated candidate.
* **`GET /candidate/applications`**: Requires `CANDIDATE`. Returns the candidate's applications with job titles.

---

### 4. Recruiter Dashboard
* **`GET /recruiter/jobs`**: Requires `RECRUITER`. Lists the recruiter's own jobs with application counts.

---

### 5. Health Check
* **`GET /health`**: Returns system status, database connectivity, and server uptime.
