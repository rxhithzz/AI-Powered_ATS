"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { USE_MOCKS } from "@/lib/api";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Sparkles,
  Users,
  X,
} from "lucide-react";

export function Navbar() {
  const { user, logout, login } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isQuickSwitching, setIsQuickSwitching] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleQuickLogin = async (role: "candidate" | "recruiter") => {
    setIsQuickSwitching(true);
    try {
      const email = role === "candidate" ? "candidate@example.com" : "recruiter@example.com";
      await login(email, "password123");
      router.push(role === "candidate" ? "/candidate" : "/recruiter");
    } finally {
      setIsQuickSwitching(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  ATS Flow
                  <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                    AI
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">Intelligent Recruitment</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/jobs"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/jobs")
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  Jobs
                </span>
              </Link>

              {user && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </span>
                </Link>
              )}

              {user?.role?.toLowerCase() === "candidate" && (
                <Link
                  href="/candidate"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/candidate")
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Candidate Portal
                  </span>
                </Link>
              )}

              {user?.role?.toLowerCase() === "recruiter" && (
                <Link
                  href="/recruiter"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/recruiter")
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Recruiter Portal
                  </span>
                </Link>
              )}
            </nav>
          </div>

          {/* User actions */}
          <div className="hidden md:flex items-center gap-3">
            {USE_MOCKS && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[11px] py-0.5 border-dashed border-amber-400 text-amber-700 bg-amber-50/50 dark:text-amber-300 dark:bg-amber-950/30">
                  Mocks Active
                </Badge>
                {!user && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400">Quick test:</span>
                    <button
                      type="button"
                      disabled={isQuickSwitching}
                      onClick={() => handleQuickLogin("candidate")}
                      className="px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:text-indigo-300 rounded transition-colors"
                    >
                      As Candidate
                    </button>
                    <button
                      type="button"
                      disabled={isQuickSwitching}
                      onClick={() => handleQuickLogin("recruiter")}
                      className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:text-emerald-300 rounded transition-colors"
                    >
                      As Recruiter
                    </button>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.name ? user.name[0] : user.email[0]}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                      {user.name || user.email}
                    </span>
                    <Badge
                      variant={user.role?.toLowerCase() === "recruiter" ? "success" : "default"}
                      className="text-[10px] px-1.5 py-0 capitalize"
                    >
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-3 bg-white dark:bg-slate-900">
          <div className="space-y-1">
            <Link
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200"
            >
              Browse Jobs
            </Link>
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200"
              >
                Dashboard
              </Link>
            )}
            {user?.role?.toLowerCase() === "candidate" && (
              <Link
                href="/candidate"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200"
              >
                Candidate Portal
              </Link>
            )}
            {user?.role?.toLowerCase() === "recruiter" && (
              <Link
                href="/recruiter"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200"
              >
                Recruiter Portal
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {user.name || user.email}
                  </span>
                  <Badge variant={user.role?.toLowerCase() === "recruiter" ? "success" : "default"}>
                    {user.role}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

