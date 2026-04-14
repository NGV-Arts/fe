"use client";

import axios from "axios";
import { FormEvent, useEffect, useMemo, useState } from "react";

import PortalGuard from "@/components/auth/PortalGuard";
import PortalShell from "@/components/portal/PortalShell";
import { updatePassword } from "@/lib/api/auth";
import { updateMyProfile } from "@/lib/api/users";
import { getUser, updateStoredUser } from "@/lib/auth/session";
import { getPasswordChecks, isPasswordValid } from "@/lib/utils/password";
import { AuthUser } from "@/types/user";

type ProfileTab = "profile" | "password";

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

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");

  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [debouncedRepeatPassword, setDebouncedRepeatPassword] = useState("");
  const [showPasswordMatchError, setShowPasswordMatchError] = useState(false);

  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
    setFirstName(storedUser?.firstName ?? "");
    setLastName(storedUser?.lastName ?? "");
    setEmail(storedUser?.email ?? "");
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedRepeatPassword(repeatNewPassword);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [repeatNewPassword]);

  useEffect(() => {
    if (!repeatNewPassword) {
      setShowPasswordMatchError(false);
      return;
    }

    setShowPasswordMatchError(debouncedRepeatPassword !== newPassword);
  }, [debouncedRepeatPassword, newPassword, repeatNewPassword]);

  const passwordChecks = useMemo(
    () => getPasswordChecks(newPassword),
    [newPassword],
  );
  const passwordIsValid = useMemo(
    () => isPasswordValid(newPassword),
    [newPassword],
  );
  const passwordsMatch =
    repeatNewPassword.length > 0 && repeatNewPassword === newPassword;
  const showAccountSummary = user?.role === "student";

  const onSubmitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileSubmitting(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const updatedUser = await updateMyProfile({
        firstName,
        lastName,
        email,
      });

      updateStoredUser(updatedUser);
      setUser(updatedUser);
      setProfileSuccess("Profile updated successfully.");
    } catch (error) {
      setProfileError(getApiErrorMessage(error, "Failed to update profile"));
    } finally {
      setProfileSubmitting(false);
    }
  };

  const onSubmitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordSubmitting(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!passwordIsValid) {
      setPasswordError("New password does not meet the required rules.");
      setPasswordSubmitting(false);
      return;
    }

    if (!passwordsMatch) {
      setPasswordError("Passwords do not match");
      setPasswordSubmitting(false);
      return;
    }

    try {
      await updatePassword({
        oldPassword,
        newPassword,
      });

      setPasswordSuccess("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setRepeatNewPassword("");
      setDebouncedRepeatPassword("");
      setShowPasswordMatchError(false);
    } catch (error) {
      setPasswordError(
        getApiErrorMessage(error, "Failed to update password", true),
      );
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <PortalGuard allowedRoles={["admin", "teacher", "student"]}>
      <PortalShell title="Update Profile">
        <div
          className={`grid gap-6 ${
            showAccountSummary
              ? "lg:grid-cols-[minmax(0,1fr)_320px]"
              : "lg:grid-cols-1"
          }`}
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Account settings
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage your profile details and password.
              </p>
            </div>

            <div className="mb-6 flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("profile");
                  setProfileError(null);
                  setProfileSuccess(null);
                }}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "profile"
                    ? "border-b-2 border-black text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Edit profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("password");
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "password"
                    ? "border-b-2 border-black text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Change password
              </button>
            </div>

            {activeTab === "profile" ? (
              <form onSubmit={onSubmitProfile} className="space-y-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1 block text-sm font-medium text-gray-800"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1 block text-sm font-medium text-gray-800"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="Last name"
                  />
                </div>

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
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="you@example.com"
                  />
                </div>

                {profileError ? (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {profileError}
                  </div>
                ) : null}

                {profileSuccess ? (
                  <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    {profileSuccess}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {profileSubmitting ? "Saving..." : "Save changes"}
                </button>
              </form>
            ) : (
              <form onSubmit={onSubmitPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="oldPassword"
                    className="mb-1 block text-sm font-medium text-gray-800"
                  >
                    Old password
                  </label>
                  <input
                    id="oldPassword"
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(event) => setOldPassword(event.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="Enter your old password"
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
                    required
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                    placeholder="Enter your new password"
                  />

                  {newPassword ? (
                    <div className="mt-3 space-y-1">
                      <RequirementRow
                        met={passwordChecks.minLength}
                        label="Minimum 8 characters"
                      />
                      <RequirementRow
                        met={passwordChecks.uppercase}
                        label="At least 1 uppercase letter"
                      />
                      <RequirementRow
                        met={passwordChecks.lowercase}
                        label="At least 1 lowercase letter"
                      />
                      <RequirementRow
                        met={passwordChecks.number}
                        label="At least 1 number"
                      />
                      <RequirementRow
                        met={passwordChecks.special}
                        label="At least 1 special character"
                      />
                    </div>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="repeatNewPassword"
                    className="mb-1 block text-sm font-medium text-gray-800"
                  >
                    Repeat new password
                  </label>
                  <input
                    id="repeatNewPassword"
                    type="password"
                    required
                    value={repeatNewPassword}
                    onChange={(event) =>
                      setRepeatNewPassword(event.target.value)
                    }
                    className={`w-full rounded-md border bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10 ${
                      showPasswordMatchError
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Repeat your new password"
                  />

                  {showPasswordMatchError ? (
                    <p className="mt-2 text-sm text-red-600">
                      Passwords do not match
                    </p>
                  ) : null}
                </div>

                {passwordError ? (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {passwordError}
                  </div>
                ) : null}

                {passwordSuccess ? (
                  <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    {passwordSuccess}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={
                    passwordSubmitting || !passwordIsValid || !passwordsMatch
                  }
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {passwordSubmitting ? "Updating..." : "Update password"}
                </button>
              </form>
            )}
          </div>

          {showAccountSummary ? (
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
                  <span className="font-medium text-gray-900">
                    Class cycle:
                  </span>{" "}
                  {user?.class?.classCycle ?? 0}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Rate:</span>{" "}
                  {(user?.class?.currency ?? "USD")} {user?.class?.rate ?? 0}
                </div>
                <div>
                  <span className="font-medium text-gray-900">
                    Attended:
                  </span>{" "}
                  {user?.attended ?? 0}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </PortalShell>
    </PortalGuard>
  );
}
