"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import PortalGuard from "@/components/auth/PortalGuard";
import PortalShell from "@/components/portal/PortalShell";
import { createStudent } from "@/lib/api/users";
import { getUser } from "@/lib/auth/session";
import { AuthUser } from "@/types/user";

export default function AddStudentPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [rate, setRate] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [classCycle, setClassCycle] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createStudent({
        firstName,
        lastName,
        email,
        role: "student",
        class: {
          rate,
          currency,
          classCycle,
          left: classCycle,
        },
      });

      router.push("/portal/students");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as
          { message?: string | string[] } | undefined;
        const rawMessage = data?.message;
        const message = Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : rawMessage || "Failed to create student";

        setError(message);
      } else {
        setError("Failed to create student");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <PortalGuard allowedRoles={["teacher"]}>
      <PortalShell title="Add Student">
        <div className="mx-auto max-w-3xl space-y-6">
          {isAdmin ? (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
              Teacher assignment selection is not yet implemented in the
              frontend. The backend may require additional teacher assignment
              handling for admin-created students.
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  New student
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Create a new student account. A password-generation email will
                  be sent automatically.
                </p>
              </div>

              <Link
                href="/portal/students"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Back
              </Link>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-800">
                    First name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-800">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="Last name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-800">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Billing defaults
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Classes left will automatically be set to the same value as
                  class cycle.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">
                      Rate
                    </label>
                    <input
                      type="number"
                      value={rate}
                      onChange={(event) => setRate(Number(event.target.value))}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">
                      Class cycle
                    </label>
                    <input
                      type="number"
                      value={classCycle}
                      onChange={(event) =>
                        setClassCycle(Number(event.target.value))
                      }
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="flex gap-3">
                <Link
                  href="/portal/students"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </PortalShell>
    </PortalGuard>
  );
}
