"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import { api, formatApplicationStatus, toBackendStatus } from "@/lib/api";
import { Application, CandidateProfile } from "@/lib/types";
import { formatFileSize, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ErrorBanner } from "@/components/ui/error-banner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Briefcase,
  CheckCircle2,
  ExternalLink,
  FileText,
  Sparkles,
  TrendingUp,
  UploadCloud,
} from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function CandidateDashboard() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const loadCandidateData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [rawProfile, rawApps]: any = await Promise.all([
        api.candidate.getProfile(user.id),
        api.candidate.getApplications(user.id),
      ]);
      const userProfile = rawProfile && "profile" in rawProfile ? rawProfile.profile : rawProfile;
      const userApps = Array.isArray(rawApps) ? rawApps : rawApps?.applications || rawApps?.data || [];
      setProfile(userProfile);
      setApplications(userApps);
    } catch (err) {
      console.error("Failed to load candidate data", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCandidateData();
  }, [loadCandidateData]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setUploadSuccess(null);

    // Client-side Validation: PDF ONLY
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setErrorMessage("Invalid file format. Please upload a PDF resume (.pdf) only.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Client-side Validation: MAX 5 MB
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(
        `File size exceeds 5 MB limit. Your file is ${sizeMb} MB. Please upload a smaller file.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!user) return;

    setIsUploading(true);
    try {
      const result = await api.candidate.uploadResume(user.id, file);
      setProfile(result.profile);
      setUploadSuccess(
        `Resume "${file.name}" uploaded successfully! Extracted ${result.extractedSkills.length} key skills.`
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An error occurred while uploading your resume.");
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getStatusBadgeVariant = (status: Application["status"]) => {
    const upper = toBackendStatus(status);
    switch (upper) {
      case "SHORTLISTED":
      case "OFFERED":
        return "success";
      case "REVIEWING":
      case "INTERVIEWING":
        return "default";
      case "APPLIED":
        return "secondary";
      case "REJECTED":
        return "danger";
      default:
        return "outline";
    }
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 90) {
      return (
        <Badge variant="success" className="font-bold">
          {score}% Match
        </Badge>
      );
    }
    if (score >= 75) {
      return (
        <Badge variant="default" className="font-bold">
          {score}% Match
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className="font-semibold">
        {score}% Match
      </Badge>
    );
  };

  return (
    <ProtectedRoute allowedRoles={["candidate", "CANDIDATE"]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Candidate Workspace
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome back, <span className="font-medium text-slate-800 dark:text-slate-200">{user?.name || user?.email}</span>. Manage your resume and job applications.
            </p>
          </div>
          <Link href="/jobs">
            <Button variant="primary" leftIcon={<Briefcase className="w-4 h-4" />}>
              Find More Jobs
            </Button>
          </Link>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <ErrorBanner
            title="Upload Error"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        {uploadSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-sm font-medium">{uploadSuccess}</p>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Loading candidate profile...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Resume Upload & Extracted Skills */}
            <div className="lg:col-span-1 space-y-6">
              {/* Resume Upload Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Resume & Profile
                  </CardTitle>
                  <CardDescription>
                    Upload your latest CV in PDF format (Max 5 MB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Upload Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      isUploading
                        ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                        : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        {isUploading ? (
                          <Spinner size="md" />
                        ) : (
                          <UploadCloud className="w-6 h-6" />
                        )}
                      </div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isUploading ? "Extracting skills with AI..." : "Click or drag PDF to upload"}
                      </div>
                      <p className="text-xs text-slate-500">
                        Strictly PDF only • Maximum 5 MB
                      </p>
                    </div>
                  </div>

                  {/* Active Resume Info */}
                  {profile?.resumeName && (
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div className="truncate text-xs">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {profile.resumeName}
                          </p>
                          <p className="text-slate-500">
                            {profile.resumeSize ? formatFileSize(profile.resumeSize) : "1.8 MB"} • Uploaded {profile.uploadedAt ? formatDate(profile.uploadedAt) : "Recently"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 text-emerald-600 border-emerald-300">
                        Active CV
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Extracted Skills Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Extracted Skills
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {profile?.extractedSkills.length || 0} Identified
                    </Badge>
                  </div>
                  <CardDescription>
                    Skills parsed from your resume used for AI job matching
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile?.extractedSkills && profile.extractedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.extractedSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="default"
                          className="text-xs py-1 px-2.5 bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Upload your PDF resume above to extract technical skills automatically.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Applications Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        My Job Applications
                      </CardTitle>
                      <CardDescription>
                        Track status, recruiter feedback, and AI compatibility scores
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {applications.length} Total
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  {applications.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        No applications submitted yet
                      </h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        Explore available engineering positions and apply with your uploaded resume.
                      </p>
                      <Link href="/jobs">
                        <Button variant="outline" size="sm">
                          Browse Positions
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Role & Company</TableHead>
                          <TableHead>AI Match</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applied Date</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {app.jobTitle}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span>{app.company}</span>
                                <span>•</span>
                                <span>{app.location}</span>
                              </div>
                            </TableCell>

                            <TableCell>{getMatchScoreBadge(app.matchScore)}</TableCell>

                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(app.status)}>
                                {formatApplicationStatus(app.status)}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-xs text-slate-500">
                              {formatDate(app.appliedAt)}
                            </TableCell>

                            <TableCell className="text-right">
                              <Link href={`/jobs/${app.jobId}`}>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                  View Job <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

