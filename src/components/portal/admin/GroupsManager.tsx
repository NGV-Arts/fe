"use client";
import { useCallback, useState } from "react";
import { Group } from "@/types/group";
import {
  getAllUsers,
  getGroups,
  getGroup,
  addStudentsToGroup,
  removeStudentFromGroup,
} from "@/lib/api/admin";
import { createGroup, updateGroup, deleteGroup } from "@/lib/api/groups";
import {
  useDebouncedSearch,
  useMutation,
  useResource,
} from "@/lib/hooks/use-management";
import { entityId } from "@/lib/utils/api-error";
import {
  getGroupDisplayName,
  getStudentFullName,
} from "@/lib/utils/group-display";
import AddGroupModal from "../AddGroupModal";
import EditGroupModal from "../EditGroupModal";
import {
  cardClass,
  Feedback,
  inputClass,
  outlineButton,
  primaryButton,
  TableFrame,
  TeacherSelect,
} from "../ManagementUI";
export default function GroupsManager({
  teacherId,
  onChanged,
}: {
  teacherId?: string;
  onChanged?: () => void;
}) {
  const load = useCallback(async () => {
    const [groups, students, teachers] = await Promise.all([
      getGroups({ teacherId }),
      getAllUsers("student"),
      getAllUsers("teacher"),
    ]);
    return { groups, students, teachers };
  }, [teacherId]);
  const resource = useResource(load);
  const mutation = useMutation();
  const [selected, setSelected] = useState<Group | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const query = useDebouncedSearch(search);
  const [filter, setFilter] = useState("");
  const teachers = resource.data?.teachers ?? [];
  const groups = (resource.data?.groups ?? []).filter(
    (g) =>
      (!filter || entityId(g.teacher) === filter) &&
      `${getGroupDisplayName(g)} ${g.students.map((s) => `${getStudentFullName(s)} ${s.email}`).join(" ")}`
        .toLowerCase()
        .includes(query),
  );
  const reload = async () => {
    await resource.reload();
    onChanged?.();
  };
  const membership = async (
    action: (id: string) => Promise<unknown>,
    message: string,
  ) => {
    if (!selected) return false;
    const id = selected._id;
    return mutation.run(async () => {
      await action(id);
      setSelected(await getGroup(id));
      await reload();
    }, message);
  };
  return (
    <section className={cardClass}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Groups</h2>
          <p className="mt-1 text-sm text-gray-700">
            Manage teachers and members. Students can belong to multiple groups.
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
          Add Group
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
          Search groups
          <input
            className={`${inputClass} mt-1`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Group name, student name or email"
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
          "Group",
          "Primary Teacher",
          "Students",
          "Student Count",
          "Actions",
        ]}
        loading={resource.loading}
        empty={!groups.length}
      >
        {groups.map((g) => (
          <tr key={g._id}>
            <td className="font-medium text-gray-900">
              {getGroupDisplayName(g)}
            </td>
            <td>
              {typeof g.teacher === "object" && g.teacher
                ? getStudentFullName(g.teacher)
                : teachers.find((t) => t._id === g.teacher)
                  ? getStudentFullName(
                      teachers.find((t) => t._id === g.teacher),
                    )
                  : "Unassigned"}
            </td>
            <td>{g.students.map(getStudentFullName).join(", ") || "None"}</td>
            <td>{g.studentCount ?? g.students.length}</td>
            <td>
              <button
                className={primaryButton}
                disabled={mutation.busy}
                onClick={() => {
                  mutation.clear();
                  setSelected(g);
                }}
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </TableFrame>
      {creating && (
        <AddGroupModal
          open
          allStudents={resource.data?.students ?? []}
          teachers={teachers}
          loading={mutation.busy}
          error={mutation.error}
          onClose={() => setCreating(false)}
          onCreate={(value) => {
            void mutation.run(async () => {
              await createGroup({
                name: value.name,
                primaryTeacherId: value.primaryTeacherId,
                students: [...new Set(value.studentIds)],
              });
              setCreating(false);
              await reload();
            }, "Group created.");
          }}
        />
      )}
      <EditGroupModal
        group={selected}
        open={!!selected}
        allStudents={resource.data?.students ?? []}
        teachers={teachers}
        loading={mutation.busy}
        deleteLoading={mutation.busy}
        error={mutation.error}
        success={mutation.success}
        onClose={() => setSelected(null)}
        onSave={(value) => {
          if (!selected) return;
          const id = selected._id;
          void mutation.run(async () => {
            await updateGroup(id, {
              name: value.name,
              primaryTeacherId: value.primaryTeacherId,
            });
            setSelected(null);
            await reload();
          }, "Group updated.");
        }}
        onDelete={(g) => {
          void mutation.run(async () => {
            await deleteGroup(g._id);
            setSelected(null);
            await reload();
          }, "Group deleted. Student accounts retained.");
        }}
        onAddStudents={(ids) =>
          membership(
            (id) => addStudentsToGroup(id, ids),
            "Students added to group.",
          )
        }
        onRemoveStudent={(studentId) =>
          membership(
            (id) => removeStudentFromGroup(id, studentId),
            "Student removed from group.",
          )
        }
      />
    </section>
  );
}
