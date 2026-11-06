"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Job } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Briefcase,
  Building,
  ChevronRight,
  Filter,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const fetchJobs = useCallback(async (search?: string, skill?: string) => {
    setLoading(true);
    try {
      const data: any = await api.jobs.getAll(search, skill);
      const jobList = Array.isArray(data) ? data : data?.jobs || data?.data || [];
      setJobs(jobList);
    } catch (err) {
      console.error("Failed to load jobs", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(searchQuery, selectedSkill || undefined);
  }, [fetchJobs, selectedSkill, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(searchQuery, selectedSkill || undefined);
  };

  const allSkills = Array.isArray(jobs)
    ? Array.from(
        new Set(
          jobs.flatMap((j) =>
            Array.isArray(j.skills)
              ? j.skills.map((s: any) => (typeof s === "string" ? s : s?.skill || String(s)))
              : []
          )
        )
      ).slice(0, 10)
    : [];

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge
            variant="secondary"
            className="bg-white/10 text-indigo-200 border-white/20 backdrop-blur"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-300" />
            AI-Matched Careers
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Discover Your Next High-Impact Engineering Role
          </h1>
          <p className="text-indigo-100 text-base md:text-lg leading-relaxed">
            Browse verified tech positions. Upload your resume to calculate your AI compatibility score.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="flex-1">
              <Input
                placeholder="Search job title, skill, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-white border-0 shadow-inner h-11"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="bg-indigo-500 hover:bg-indigo-400">
              Search Jobs
            </Button>
          </form>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter by Popular Skills */}
      {allSkills.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Popular Tech:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSkill(null)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              selectedSkill === null
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            All Roles
          </button>
          {allSkills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                selectedSkill === skill
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      {/* Jobs List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Available Positions
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-normal">
              {jobs.length} open
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500">Searching active job postings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No jobs found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                No matching opportunities found for your criteria. Try adjusting your search query or filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSkill(null);
                  fetchJobs("", undefined);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                <Card className="hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h3>
                          <Badge variant="outline" className="text-xs font-medium">
                            {job.type}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                            <Building className="w-4 h-4 text-slate-400" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {job.location}
                          </span>
                          {job.salary && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                              {job.salary}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 pt-1">
                          {job.description}
                        </p>

                        {/* Skills */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-2">
                          {Array.isArray(job.skills) &&
                            job.skills.map((s: any, idx: number) => {
                              const skillName = typeof s === "string" ? s : s?.skill || String(s);
                              return (
                                <Badge
                                  key={`${skillName}-${idx}`}
                                  variant="secondary"
                                  className="text-xs font-normal"
                                >
                                  {skillName}
                                </Badge>
                              );
                            })}
                        </div>
                      </div>

                      <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-400">
                          Posted recently
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/60 dark:group-hover:text-indigo-300"
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

