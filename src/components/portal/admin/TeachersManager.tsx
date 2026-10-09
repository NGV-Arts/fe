"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { AuthUser } from "@/types/user";
import {
  getAllUsers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  sendPasswordReset,
} from "@/lib/api/admin";
import { getStudentFullName } from "@/lib/utils/group-display";
import {
  useDebouncedSearch,
  useMutation,
  useResource,
} from "@/lib/hooks/use-management";
import ManagedUserModal from "../ManagedUserModal";
import ConfirmActionModal from "../ConfirmActionModal";
import { UserFormValues } from "../UserFormFields";
import {
  cardClass,
  Feedback,
  inputClass,
  outlineButton,
  primaryButton,
  redButton,
  TableFrame,
} from "../ManagementUI";
export default function TeachersManager() {
  const resource = useResource(useCallback(() => getAllUsers("teacher"), []));
  const mutation = useMutation();
  const [editing, setEditing] = useState<AuthUser | "new" | null>(null);
  const [confirm, setConfirm] = useState<"delete" | "reset" | null>(null);
  const [search, setSearch] = useState("");
  const query = useDebouncedSearch(search);
  const teachers = (resource.data ?? []).filter((t) =>
    `${getStudentFullName(t)} ${t.email}`.toLowerCase().includes(query),
  );
  const selected = editing && editing !== "new" ? editing : null;
  const save = async (value: UserFormValues) => {
    const payload = {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
    };
    await mutation.run(
      async () => {
        if (selected) await updateTeacher(selected._id, payload);
        else await createTeacher(payload);
        setEditing(null);
        await resource.reload();
      },
      selected
        ? "Teacher updated."
        : "Teacher created. A password setup email has been sent.",
    );
  };
  return (
    <section className={cardClass}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Teachers</h2>
        <button
          className={primaryButton}
          disabled={mutation.busy}
          onClick={() => {
            mutation.clear();
            setEditing("new");
          }}
        >
          Add Teacher
        </button>
      </div>
      <Feedback
        error={resource.error || mutation.error}
        success={mutation.success}
      />
      {resource.error && (
        <button
          className={outlineButton}
          onClick={() => void resource.reload()}
        >
          Retry
        </button>
      )}
      <label className="mb-5 block max-w-lg text-sm font-medium text-gray-800">
        Search teachers
        <input
          className={`${inputClass} mt-1`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or email"
        />
      </label>
      <TableFrame
        headers={[
          "Teacher",
          "Email",
          "Student Count",
          "Group Count",
          "Actions",
        ]}
        loading={resource.loading}
        empty={!teachers.length}
      >
        {teachers.map((t) => (
          <tr key={t._id}>
            <td className="whitespace-nowrap font-medium text-gray-900">
              {getStudentFullName(t)}
            </td>
            <td className="whitespace-nowrap">{t.email}</td>
            <td>{t.studentCount ?? 0}</td>
            <td>{t.groupCount ?? 0}</td>
            <td>
              <div className="flex gap-2">
                <button
                  className={primaryButton}
                  disabled={mutation.busy}
                  onClick={() => {
                    mutation.clear();
                    setEditing(t);
                  }}
                >
                  Edit
                </button>
                <Link
                  className={outlineButton}
                  href={`/portal/admin/teachers/${t._id}`}
                >
                  View Students / Groups
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </TableFrame>
      {editing && (
        <ManagedUserModal
          key={selected?._id ?? "new"}
          role="teacher"
          user={selected ?? undefined}
          busy={mutation.busy}
          error={mutation.error}
          success={mutation.success}
          onClose={() => setEditing(null)}
          onSave={(value) => void save(value)}
        >
          {selected && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className={outlineButton}
                disabled={mutation.busy}
                onClick={() => setConfirm("reset")}
              >
                Send Password Reset
              </button>
              <Link
                className={primaryButton}
                href={`/portal/admin/teachers/${selected._id}`}
              >
                View Students
              </Link>
              <Link
                className={primaryButton}
                href={`/portal/admin/teachers/${selected._id}?tab=groups`}
              >
                View Groups
              </Link>
              <button
                className={redButton}
                disabled={mutation.busy}
                onClick={() => setConfirm("delete")}
              >
                Delete Teacher
              </button>
            </div>
          )}
        </ManagedUserModal>
      )}
      <ConfirmActionModal
        open={!!confirm && !!selected}
        title={
          confirm === "delete"
            ? `Delete ${selected ? getStudentFullName(selected) : "teacher"}?`
            : "Send password reset email?"
        }
        description={
          confirm === "delete"
            ? "All students and groups must be reassigned before this teacher can be deleted."
            : `A password reset email will be sent to ${selected?.email ?? "the teacher"}.`
        }
        confirmLabel={
          confirm === "delete" ? "Delete Teacher" : "Send Password Reset"
        }
        confirmClassName={
          confirm === "delete" ? undefined : "bg-black hover:opacity-90"
        }
        loading={mutation.busy}
        error={mutation.error}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (!selected) return;
          const teacher = selected;
          const deleting = confirm === "delete";
          void mutation.run(
            async () => {
              if (deleting) {
                await deleteTeacher(teacher._id);
                setEditing(null);
                await resource.reload();
              } else await sendPasswordReset(teacher._id);
              setConfirm(null);
            },
            deleting ? "Teacher deleted." : "Password reset email sent.",
          );
        }}
      />
    </section>
  );
}
