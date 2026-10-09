"use client";

import { useMemo, useState } from "react";

import { AuthUser } from "@/types/user";

type Props = {
  open: boolean;
  availableStudents: AuthUser[];
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (selectedStudentIds: string[]) => void;
};

function getStudentName(student: AuthUser) {
  const first = student.firstName ?? "";
  const last = student.lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || student.email;
}

export default function AddStudentToGroupModal({
  open,
  availableStudents,
  loading = false,
  error,
  onClose,
  onConfirm,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableStudents;

    return availableStudents.filter((student) => {
      const fullName = `${student.firstName ?? ""} ${student.lastName ?? ""}`
        .trim()
        .toLowerCase();
      const email = (student.email ?? "").toLowerCase();
      return fullName.includes(q) || email.includes(q);
    });
  }, [availableStudents, search]);

  if (!open) return null;

  const toggleStudent = (studentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleClose = () => {
    setSearch("");
    setSelectedIds([]);
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add students to group"
        className="max-h-[90vh] overflow-y-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Add students to group
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Search and select students who are not yet in this group.
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleClose}
            className="rounded-md border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Close
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-4 text-sm text-red-800">
            {error}
          </p>
        )}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-600 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
          {filteredStudents.length === 0 ? (
            <div className="text-sm text-gray-600">No students found.</div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => {
                const checked = selectedIds.includes(student._id);

                return (
                  <label
                    key={student._id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStudent(student._id)}
                    />
                    <span className="font-medium text-gray-900">
                      {getStudentName(student)}
                    </span>
                    <span className="text-gray-700">({student.email})</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleClose}
            className="flex-1 rounded-md border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading || selectedIds.length === 0}
            onClick={handleConfirm}
            className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add selected students"}
          </button>
        </div>
      </div>
    </div>
  );
}
