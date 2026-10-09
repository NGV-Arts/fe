"use client";
import { AuthUser } from "@/types/user";
import { ManagedStudentInput } from "@/lib/api/admin";
import { Field, inputClass, TeacherSelect } from "./ManagementUI";

export type UserFormValues = ManagedStudentInput;
export function userFormValues(user?: AuthUser | null): UserFormValues {
  return {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    primaryTeacherId:
      typeof user?.primaryTeacher === "string"
        ? user.primaryTeacher
        : (user?.primaryTeacher?._id ?? ""),
    rate: user?.class?.rate ?? 0,
    currency: user?.class?.currency ?? "USD",
    classCycle: user?.class?.classCycle ?? 0,
  };
}
export default function UserFormFields({
  value,
  onChange,
  student = false,
  teachers,
}: {
  value: UserFormValues;
  onChange: (value: UserFormValues) => void;
  student?: boolean;
  teachers?: AuthUser[];
}) {
  const text = (
    key: "firstName" | "lastName" | "email" | "currency",
    label: string,
    type = "text",
  ) => (
    <Field label={label}>
      <input
        className={inputClass}
        type={type}
        required={key !== "lastName"}
        value={value[key]}
        maxLength={key === "currency" ? 3 : undefined}
        pattern={key === "currency" ? "[A-Za-z]{3}" : undefined}
        onChange={(e) =>
          onChange({
            ...value,
            [key]:
              key === "currency"
                ? e.target.value.toUpperCase()
                : e.target.value,
          })
        }
      />
    </Field>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {text("firstName", "First Name")}
      {text("lastName", "Last Name")}
      <div className="sm:col-span-2">{text("email", "Email", "email")}</div>
      {student && (
        <>
          {teachers && (
            <div className="sm:col-span-2">
              <TeacherSelect
                required
                teachers={teachers}
                value={value.primaryTeacherId}
                onChange={(primaryTeacherId) =>
                  onChange({ ...value, primaryTeacherId })
                }
              />
            </div>
          )}
          <Field label="Rate">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              required
              value={value.rate}
              onChange={(e) =>
                onChange({ ...value, rate: Number(e.target.value) })
              }
            />
          </Field>
          {text("currency", "Currency")}
          <Field label="Class Cycle">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="1"
              required
              value={value.classCycle}
              onChange={(e) =>
                onChange({ ...value, classCycle: Number(e.target.value) })
              }
            />
          </Field>
        </>
      )}
    </div>
  );
}
