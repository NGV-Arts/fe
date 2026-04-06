"use client";

import axios from "axios";
import { FormEvent, useEffect, useState } from "react";

import PortalGuard from "@/components/auth/PortalGuard";
import PortalShell from "@/components/portal/PortalShell";
import { updateMyProfile } from "@/lib/api/users";
import { getUser, updateStoredUser } from "@/lib/auth/session";
import { AuthUser } from "@/types/user";

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = (error.response?.data as
      | { message?: string | string[] }
      | undefined)?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage[0] || "Failed to update profile";
    }

    return responseMessage || "Failed to update profile";
  }

  return "Failed to update profile";
}

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
    setFirstName(storedUser?.firstName ?? "");
    setLastName(storedUser?.lastName ?? "");
    setEmail(storedUser?.email ?? "");
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await updateMyProfile({
        firstName,
        lastName,
        email,
      });
      updateStoredUser(updatedUser);
      setUser(updatedUser);
      setSuccess("Profile updated successfully.");
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalGuard allowedRoles={["admin", "teacher", "student"]}>
      <PortalShell title="Update Profile">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Your profile
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your account details.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition focus:border-gray-900"
                  placeholder="First name"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition focus:border-gray-900"
                  placeholder="Last name"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <input
                  id="role"
                  value={user?.role ?? ""}
                  disabled
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
                />
              </div>

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
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition focus:border-gray-900"
                  placeholder="you@example.com"
                />
              </div>

              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save changes"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Account summary
            </h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div>
                <span className="font-medium text-gray-900">
                  Classes left:
                </span>{" "}
                {user?.class?.left ?? 0}
              </div>
              <div>
                <span className="font-medium text-gray-900">Paid for:</span>{" "}
                {user?.class?.paidFor ?? 0}
              </div>
              <div>
                <span className="font-medium text-gray-900">Rate:</span>{" "}
                {(user?.class?.currency ?? "USD")} {user?.class?.rate ?? 0}
              </div>
              <div>
                <span className="font-medium text-gray-900">Attended:</span>{" "}
                {user?.attended ?? 0}
              </div>
            </div>
          </div>
        </div>
      </PortalShell>
    </PortalGuard>
  );
}
