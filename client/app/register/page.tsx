"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBanner } from "@/components/ui/error-banner";
import { Briefcase, CheckCircle2, Lock, Mail, User as UserIcon, Users } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["candidate", "recruiter"] as const),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerAuth } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "candidate",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError(null);
      const user = await registerAuth(data.email, data.password, data.role, data.name);
      router.push(user.role?.toLowerCase() === "candidate" ? "/candidate" : "/recruiter");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Failed to create account. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-8">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
              <Users className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription>
              Join ATS Flow to discover top tech opportunities or hire stellar talent
            </CardDescription>
          </CardHeader>

          <CardContent>
            {serverError && (
              <div className="mb-5">
                <ErrorBanner
                  title="Registration Error"
                  message={serverError}
                  onDismiss={() => setServerError(null)}
                />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Role Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  I want to join as a:
                </label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => field.onChange("candidate")}
                        className={`relative cursor-pointer rounded-xl border p-4 flex flex-col items-start transition-all ${
                          field.value === "candidate"
                            ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          {field.value === "candidate" && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          Candidate
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Upload resume, get matched & apply
                        </span>
                      </div>

                      <div
                        onClick={() => field.onChange("recruiter")}
                        className={`relative cursor-pointer rounded-xl border p-4 flex flex-col items-start transition-all ${
                          field.value === "recruiter"
                            ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          {field.value === "recruiter" && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          Recruiter
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Post jobs & rank applicant scores
                        </span>
                      </div>
                    </div>
                  )}
                />
                {errors.role && (
                  <p className="mt-1.5 text-xs text-rose-600">{errors.role.message}</p>
                )}
              </div>

              <Input
                label="Full Name"
                placeholder="Alex Rivera"
                leftIcon={<UserIcon className="w-4 h-4" />}
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@domain.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register("password")}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-3"
                size="lg"
                isLoading={isSubmitting}
              >
                Create Account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-sm text-slate-600 dark:text-slate-400">
            Already registered?{" "}
            <Link
              href="/login"
              className="ml-1.5 font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

