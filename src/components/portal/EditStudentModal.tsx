"use client";

import { useEffect, useState } from "react";

import { AuthUser } from "@/types/user";
import ConfirmActionModal from "./ConfirmActionModal";

type Props = {
  student: AuthUser | null;
  open: boolean;
  loading?: boolean;
  resetLoading?: boolean;
  resetSuccess?: string | null;
  resetError?: string | null;
  deleteLoading?: boolean;
  onClose: () => void;
  onSave: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    rate: number;
    currency: string;
    classCycle: number;
    classesToAdd: number;
  }) => void;
  onSendReset: (student: AuthUser) => void;
  onDelete: (student: AuthUser) => void;
};

export default function EditStudentModal({
  student,
  open,
  loading = false,
  resetLoading = false,
  resetSuccess = null,
  resetError = null,
  deleteLoading = false,
  onClose,
  onSave,
  onSendReset,
  onDelete,
}: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [rate, setRate] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [classCycle, setClassCycle] = useState<number>(0);
  const [classesToAdd, setClassesToAdd] = useState<number>(0);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!student) return;

    setFirstName(student.firstName ?? "");
    setLastName(student.lastName ?? "");
    setEmail(student.email ?? "");
    setRate(student.class?.rate ?? 0);
    setCurrency(student.class?.currency ?? "USD");
    setClassCycle(student.class?.classCycle ?? 0);
    setClassesToAdd(student.class?.classCycle ?? 0);
  }, [student]);

  if (!open || !student) return null;

  const handleClose = () => {
    setConfirmDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Edit student
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Update student details and billing settings.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Close
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Rate
              </label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
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
                onChange={(e) => setCurrency(e.target.value)}
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
                onChange={(e) => setClassCycle(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Classes to add
              </label>
              <input
                type="number"
                value={classesToAdd}
                onChange={(e) => setClassesToAdd(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
              />
              <p className="mt-1 text-xs text-gray-600">
                Default is the current class cycle size. This will be added to
                classes left.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Password reset
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Send a password reset email to this student.
                </p>
              </div>

              <button
                type="button"
                disabled={resetLoading}
                onClick={() => onSendReset(student)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              >
                {resetLoading ? "Sending..." : "Send password reset email"}
              </button>
            </div>

            {resetSuccess ? (
              <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {resetSuccess}
              </div>
            ) : null}

            {resetError ? (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {resetError}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={loading || deleteLoading}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              {deleteLoading ? "Deleting..." : "Delete student"}
            </button>

            <div className="flex flex-1 gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  onSave({
                    firstName,
                    lastName,
                    email,
                    rate,
                    currency,
                    classCycle,
                    classesToAdd,
                  })
                }
                className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        open={confirmDeleteOpen}
        title="Are you sure?"
        description="This will permanently remove the student from the system."
        confirmLabel="Delete student"
        loading={deleteLoading}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => onDelete(student)}
      />
    </>
  );
}
