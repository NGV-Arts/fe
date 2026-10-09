"use client";
import { useState, type ReactNode } from "react";
import { AuthUser } from "@/types/user";
import UserFormFields, {
  userFormValues,
  UserFormValues,
} from "./UserFormFields";
import { Feedback, ModalFrame, primaryButton } from "./ManagementUI";

export default function ManagedUserModal({
  role,
  user,
  teachers,
  busy,
  error,
  success,
  onClose,
  onSave,
  children,
}: {
  role: "student" | "teacher";
  user?: AuthUser;
  teachers?: AuthUser[];
  busy: boolean;
  error?: string | null;
  success?: string | null;
  onClose: () => void;
  onSave: (value: UserFormValues) => void;
  children?: ReactNode;
}) {
  const [value, setValue] = useState(() => userFormValues(user));
  return (
    <ModalFrame
      title={`${user ? "Edit" : "Add"} ${role}`}
      onClose={onClose}
      busy={busy}
    >
      <Feedback error={error} success={success} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy)
            onSave({
              ...value,
              firstName: value.firstName.trim(),
              lastName: value.lastName.trim(),
              email: value.email.trim(),
            });
        }}
      >
        <fieldset disabled={busy} className="space-y-5">
          <UserFormFields
            value={value}
            onChange={setValue}
            student={role === "student"}
            teachers={teachers}
          />
          {!user && (
            <p className="text-sm text-gray-700">
              The {role} will receive an email to set their password.
            </p>
          )}
          {user && (
            <p className="text-sm text-gray-700">
              Assigned students: {user.studentCount ?? 0} · Groups:{" "}
              {user.groupCount ?? 0}
            </p>
          )}
          <button
            className={primaryButton}
            disabled={
              busy ||
              !value.firstName.trim() ||
              (role === "student" && !value.primaryTeacherId)
            }
          >
            {busy ? "Saving…" : user ? "Save changes" : `Add ${role}`}
          </button>
        </fieldset>
      </form>
      {children}
    </ModalFrame>
  );
}
