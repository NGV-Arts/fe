"use client";

import Link from "next/link";
import axios from "axios";
import { FormEvent, useState } from "react";

import AuthBrandHeader from "@/components/auth/AuthBrandHeader";
import { triggerForgotPasswordEmail } from "@/lib/api/auth";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    const rawMessage = data?.message;

    if (Array.isArray(rawMessage)) {
      return rawMessage.join(", ") || fallback;
    }

    return rawMessage || fallback;
  }

  return fallback;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      await triggerForgotPasswordEmail({ email });
      setSuccess("If that email exists, a password reset link has been sent.");
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to send reset email"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2),_transparent_30%),linear-gradient(180deg,_#fff7ed_0%,_#fafaf9_38%,_#f1f5f9_100%)] px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-red-100/45 via-orange-100/15 to-transparent" />
      <div className="absolute left-0 top-24 h-72 w-72 -translate-x-1/3 rounded-full bg-red-200/20 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 translate-x-1/4 rounded-full bg-amber-200/25 blur-3xl" />

      <div className="relative w-full max-w-md animate-[fadeInUp_550ms_ease-out] rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
        <AuthBrandHeader
          title="Forgot Password"
          subtitle="Enter your email address and we’ll send you a link to reset your password."
        />

        <form onSubmit={onSubmit} className="space-y-4">
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
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100/70"
              placeholder="you@example.com"
            />
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
              disabled={submitting}
              className="flex-1 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending link..." : "Send reset link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
