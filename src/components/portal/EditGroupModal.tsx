"use client";
import { useState } from "react";
import { Group } from "@/types/group";
import { AuthUser } from "@/types/user";
import { entityId } from "@/lib/utils/api-error";
import { getStudentFullName } from "@/lib/utils/group-display";
import AddStudentToGroupModal from "./AddStudentToGroupModal";
import ConfirmActionModal from "./ConfirmActionModal";
import {
  Feedback,
  Field,
  inputClass,
  ModalFrame,
  primaryButton,
  redButton,
  TeacherSelect,
} from "./ManagementUI";
type Props = {
  group: Group | null;
  allStudents: AuthUser[];
  open: boolean;
  loading?: boolean;
  deleteLoading?: boolean;
  teachers?: AuthUser[];
  error?: string | null;
  success?: string | null;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    studentIds: string[];
    primaryTeacherId?: string;
  }) => void;
  onDelete: (group: Group) => void;
  onAddStudents?: (ids: string[]) => Promise<boolean>;
  onRemoveStudent?: (id: string) => Promise<boolean>;
};
export default function EditGroupModal(props: Props) {
  return props.open && props.group ? (
    <GroupDialog key={props.group._id} {...props} group={props.group} />
  ) : null;
}
function GroupDialog({
  group,
  allStudents,
  loading,
  deleteLoading,
  teachers,
  error,
  success,
  onClose,
  onSave,
  onDelete,
  onAddStudents,
  onRemoveStudent,
}: Props & { group: Group }) {
  const [name, setName] = useState(group.name ?? "");
  const [primaryTeacherId, setPrimaryTeacherId] = useState(
    entityId(group.teacher),
  );
  const [selectedIds, setSelectedIds] = useState(
    group.students.map((s) => s._id),
  );
  const [addOpen, setAddOpen] = useState(false);
  const [confirm, setConfirm] = useState<"delete" | AuthUser | null>(null);
  const busy = !!(loading || deleteLoading);
  const currentIds = onAddStudents
    ? group.students.map((s) => s._id)
    : selectedIds;
  const available = allStudents.filter((s) => !currentIds.includes(s._id));
  const members = onAddStudents
    ? group.students
    : [
        ...new Map(
          [
            ...group.students,
            ...allStudents.filter((s) => selectedIds.includes(s._id)),
          ].map((s) => [s._id, s]),
        ).values(),
      ];
  const add = async (ids: string[]) => {
    if (busy) return;
    if (onAddStudents) {
      if (await onAddStudents(ids)) setAddOpen(false);
    } else {
      setSelectedIds([...new Set([...selectedIds, ...ids])]);
      setAddOpen(false);
    }
  };
  return (
    <>
      <ModalFrame title="Edit group" busy={busy} onClose={onClose}>
        <Feedback error={error} success={success} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy)
              onSave({
                name: name.trim(),
                studentIds: [...new Set(currentIds)],
                ...(teachers ? { primaryTeacherId } : {}),
              });
          }}
        >
          <fieldset disabled={busy} className="space-y-5">
            <Field label="Group Name (optional)">
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            {teachers && (
              <TeacherSelect
                required
                teachers={teachers}
                value={primaryTeacherId}
                onChange={setPrimaryTeacherId}
                disabled={busy}
              />
            )}
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium text-gray-900">Current Members</h3>
              <button
                type="button"
                className={primaryButton}
                onClick={() => setAddOpen(true)}
              >
                Add Student
              </button>
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3">
              {members.length === 0 && (
                <p className="text-sm text-gray-700">
                  No students in this group.
                </p>
              )}
              {members.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 text-sm text-gray-800"
                >
                  {onRemoveStudent ? (
                    <>
                      <span>
                        {getStudentFullName(s)}
                        <span className="block text-gray-600">{s.email}</span>
                      </span>
                      <button
                        type="button"
                        className={redButton}
                        onClick={() => setConfirm(s)}
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(s._id)}
                        onChange={() =>
                          setSelectedIds((ids) =>
                            ids.includes(s._id)
                              ? ids.filter((id) => id !== s._id)
                              : [...ids, s._id],
                          )
                        }
                      />
                      {getStudentFullName(s)}
                    </label>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className={primaryButton}
                disabled={busy || (!!teachers && !primaryTeacherId)}
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                className={redButton}
                onClick={() => setConfirm("delete")}
              >
                Delete Group
              </button>
            </div>
          </fieldset>
        </form>
      </ModalFrame>
      {addOpen && (
        <AddStudentToGroupModal
          open
          availableStudents={available}
          loading={busy}
          error={error}
          onClose={() => setAddOpen(false)}
          onConfirm={(ids) => {
            void add(ids);
          }}
        />
      )}
      <ConfirmActionModal
        open={!!confirm}
        title={
          confirm === "delete"
            ? "Are you sure you want to delete this group?"
            : "Remove student from group?"
        }
        description={
          confirm === "delete"
            ? "The group and its future lessons will be removed. Student accounts will not be deleted."
            : "This only removes group membership. The student account will remain."
        }
        confirmLabel={confirm === "delete" ? "Delete Group" : "Remove Student"}
        loading={busy}
        error={error}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm === "delete") onDelete(group);
          else if (confirm && onRemoveStudent)
            void onRemoveStudent(confirm._id).then((ok) => {
              if (ok) setConfirm(null);
            });
        }}
      />
    </>
  );
}
