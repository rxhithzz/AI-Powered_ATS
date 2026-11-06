"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import {
  APPLICATION_STATUS_MAP,
  BACKEND_STATUSES,
  api,
  toBackendStatus,
} from "@/lib/api";
import { Application, ApplicationStatus, Job } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ArrowDownUp,
  Briefcase,
  CheckCircle2,
  FileText,
  MapPin,
  Plus,
  Sparkles,
  Users,
  X,
} from "lucide-react";

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const [jobApplicantGroups, setJobApplicantGroups] = useState<
    { job: Job; applicants: Application[] }[]
  >([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Create Job Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(["TypeScript", "React", "Next.js"]);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // Status update tracking
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data: any = await api.recruiter.getApplicants(
        user.id,
        selectedJobId === "all" ? undefined : selectedJobId
      );
      const groups = Array.isArray(data) ? data : data?.jobs || data?.applicants || data?.data || [];
      setJobApplicantGroups(groups);
    } catch (err) {
      console.error("Failed to load recruiter data", err);
      setJobApplicantGroups([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedJobId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || skills.length === 0) {
      setBannerMessage({
        type: "error",
        text: "Please fill in title, description, location, and at least one skill tag.",
      });
      return;
    }

    if (!user) return;

    setIsSubmittingJob(true);
    setBannerMessage(null);
    try {
      const newJob = await api.jobs.create(
        {
          title,
          description,
          location,
          skills,
        },
        user.id
      );

      setBannerMessage({
        type: "success",
        text: `Job posting "${newJob.title}" created successfully!`,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setSkills(["TypeScript", "React"]);
      setShowCreateModal(false);

      // Reload jobs
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setBannerMessage({ type: "error", text: err.message });
      }
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    // Find candidate application to preserve previous status in case revert is required
    let prevStatus: ApplicationStatus = "APPLIED";
    for (const group of jobApplicantGroups) {
      const found = group.applicants?.find((a) => a.id === appId);
      if (found) {
        prevStatus = found.status;
        break;
      }
    }

    setUpdatingAppId(appId);
    setBannerMessage(null);

    // Optimistically update the table status immediately
    setJobApplicantGroups((prev) =>
      prev.map((group) => ({
        ...group,
        applicants: group.applicants.map((a) =>
          a.id === appId ? { ...a, status: newStatus as ApplicationStatus } : a
        ),
      }))
    );

    try {
      const updatedApp = await api.recruiter.updateStatus(appId, newStatus);
      const confirmedStatus = updatedApp?.status || (newStatus as ApplicationStatus);
      // Synchronize confirmed status from backend response
      setJobApplicantGroups((prev) =>
        prev.map((group) => ({
          ...group,
          applicants: group.applicants.map((a) =>
            a.id === appId ? { ...a, status: confirmedStatus } : a
          ),
        }))
      );
    } catch (err: unknown) {
      console.error("Failed to update status", err);
      // Revert dropdown to previous status on error
      setJobApplicantGroups((prev) =>
        prev.map((group) => ({
          ...group,
          applicants: group.applicants.map((a) =>
            a.id === appId ? { ...a, status: prevStatus } : a
          ),
        }))
      );
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update application status. Please try again.";
      setBannerMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setUpdatingAppId(null);
    }
  };

  // Flatten or filter applicants based on selection, ensuring sorted by match score
  const allApplicants = Array.isArray(jobApplicantGroups)
    ? jobApplicantGroups
        .flatMap((group) => (Array.isArray(group.applicants) ? group.applicants : []))
        .sort((a, b) => b.matchScore - a.matchScore)
    : [];

  const displayedApplicants =
    selectedJobId === "all"
      ? allApplicants
      : (
          jobApplicantGroups.find((g) => g.job?.id === selectedJobId)?.applicants || []
        ).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <ProtectedRoute allowedRoles={["recruiter", "RECRUITER"]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Recruiter Talent Hub
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Create jobs and screen candidate applications ranked by AI match scores.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(!showCreateModal)}
            leftIcon={showCreateModal ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          >
            {showCreateModal ? "Cancel" : "Create New Job"}
          </Button>
        </div>

        {/* Feedback Notifications */}
        {bannerMessage && (
          <div>
            {bannerMessage.type === "error" ? (
              <ErrorBanner
                title="Error"
                message={bannerMessage.text}
                onDismiss={() => setBannerMessage(null)}
              />
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-sm font-medium">{bannerMessage.text}</p>
              </div>
            )}
          </div>
        )}

        {/* "Create Job" Form Section (Collapsible/Togglable) */}
        {showCreateModal && (
          <Card className="border-indigo-200 dark:border-indigo-900 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Create a New Job Opening
              </CardTitle>
              <CardDescription>
                Define the requirements and technical skill tags to enable AI candidate scoring
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleCreateJob} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Job Title"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <Input
                    label="Location"
                    placeholder="e.g. San Francisco, CA (or Remote)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4" />}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                    Job Description & Responsibilities
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the role expectations, deliverables, and requirements..."
                    className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Skills as Tags */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                    Required Skills (Tags for AI Scoring)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Type skill (e.g. Next.js, Python) and press Enter"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleKeyDownSkill}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={handleAddSkill}>
                      Add Tag
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap min-h-[36px] p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                    {skills.length === 0 ? (
                      <span className="text-xs text-slate-400">No skill tags added yet. Add at least one.</span>
                    ) : (
                      skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs px-2.5 py-1 rounded-full font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-rose-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmittingJob}
                  >
                    Publish Job Opening
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Applicants Table & Filtering Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Applicants Ranked by AI Match Score
              </h2>
              <p className="text-xs text-slate-500">
                Sorted strictly by highest algorithmic compatibility to lowest
              </p>
            </div>

            {/* Job Filter Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="job-filter" className="text-xs font-semibold text-slate-500 shrink-0">
                Filter by Job:
              </label>
              <select
                id="job-filter"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Jobs ({allApplicants.length} applicants)</option>
                {jobApplicantGroups.map(({ job, applicants }) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({applicants.length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" />
              <p className="text-sm text-slate-500">Loading applicant rankings...</p>
            </div>
          ) : displayedApplicants.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  No applicants found
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  There are no candidate submissions for this selection yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Target Position</TableHead>
                  <TableHead className="flex items-center gap-1.5 cursor-default">
                    AI Match Score
                    <ArrowDownUp className="w-3.5 h-3.5 text-indigo-500" />
                  </TableHead>
                  <TableHead>Skills Matched</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Status & Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedApplicants.map((app) => (
                  <TableRow key={app.id}>
                    {/* Candidate Name & Email */}
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {app.candidateName}
                      </div>
                      <div className="text-xs text-slate-500">{app.candidateEmail}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Applied {formatDate(app.appliedAt)}
                      </div>
                    </TableCell>

                    {/* Job Title */}
                    <TableCell>
                      <span className="font-medium text-xs text-slate-800 dark:text-slate-200">
                        {app.jobTitle}
                      </span>
                    </TableCell>

                    {/* Match Score */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs ${
                            app.matchScore >= 90
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : app.matchScore >= 75
                              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {app.matchScore}%
                        </div>
                      </div>
                    </TableCell>

                    {/* Skills Matched */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {app.skillsMatched.map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-[11px] py-0 px-1.5 font-normal"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    {/* Resume */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        {app.resumeFileName || "resume.pdf"}
                      </span>
                    </TableCell>

                    {/* Status Dropdown / Action */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <select
                          value={toBackendStatus(app.status)}
                          disabled={updatingAppId === app.id}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          className={`text-xs font-medium rounded-lg border px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                            toBackendStatus(app.status) === "SHORTLISTED" ||
                            toBackendStatus(app.status) === "OFFERED"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : toBackendStatus(app.status) === "INTERVIEWING" ||
                                toBackendStatus(app.status) === "REVIEWING"
                              ? "border-indigo-300 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                              : toBackendStatus(app.status) === "REJECTED"
                              ? "border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                              : "border-slate-300 bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {BACKEND_STATUSES.map((statusKey) => (
                            <option key={statusKey} value={statusKey}>
                              {APPLICATION_STATUS_MAP[statusKey] || statusKey}
                            </option>
                          ))}
                        </select>
                        {updatingAppId === app.id && (
                          <Spinner size="sm" className="text-indigo-600 shrink-0" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

