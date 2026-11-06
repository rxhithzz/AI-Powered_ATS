"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Bot,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-6 md:py-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <Badge
          variant="default"
          className="px-4 py-1.5 text-xs font-semibold rounded-full bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/80 dark:border-indigo-800 dark:text-indigo-300"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500 animate-pulse" />
          Next-Gen AI Applicant Tracking System
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Intelligent Hiring Powered by{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
            Semantic Match Scores
          </span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Screen resumes instantly with client-side PDF verification, extract technical skills automatically, and match candidates with high-impact engineering roles.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/jobs">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Open Jobs
            </Button>
          </Link>
          {user ? (
            <Link href={user.role?.toLowerCase() === "candidate" ? "/candidate" : "/recruiter"}>
              <Button size="lg" variant="outline">
                Open {user.role?.toLowerCase() === "candidate" ? "Candidate Portal" : "Recruiter Hub"}
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button size="lg" variant="outline">
                Join ATS Flow
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Client-Side PDF Screening
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Candidate resumes are validated in the browser (PDF format check and strict 5 MB limits) before intelligent skill extraction.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Ranked Applicant Matrix
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Recruiters view candidate pools automatically ordered by match score percentage, speeding up evaluation and shortlisting.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Skill Tag Intelligence
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create jobs with interactive skill tags and immediately match candidates possessing the exact required engineering stack.
          </p>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Ready to explore the ATS Flow interface?
            </h3>
            <p className="text-sm text-slate-500">
              Test candidate resume uploads and recruiter job posting tools with built-in mock responses.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/candidate">
              <Button variant="outline" size="sm">
                Candidate View
              </Button>
            </Link>
            <Link href="/recruiter">
              <Button variant="primary" size="sm">
                Recruiter View
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
