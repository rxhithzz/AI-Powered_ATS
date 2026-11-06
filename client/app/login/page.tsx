"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Spinner } from "@/components/ui/spinner";
import { Lock, Mail, Sparkles, UserCheck } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      const user = await login(data.email, data.password);
      if (redirectUrl && redirectUrl !== "/dashboard") {
        router.push(redirectUrl);
      } else {
        router.push(user.role?.toLowerCase() === "candidate" ? "/candidate" : "/recruiter");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Failed to sign in. Please verify your credentials.");
      }
    }
  };

  const fillDemoAccount = (role: "candidate" | "recruiter") => {
    if (role === "candidate") {
      setValue("email", "candidate@example.com");
      setValue("password", "password123");
    } else {
      setValue("email", "recruiter@example.com");
      setValue("password", "password123");
    }
  };

  return (
    <Card className="shadow-lg border-slate-200 dark:border-slate-800">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
          <Lock className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to manage your applications or candidate pipeline
        </CardDescription>
      </CardHeader>

      <CardContent>
        {serverError && (
          <div className="mb-5">
            <ErrorBanner
              title="Sign In Failed"
              message={serverError}
              onDismiss={() => setServerError(null)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            size="lg"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </form>

        {/* Quick Fill for Demo */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Quick-fill demo credentials:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("candidate")}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
              Candidate Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("recruiter")}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              Recruiter Demo
            </button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-center text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="ml-1.5 font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Register here
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-8">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="flex justify-center p-12">
              <Spinner size="lg" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
