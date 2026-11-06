# AI-Powered Applicant Tracking System (ATS)

A full-stack, AI-powered Applicant Tracking System consisting of:
- **Frontend** (`/client`): Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** (`/server`): Express.js + TypeScript + Prisma ORM + PostgreSQL 16
- **Database** (`docker-compose.yml`): PostgreSQL 16 container

---

## 📁 Repository Overview

```
AI Powered ATS/
├── client/                     # Next.js 14 Frontend Application
│   ├── app/                    # App Router pages (/login, /register, /jobs, /candidate, /recruiter)
│   ├── components/             # Reusable UI library (Button, Input, Card, Table, etc.)
│   ├── context/                # In-memory JWT Auth context
│   ├── lib/                    # API client, types, and mock data
│   ├── .env.example            # Client environment variables
│   └── README.md               # Frontend setup guide
│
├── server/                     # Express + TypeScript Backend
│   ├── prisma/
│   │   └── schema.prisma       # Prisma models: User, Job, JobSkill, Resume, CandidateSkill, Application
│   ├── src/
│   │   ├── controllers/        # Express controllers (auth, job, recruiter)
│   │   ├── services/           # Business logic layer (auth, job)
│   │   ├── middleware/         # requireAuth, requireRole, validateBody, errorHandler
│   │   ├── routes/             # Express routes (/auth, /jobs, /recruiter, /health)
│   │   ├── validations/        # Zod validation schemas
│   │   └── lib/                # Prisma client singleton, Zod env parser, AppError classes
│   ├── docker-compose.yml      # PostgreSQL 16 container definition
│   ├── .env.example            # Server environment variables
│   └── README.md               # Backend setup guide & API reference
│
├── docker-compose.yml          # Root PostgreSQL 16 service
└── README.md
```

---

## ⚡ Quick Start

### 1. Start PostgreSQL 16
```bash
docker compose up -d
```

### 2. Start the Backend Server
```bash
cd server
npm install
npx prisma db push
npm run dev
```
Backend runs at [http://localhost:8000](http://localhost:8000).
Check health: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Start the Frontend Client
```bash
cd client
npm install
npm run dev
```
Frontend runs at [http://localhost:3000](http://localhost:3000).
