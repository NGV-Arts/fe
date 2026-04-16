"use client";

import { useEffect, useMemo, useState } from "react";

import { AuthUser } from "@/types/user";

type Props = {
  open: boolean;
  allStudents: AuthUser[];
  loading?: boolean;
  onClose: () => void;
  onCreate: (payload: { name?: string; studentIds: string[] }) => void;
};

function getStudentFullName(student: AuthUser) {
  const first = student.firstName ?? "";
  const last = student.lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || student.email;
}

export default function AddGroupModal({
  open,
  allStudents,
  loading = false,
  onClose,
  onCreate,
}: Props) {
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      setName("");
      setSearch("");
      setSelectedIds([]);
    }
  }, [open]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sortedStudents = [...allStudents].sort((a, b) =>
      getStudentFullName(a).localeCompare(getStudentFullName(b)),
    );

    if (!q) return sortedStudents;

    return sortedStudents.filter((student) => {
      const fullName = `${student.firstName ?? ""} ${
        student.lastName ?? ""
      }`
        .trim()
        .toLowerCase();
      const email = (student.email ?? "").toLowerCase();
      return fullName.includes(q) || email.includes(q);
    });
  }, [allStudents, search]);

  if (!open) return null;

  const toggleStudent = (studentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleClose = () => {
    setName("");
    setSearch("");
    setSelectedIds([]);
    onClose();
  };

  const handleCreate = () => {
    onCreate({
      name: name.trim() || undefined,
      studentIds: selectedIds,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add group</h2>
            <p className="mt-1 text-sm text-gray-600">
              Select any students to include in this group. Students may still
              appear here even if they are in another group.
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

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Group name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Optional group name"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
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
                        {getStudentFullName(student)}
                      </span>
                      <span className="text-gray-500">({student.email})</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading || selectedIds.length === 0}
            onClick={handleCreate}
            className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create group"}
          </button>
        </div>
      </div>
    </div>
  );
}
