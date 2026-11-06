# ATS Flow - AI Powered Applicant Tracking System (Frontend)

Next.js 14 (App Router) + TypeScript + Tailwind CSS frontend for ATS Flow, featuring AI resume analysis, dynamic skill extraction, and candidate compatibility scoring.

---

## 🚀 Quick Start

### 1. Navigate to the client directory
```bash
cd client
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

Settings in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_USE_MOCKS=true
```
- `NEXT_PUBLIC_USE_MOCKS`: When set to `true`, the UI uses realistic in-memory mock responses from `lib/mocks.ts` (perfect for testing and development prior to backend availability).
- When set to `false`, the API client connects to `NEXT_PUBLIC_API_URL` sending `Bearer <token>`.

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Credentials (Mock Mode)

When `NEXT_PUBLIC_USE_MOCKS=true`, you can use the pre-seeded test accounts or click the **1-click quick-fill buttons** on the sign-in page:

| Role | Email | Password | Pre-seeded Features |
| :--- | :--- | :--- | :--- |
| **Candidate** | `candidate@example.com` | `password123` | Active resume uploaded, extracted skills, 2 submitted applications with match scores |
| **Recruiter** | `recruiter@example.com` | `password123` | 5 active job postings, applicants ranked by AI match score |

---

## 🧭 Pages & Routes

- `/login` - Email and password authentication using React Hook Form + Zod.
- `/register` - Account registration with role selection (`candidate` vs `recruiter`) validated via Zod.
- `/dashboard` - Smart redirect hub routing candidates to `/candidate` and recruiters to `/recruiter`.
- `/jobs` - Public job board displaying title, company, location, employment type, and skill tags. Features live text search and skill filtering.
- `/jobs/[id]` - In-depth job overview with role responsibilities and an **"Apply"** button (requires candidate login).
- `/candidate` - Candidate portal with client-side resume validation (strict PDF check, 5 MB limit), parsed skills view, and submitted application tracker.
- `/recruiter` - Recruiter portal with "Create Job" form (skills entered as interactive tags) and a table of applicants per job, automatically sorted by AI match score.

---

## 🛠️ Architecture

- **Auth Context (`context/auth-context.tsx`)**: Keeps the JWT in client memory and triggers `/auth/me` on initial load.
- **Protected Route (`components/auth/protected-route.tsx`)**: Enforces authentication and authorization based on role (`candidate` vs `recruiter`).
- **API Client (`lib/api.ts`)**: Reads `NEXT_PUBLIC_API_URL`, attaches `Authorization: Bearer <token>`, and routes to `lib/mocks.ts` when `NEXT_PUBLIC_USE_MOCKS=true`.
- **Reusable UI Library (`components/ui/`)**:
  - `Button` - Multiple variants (primary, secondary, outline, ghost, danger), sizes, and built-in loading states.
  - `Input` - Accessible form input with label, icons, and error states (React Hook Form compatible).
  - `Card` - Modular card layout primitives (`CardHeader`, `CardTitle`, `CardContent`, etc.).
  - `Table` - Styled responsive data table primitives (`TableHeader`, `TableRow`, `TableCell`, etc.).
  - `Badge` - Status and skill tags with color-coded variants.
  - `Spinner` - Animated loading indicator.
  - `ErrorBanner` - Dismissible error alert banner.

---

## 🧪 Production Build

To test the production build:
```bash
npm run build
npm run start
```
