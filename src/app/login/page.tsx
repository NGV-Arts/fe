"use client";

import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Login</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to access your portal.
          </p>
        </div>

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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none ring-0 transition focus:border-gray-900"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none ring-0 transition focus:border-gray-900"
              placeholder="Enter your password"
            />
          </div>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
