"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { Application, Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ErrorBanner } from "@/components/ui/error-banner";
import {
  ArrowLeft,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  FileCheck,
  Lock,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationResult, setApplicationResult] = useState<Application | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobAndStatus() {
      if (!id) return;
      setLoading(true);
      try {
        const foundJob: any = await api.jobs.getById(id);
        const jobData = foundJob && "job" in foundJob ? foundJob.job : foundJob;
        setJob(jobData);

        if (user && user.role?.toLowerCase() === "candidate") {
          const rawApps: any = await api.candidate.getApplications(user.id);
          const applications = Array.isArray(rawApps) ? rawApps : rawApps?.applications || [];
          const existing = applications.find((app: any) => app.jobId === id);
          if (existing) {
            setHasApplied(true);
            setApplicationResult(existing);
          }
        }
      } catch (err) {
        console.error("Error loading job:", err);
      } finally {
        setLoading(false);
      }
    }

    loadJobAndStatus();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      router.push(`/login?redirect=/jobs/${id}`);
      return;
    }

    if (user.role?.toLowerCase() !== "candidate") {
      setErrorMessage("Only candidate accounts can apply to job openings.");
      return;
    }

    setIsApplying(true);
    setErrorMessage(null);
    try {
      const rawApp: any = await api.candidate.apply(id, user);
      const app = rawApp && "application" in rawApp ? rawApp.application : rawApp;
      setHasApplied(true);
      setApplicationResult(app);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to submit application. Please try again.");
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">Job Not Found</h2>
        <p className="text-slate-500">The job posting you are looking for does not exist or has closed.</p>
        <Link href="/jobs">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all jobs
        </Link>
      </div>

      {errorMessage && (
        <ErrorBanner
          title="Notice"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Main Job Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="default" className="text-xs">
                  {job.type}
                </Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Open Position
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {job.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <Building className="w-4 h-4 text-slate-400" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location}
                </span>
                {job.salary && (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <DollarSign className="w-4 h-4" />
                    {job.salary}
                  </span>
                )}
              </div>
            </div>

            {/* Application Action Button */}
            <div className="shrink-0 flex flex-col gap-2">
              {hasApplied ? (
                <div className="flex flex-col items-center sm:items-end gap-1.5">
                  <Badge variant="success" className="text-sm py-1 px-3 gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Application Submitted
                  </Badge>
                  {applicationResult && (
                    <span className="text-xs text-slate-500 font-medium">
                      Match Score: {applicationResult.matchScore}%
                    </span>
                  )}
                  <Link href="/candidate">
                    <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                      View in Candidate Portal →
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleApply}
                  isLoading={isApplying}
                  leftIcon={!user ? <Lock className="w-4 h-4" /> : <FileCheck className="w-4 h-4" />}
                >
                  {!user
                    ? "Sign In to Apply"
                    : user.role?.toLowerCase() === "candidate"
                    ? "Apply Now"
                    : "Recruiter Account"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Application Success Card Banner */}
        {hasApplied && applicationResult && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 p-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  AI Match Calculated: {applicationResult.matchScore}% Compatibility
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Status: <span className="font-semibold">{applicationResult.status}</span>. Matched skills: {applicationResult.skillsMatched.join(", ")}
                </p>
              </div>
            </div>
            <Link href="/candidate">
              <Button variant="outline" size="sm" className="bg-white text-emerald-800 border-emerald-300">
                Go to Candidate Dashboard
              </Button>
            </Link>
          </div>
        )}

        {/* Job Body */}
        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Required Skills Tags */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Required Skills & Technologies
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {Array.isArray(job.skills) &&
                job.skills.map((skill: any, idx: number) => {
                  const skillName = typeof skill === "string" ? skill : skill?.skill || String(skill);
                  return (
                    <Badge
                      key={`${skillName}-${idx}`}
                      variant="secondary"
                      className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      {skillName}
                    </Badge>
                  );
                })}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              About the Role
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                Key Qualifications
              </h3>
              <ul className="space-y-2.5">
                {job.requirements.map((req, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm md:text-base text-slate-700 dark:text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Call to Action */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              Reference ID: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">{job.id}</code>
            </div>
            {!hasApplied && (
              <Button
                variant="primary"
                onClick={handleApply}
                isLoading={isApplying}
                leftIcon={!user ? <Lock className="w-4 h-4" /> : undefined}
              >
                {!user ? "Sign In to Apply" : "Apply for Position"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

