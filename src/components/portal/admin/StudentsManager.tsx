"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUser } from "@/types/user";
import {
  getAllUsers,
  createAdminStudent,
  updateAdminStudent,
  addStudentClasses,
  deleteAdminStudent,
  sendPasswordReset,
} from "@/lib/api/admin";
import { fetchStudentById } from "@/lib/api/users";
import {
  useDebouncedSearch,
  useMutation,
  useResource,
} from "@/lib/hooks/use-management";
import { entityId } from "@/lib/utils/api-error";
import { getStudentFullName } from "@/lib/utils/group-display";
import EditStudentModal, { StudentEditPayload } from "../EditStudentModal";
import ManagedUserModal from "../ManagedUserModal";
import { UserFormValues } from "../UserFormFields";
import {
  cardClass,
  Feedback,
  inputClass,
  outlineButton,
  primaryButton,
  TableFrame,
  TeacherSelect,
} from "../ManagementUI";

export default function StudentsManager({
  teacherId,
  onChanged,
}: {
  teacherId?: string;
  onChanged?: () => void;
}) {
  const router = useRouter();
  const load = useCallback(async () => {
    const [students, teachers] = await Promise.all([
      getAllUsers("student", teacherId),
      getAllUsers("teacher"),
    ]);
    return { students, teachers };
  }, [teacherId]);
  const resource = useResource(load);
  const mutation = useMutation();
  const [selected, setSelected] = useState<AuthUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const query = useDebouncedSearch(search);
  const [filter, setFilter] = useState("");
  const teachers = resource.data?.teachers ?? [];
  const students = (resource.data?.students ?? []).filter(
    (s) =>
      (!filter || entityId(s.primaryTeacher) === filter) &&
      `${getStudentFullName(s)} ${s.email}`.toLowerCase().includes(query),
  );
  const reload = async () => {
    await resource.reload();
    onChanged?.();
  };
  const save = async (value: StudentEditPayload) => {
    if (!selected) return;
    const id = selected._id;
    const ok = await mutation.run(async () => {
      await updateAdminStudent(id, {
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        primaryTeacherId:
          value.primaryTeacherId ?? entityId(selected.primaryTeacher),
        rate: value.rate,
        currency: value.currency,
        classCycle: value.classCycle,
      });
      setSelected(null);
      await reload();
    }, "Student updated.");
    return ok;
  };
  const create = async (value: UserFormValues) => {
    await mutation.run(async () => {
      await createAdminStudent(value);
      setCreating(false);
      await reload();
    }, "Student created. A password setup email has been sent.");
  };
  const addClasses = async (count: number) => {
    if (!selected) return;
    const id = selected._id;
    await mutation.run(async () => {
      await addStudentClasses(id, count);
      const fresh = await fetchStudentById(id);
      setSelected(fresh);
      await reload();
    }, `${count} classes added.`);
  };
  return (
    <section className={cardClass}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Students</h2>
          <p className="mt-1 text-sm text-gray-700">
            Manage students, class balances and invoices.
          </p>
        </div>
        <button
          className={primaryButton}
          disabled={resource.loading || mutation.busy || !!resource.error}
          onClick={() => {
            mutation.clear();
            setCreating(true);
          }}
        >
          Add Student
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
      <div className="mb-5 grid items-end gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-gray-800">
          Search students
          <input
            className={`${inputClass} mt-1`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or email"
          />
        </label>
        {!teacherId && (
          <TeacherSelect
            teachers={teachers}
            value={filter}
            onChange={setFilter}
          />
        )}
      </div>
      <TableFrame
        headers={[
          "Student",
          "Email",
          "Primary Teacher",
          "Rate",
          "Currency",
          "Class Cycle",
          "Classes Left",
          "Attended",
          "Actions",
        ]}
        loading={resource.loading}
        empty={!students.length}
      >
        {students.map((student) => {
          const teacher =
            typeof student.primaryTeacher === "object"
              ? student.primaryTeacher
              : teachers.find((t) => t._id === student.primaryTeacher);
          const teacherName = teacher
            ? `${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`.trim() ||
              teacher.email
            : "Unassigned";
          return (
            <tr key={student._id}>
              <td className="whitespace-nowrap font-medium text-gray-900">
                {getStudentFullName(student)}
              </td>
              <td className="whitespace-nowrap">{student.email}</td>
              <td className="whitespace-nowrap">{teacherName}</td>
              <td>{student.class?.rate ?? 0}</td>
              <td>{student.class?.currency ?? "USD"}</td>
              <td>{student.class?.classCycle ?? 0}</td>
              <td>{student.class?.left ?? 0}</td>
              <td>{student.attended ?? 0}</td>
              <td>
                <div className="flex gap-2">
                  <button
                    className={primaryButton}
                    disabled={mutation.busy}
                    onClick={() => {
                      mutation.clear();
                      setSelected(student);
                    }}
                  >
                    Edit
                  </button>
                  <Link
                    className={`${outlineButton} whitespace-nowrap`}
                    href={`/portal/admin/students/${student._id}/invoices`}
                  >
                    View Invoices
                  </Link>
                </div>
              </td>
            </tr>
          );
        })}
      </TableFrame>
      {creating && (
        <ManagedUserModal
          role="student"
          teachers={teachers}
          busy={mutation.busy}
          error={mutation.error}
          onClose={() => setCreating(false)}
          onSave={(value) => void create(value)}
        />
      )}
      <EditStudentModal
        student={selected}
        open={!!selected}
        teachers={teachers}
        loading={mutation.busy}
        deleteLoading={mutation.busy}
        resetLoading={mutation.busy}
        error={mutation.error}
        resetSuccess={mutation.success}
        onClose={() => setSelected(null)}
        onSave={(value) => void save(value)}
        onAddClasses={(count) => void addClasses(count)}
        onViewInvoices={(s) =>
          router.push(`/portal/admin/students/${s._id}/invoices`)
        }
        onSendReset={(s) => {
          void mutation.run(
            () => sendPasswordReset(s._id),
            `Password reset email sent to ${s.email}.`,
          );
        }}
        onDelete={(s) => {
          void mutation.run(async () => {
            await deleteAdminStudent(s._id);
            setSelected(null);
            await reload();
          }, "Student deleted.");
        }}
      />
    </section>
  );
}
