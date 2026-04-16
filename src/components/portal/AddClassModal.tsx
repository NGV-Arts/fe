"use client";

import { useEffect, useState } from "react";
import TimezoneSelect, { type ITimezone } from "react-timezone-select";

import { getBrowserTimeZone } from "@/lib/utils/datetime";
import { Group } from "@/types/group";
import { AuthUser } from "@/types/user";

type CreateLessonPayload = {
  groupClass: boolean;
  studentId?: string;
  groupId?: string;
  date: string;
  time: string;
  timezone: string;
  durationMinutes: number;
};

type Props = {
  open: boolean;
  students: AuthUser[];
  groups: Group[];
  loading?: boolean;
  onClose: () => void;
  onCreate: (payload: CreateLessonPayload) => void;
};

function getStudentFullName(student: AuthUser) {
  const first = student.firstName ?? "";
  const last = student.lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || student.email;
}

function getGroupDisplayName(group: Group) {
  const trimmedName = group.name?.trim();
  if (trimmedName) return trimmedName;

  const names = (group.students ?? [])
    .map((student) => student.firstName?.trim() || student.email || "Student")
    .filter(Boolean);

  return names.length > 0 ? names.join(", ") : "Group";
}

function getLocalDateInputValue() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

function getTimeZoneValue(timezone: ITimezone): string {
  return typeof timezone === "string" ? timezone : timezone.value;
}

export default function AddClassModal({
  open,
  students,
  groups,
  loading = false,
  onClose,
  onCreate,
}: Props) {
  const browserTimeZone = getBrowserTimeZone();

  const [groupClass, setGroupClass] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timezone, setTimezone] = useState<ITimezone>({
    value: browserTimeZone,
    label: browserTimeZone,
  });

  useEffect(() => {
    if (!open) return;

    setGroupClass(false);
    setStudentId("");
    setGroupId("");
    setDate(getLocalDateInputValue());
    setTime("17:00");
    setDurationMinutes(60);
    setTimezone({
      value: browserTimeZone,
      label: browserTimeZone,
    });
  }, [browserTimeZone, open]);

  if (!open) return null;

  const timezoneValue = getTimeZoneValue(timezone);
  const canSubmit = groupClass
    ? Boolean(groupId && date && time && timezoneValue && durationMinutes > 0)
    : Boolean(
        studentId && date && time && timezoneValue && durationMinutes > 0,
      );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add class</h2>
            <p className="mt-1 text-sm text-gray-600">
              Create a lesson in a chosen timezone. It will be stored in UTC and
              displayed in local time.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Lesson type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setGroupClass(false);
                  setGroupId("");
                }}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  !groupClass
                    ? "bg-black text-white"
                    : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => {
                  setGroupClass(true);
                  setStudentId("");
                }}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  groupClass
                    ? "bg-black text-white"
                    : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                Group
              </button>
            </div>
          </div>

          {!groupClass ? (
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Student
              </label>
              <select
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {getStudentFullName(student)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Group
              </label>
              <select
                value={groupId}
                onChange={(event) => setGroupId(event.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
              >
                <option value="">Select group</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {getGroupDisplayName(group)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(Number(event.target.value) || 0)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Timezone
            </label>
            <TimezoneSelect
              value={timezone}
              onChange={(value) => setTimezone(value)}
              className="text-sm"
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: 42,
                  borderColor: state.isFocused ? "#111827" : "#d1d5db",
                  boxShadow: state.isFocused
                    ? "0 0 0 2px rgba(17, 24, 39, 0.1)"
                    : "none",
                  "&:hover": {
                    borderColor: "#111827",
                  },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 90,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? "#111827"
                    : state.isFocused
                      ? "#f3f4f6"
                      : "#ffffff",
                  color: state.isSelected ? "#ffffff" : "#111827",
                }),
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSubmit || loading}
            onClick={() =>
              onCreate({
                groupClass,
                studentId: groupClass ? undefined : studentId,
                groupId: groupClass ? groupId : undefined,
                date,
                time,
                timezone: timezoneValue,
                durationMinutes,
              })
            }
            className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create class"}
          </button>
        </div>
      </div>
    </div>
  );
}
