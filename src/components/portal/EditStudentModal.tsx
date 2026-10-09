"use client";
import { useState } from "react";
import { AuthUser } from "@/types/user";
import ConfirmActionModal from "./ConfirmActionModal";
import UserFormFields, { userFormValues } from "./UserFormFields";
import {
  Feedback,
  Field,
  inputClass,
  ModalFrame,
  outlineButton,
  primaryButton,
  redButton,
} from "./ManagementUI";

export type StudentEditPayload = {
  firstName: string;
  lastName: string;
  email: string;
  rate: number;
  currency: string;
  classCycle: number;
  classesToAdd: number;
  primaryTeacherId?: string;
};
type Props = {
  student: AuthUser | null;
  open: boolean;
  loading?: boolean;
  resetLoading?: boolean;
  resetSuccess?: string | null;
  resetError?: string | null;
  deleteLoading?: boolean;
  error?: string | null;
  teachers?: AuthUser[];
  onAddClasses?: (count: number) => void;
  onClose: () => void;
  onSave: (payload: StudentEditPayload) => void;
  onSendReset: (student: AuthUser) => void;
  onDelete: (student: AuthUser) => void;
  onViewInvoices: (student: AuthUser) => void;
};
export default function EditStudentModal(props: Props) {
  return props.open && props.student ? (
    <StudentDialog key={props.student._id} {...props} student={props.student} />
  ) : null;
}
function StudentDialog({
  student,
  loading,
  resetLoading,
  resetSuccess,
  resetError,
  deleteLoading,
  error,
  teachers,
  onAddClasses,
  onClose,
  onSave,
  onSendReset,
  onDelete,
  onViewInvoices,
}: Props & { student: AuthUser }) {
  const [value, setValue] = useState(() => userFormValues(student));
  const [classesToAdd, setClassesToAdd] = useState(
    student.class?.classCycle ?? 0,
  );
  const [confirm, setConfirm] = useState<"delete" | "reset" | null>(null);
  const busy = !!(loading || resetLoading || deleteLoading);
  const name =
    `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() ||
    student.email;
  return (
    <>
      <ModalFrame title="Edit student" busy={busy} onClose={onClose}>
        <Feedback error={error || resetError} success={resetSuccess} />
        <div className="mb-5 grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
          <p>
            Current Classes Left{" "}
            <strong className="block text-xl text-gray-900">
              {student.class?.left ?? 0}
            </strong>
          </p>
          <p>
            Lifetime Attended{" "}
            <strong className="block text-xl text-gray-900">
              {student.attended ?? 0}
            </strong>
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy)
              onSave({
                ...value,
                firstName: value.firstName.trim(),
                email: value.email.trim(),
                classesToAdd: onAddClasses ? 0 : classesToAdd,
              });
          }}
        >
          <fieldset disabled={busy} className="space-y-5">
            <UserFormFields
              value={value}
              onChange={setValue}
              student
              teachers={teachers}
            />
            {!onAddClasses && (
              <Field label="Classes to Add">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={classesToAdd}
                  onChange={(e) => setClassesToAdd(Number(e.target.value))}
                  className={inputClass}
                />
                <span className="mt-1 block text-xs text-gray-700">
                  Added to the current balance when you save.
                </span>
              </Field>
            )}
            <button
              className={primaryButton}
              disabled={
                busy ||
                !value.firstName.trim() ||
                (!!teachers && !value.primaryTeacherId)
              }
            >
              {busy ? "Working…" : "Save changes"}
            </button>
          </fieldset>
        </form>
        {onAddClasses && (
          <form
            className="mt-6 rounded-xl border border-gray-200 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy && Number.isInteger(classesToAdd) && classesToAdd > 0)
                onAddClasses(classesToAdd);
            }}
          >
            <Field label="Classes to Add">
              <input
                required
                type="number"
                min="1"
                step="1"
                disabled={busy}
                value={classesToAdd}
                onChange={(e) => setClassesToAdd(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <p className="my-3 text-sm text-gray-700">
              Adds to the existing balance. Saving student details does not
              change classes left.
            </p>
            <button
              className={primaryButton}
              disabled={busy || classesToAdd < 1}
            >
              Add Classes
            </button>
          </form>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            className={outlineButton}
            onClick={() => setConfirm("reset")}
          >
            Send Password Reset Email
          </button>
          <button
            type="button"
            disabled={busy}
            className={primaryButton}
            onClick={() => onViewInvoices(student)}
          >
            View Invoices
          </button>
          <button
            type="button"
            disabled={busy}
            className={redButton}
            onClick={() => setConfirm("delete")}
          >
            Delete Student
          </button>
        </div>
      </ModalFrame>
      <ConfirmActionModal
        open={!!confirm}
        title={
          confirm === "delete"
            ? `Are you sure you want to delete ${name}?`
            : "Send password reset email?"
        }
        description={
          confirm === "delete"
            ? "The student may be removed from groups. Historical lessons and invoices are retained according to backend rules."
            : `A password reset email will be sent to ${student.email}.`
        }
        confirmLabel={
          confirm === "delete" ? "Delete Student" : "Send Password Reset"
        }
        confirmClassName={
          confirm === "delete" ? undefined : "bg-black hover:opacity-90"
        }
        loading={busy}
        error={error || resetError}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm === "delete") onDelete(student);
          else {
            setConfirm(null);
            onSendReset(student);
          }
        }}
      />
    </>
  );
}
