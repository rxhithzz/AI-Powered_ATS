"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Role } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500">Authenticating session...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Case-insensitive role comparison: handles "recruiter", "RECRUITER", "candidate", "CANDIDATE"
  const userRoleLower = user.role ? String(user.role).toLowerCase() : "";
  const isAllowed =
    !allowedRoles ||
    allowedRoles.length === 0 ||
    allowedRoles.some((r) => String(r).toLowerCase() === userRoleLower);

  if (!isAllowed) {
    // Navigate to the user's role-based portal
    const targetPortal = userRoleLower === "recruiter" ? "/recruiter" : "/candidate";

    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          This portal is reserved for <span className="font-semibold">{allowedRoles.join(" or ")}</span> accounts.
          You are currently signed in as a <span className="font-semibold capitalize">{user.role}</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            onClick={() => router.push(targetPortal)}
          >
            Go to My Portal
          </Button>
          <Button variant="outline" onClick={() => router.push("/jobs")}>
            Browse Jobs
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
