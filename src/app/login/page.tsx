"use client";

import axios from "axios";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AuthBrandHeader from "@/components/auth/AuthBrandHeader";
import { loginRequest } from "@/lib/api/auth";
import {
  getPortalRouteForRole,
  getUser,
  isAuthenticated,
  setSession,
} from "@/lib/auth/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      if (user) {
        router.replace(getPortalRouteForRole(user.role));
      }
    }
  }, [router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = await loginRequest(email, password);
      setSession(data.accessToken, data.user);
      router.replace(getPortalRouteForRole(data.user.role));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseMessage = (error.response?.data as
          | { message?: string | string[] }
          | undefined)?.message;

        const message = Array.isArray(responseMessage)
          ? responseMessage[0]
          : responseMessage;

        setError(message || "Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_32%),linear-gradient(180deg,_#fff8f3_0%,_#f8fafc_42%,_#eef2f7_100%)] px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-red-100/40 via-orange-100/20 to-transparent" />
      <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-red-200/20 blur-3xl" />
      <div className="absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />

      <div className="relative w-full max-w-md animate-[fadeInUp_500ms_ease-out] rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
        <AuthBrandHeader
          title="Login"
          subtitle="Sign in to access your NGV Arts portal."
        />

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white/90 px-3 py-2.5 text-gray-900 outline-none ring-0 transition focus:border-red-300 focus:ring-4 focus:ring-red-100/70"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white/90 px-3 py-2.5 text-gray-900 outline-none ring-0 transition focus:border-red-300 focus:ring-4 focus:ring-red-100/70"
              placeholder="Enter your password"
            />
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-red-700 transition hover:text-red-800"
            >
              Forgot password?
            </Link>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
