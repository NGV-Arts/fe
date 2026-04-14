"use client";

import { useEffect, useMemo, useState } from "react";

import { Group } from "@/types/group";
import { AuthUser } from "@/types/user";
import AddStudentToGroupModal from "./AddStudentToGroupModal";
import ConfirmActionModal from "./ConfirmActionModal";

type Props = {
  group: Group | null;
  allStudents: AuthUser[];
  open: boolean;
  loading?: boolean;
  deleteLoading?: boolean;
  onClose: () => void;
  onSave: (payload: { name: string; studentIds: string[] }) => void;
  onDelete: (group: Group) => void;
};

function getStudentName(student: AuthUser) {
  const first = student.firstName ?? "";
  const last = student.lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || student.email;
}

export default function EditGroupModal({
  group,
  allStudents,
  open,
  loading = false,
  deleteLoading = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!group || !open) return;
    setName(group.name ?? "");
    setSelectedIds((group.students ?? []).map((student) => student._id));
  }, [group, open]);

  const currentGroupStudents = useMemo(() => {
    return allStudents.filter((student) => selectedIds.includes(student._id));
  }, [allStudents, selectedIds]);

  const availableStudents = useMemo(() => {
    return allStudents.filter((student) => !selectedIds.includes(student._id));
  }, [allStudents, selectedIds]);

  const sortedCurrentGroupStudents = useMemo(() => {
    return [...currentGroupStudents].sort((a, b) => {
      const aName = getStudentName(a).toLowerCase();
      const bName = getStudentName(b).toLowerCase();
      return aName.localeCompare(bName);
    });
  }, [currentGroupStudents]);

  if (!open || !group) return null;

  const toggleStudent = (studentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleClose = () => {
    setAddStudentOpen(false);
    setConfirmDeleteOpen(false);
    onClose();
  };

  const handleAddStudents = (studentIds: string[]) => {
    setSelectedIds((prev) => Array.from(new Set([...prev, ...studentIds])));
    setAddStudentOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Edit group
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Update the group name and membership.
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
                Group name
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Students in this group
              </label>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-600">
                  Uncheck students here to remove them from the group.
                </p>
                <button
                  type="button"
                  onClick={() => setAddStudentOpen(true)}
                  className="rounded-md border border-black bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
                >
                  Add student
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3">
                {sortedCurrentGroupStudents.length === 0 ? (
                  <div className="text-sm text-gray-600">
                    No students are currently in this group.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedCurrentGroupStudents.map((student) => (
                      <label
                        key={student._id}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(student._id)}
                          onChange={() => toggleStudent(student._id)}
                        />
                        <span className="font-medium text-gray-900">
                          {getStudentName(student)}
                        </span>
                        <span className="text-gray-500">
                          ({student.email})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={loading || deleteLoading}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:mr-auto"
            >
              {deleteLoading ? "Deleting..." : "Delete group"}
            </button>

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
              onClick={() => onSave({ name, studentIds: selectedIds })}
              className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      <AddStudentToGroupModal
        open={addStudentOpen}
        availableStudents={availableStudents}
        onClose={() => setAddStudentOpen(false)}
        onConfirm={handleAddStudents}
      />

      <ConfirmActionModal
        open={confirmDeleteOpen}
        title="Delete group?"
        description="This will permanently delete the group. This action cannot be undone."
        confirmLabel="Delete group"
        loading={deleteLoading}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => onDelete(group)}
      />
    </>
  );
}
