"use client";

import Link from "next/link";
import axios from "axios";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AuthBrandHeader from "@/components/auth/AuthBrandHeader";
import { resetPasswordWithCode } from "@/lib/api/auth";
import { getPasswordChecks, isPasswordValid } from "@/lib/utils/password";

function getApiErrorMessage(
  error: unknown,
  fallback: string,
  joinAll = false,
): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = (error.response?.data as
      | { message?: string | string[] }
      | undefined)?.message;

    if (Array.isArray(responseMessage)) {
      return joinAll
        ? responseMessage.join(", ") || fallback
        : responseMessage[0] || fallback;
    }

    return responseMessage || fallback;
  }

  return fallback;
}

function RequirementRow({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <div className={`text-sm ${met ? "text-green-600" : "text-red-600"}`}>
      <span className="mr-2 font-medium">{met ? "✓" : "x"}</span>
      <span>{label}</span>
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code")?.trim() ?? "";
  const email = searchParams.get("email")?.trim() ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const passwordChecks = useMemo(
    () => getPasswordChecks(newPassword),
    [newPassword],
  );
  const passwordIsValid = useMemo(
    () => isPasswordValid(newPassword),
    [newPassword],
  );
  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === newPassword;
  const hasResetContext = Boolean(code && email);

  useEffect(() => {
    if (!hasResetContext) {
      setError("This reset link is incomplete. Please request a new password reset email.");
      return;
    }

    setError(null);
  }, [hasResetContext]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    if (!hasResetContext) {
      setError("Missing reset code or email. Please request a new reset link.");
      setSubmitting(false);
      return;
    }

    if (!passwordIsValid) {
      setError("New password does not meet the required rules.");
      setSubmitting(false);
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    try {
      await resetPasswordWithCode({
        code,
        email,
        newPassword,
      });

      setSuccess("Password reset successful. Redirecting to login...");
      setNewPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to reset password", true));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(180deg,_#fff8f1_0%,_#f8fafc_40%,_#edf2f7_100%)] px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-red-100/45 via-orange-100/15 to-transparent" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-red-200/20 blur-3xl" />
      <div className="absolute -right-24 bottom-6 h-80 w-80 rounded-full bg-amber-200/25 blur-3xl" />

      <div className="relative w-full max-w-lg animate-[fadeInUp_550ms_ease-out] rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
        <AuthBrandHeader
          title="Reset Password"
          subtitle="Create a new password for your NGV Arts account."
        />

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-800"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-600 outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-1 block text-sm font-medium text-gray-800"
            >
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100/70"
              placeholder="Create a new password"
            />
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
            <p className="mb-3 text-sm font-medium text-gray-900">
              Password requirements
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <RequirementRow
                met={passwordChecks.minLength}
                label="At least 8 characters"
              />
              <RequirementRow
                met={passwordChecks.uppercase}
                label="One uppercase letter"
              />
              <RequirementRow
                met={passwordChecks.lowercase}
                label="One lowercase letter"
              />
              <RequirementRow
                met={passwordChecks.number}
                label="One number"
              />
              <RequirementRow
                met={passwordChecks.special}
                label="One special character"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-gray-800"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100/70"
              placeholder="Repeat your new password"
            />
            {confirmPassword && !passwordsMatch ? (
              <p className="mt-2 text-sm text-red-600">Passwords do not match.</p>
            ) : null}
          </div>

          {success ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {success}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
            >
              Back to login
            </Link>

            <button
              type="submit"
              disabled={submitting || !hasResetContext}
              className="flex-1 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Resetting..." : "Reset password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(180deg,_#fff8f1_0%,_#f8fafc_40%,_#edf2f7_100%)] px-4 py-10">
      <div className="relative w-full max-w-lg animate-[fadeInUp_550ms_ease-out] rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
        <AuthBrandHeader
          title="Reset Password"
          subtitle="Preparing your secure reset form."
        />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
