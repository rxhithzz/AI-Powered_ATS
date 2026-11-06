"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else {
        const roleLower = user.role ? String(user.role).toLowerCase() : "";
        if (roleLower === "candidate") {
          router.replace("/candidate");
        } else if (roleLower === "recruiter") {
          router.replace("/recruiter");
        } else {
          router.replace("/jobs");
        }
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-slate-500">Redirecting to your dashboard...</p>
    </div>
  );
}
