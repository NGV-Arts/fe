"use client";
import { useCallback, useState } from "react";
import { getAdminLessons, getAllUsers, getGroups } from "@/lib/api/admin";
import { deleteLesson, rescheduleSingleLesson } from "@/lib/api/lessons";
import { useMutation, useResource } from "@/lib/hooks/use-management";
import { getBrowserTimeZone } from "@/lib/utils/datetime";
import {
  getGroupDisplayName,
  getStudentFullName,
} from "@/lib/utils/group-display";
import { Lesson } from "@/types/lesson";
import LessonsCalendar from "@/components/portal/LessonsCalendar";
import TeacherLessonActionsModal from "@/components/portal/TeacherLessonActionsModal";
import RescheduleSingleModal from "@/components/portal/RescheduleSingleModal";
import ConfirmActionModal from "@/components/portal/ConfirmActionModal";
import {
  cardClass,
  Feedback,
  Field,
  inputClass,
  outlineButton,
  TeacherSelect,
} from "@/components/portal/ManagementUI";
export default function AdminCalendarPage() {
  const [range, setRange] = useState<{ start: string; end: string } | null>(
    null,
  );
  const [teacherId, setTeacherId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [selectionTime, setSelectionTime] = useState(0);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [mode, setMode] = useState<"delete" | "reschedule" | null>(null);
  const mutation = useMutation();
  const options = useResource(
    useCallback(async () => {
      const [teachers, students, groups] = await Promise.all([
        getAllUsers("teacher"),
        getAllUsers("student"),
        getGroups(),
      ]);
      return { teachers, students, groups };
    }, []),
  );
  const lessons = useResource(
    useCallback(
      () =>
        range
          ? getAdminLessons({
              ...range,
              teacherId: teacherId || undefined,
              studentId: studentId || undefined,
              groupId: groupId || undefined,
            })
          : Promise.resolve([]),
      [range, teacherId, studentId, groupId],
    ),
  );
  const onRangeChange = useCallback(
    (value: { start: string; end: string }) =>
      setRange((previous) =>
        previous?.start === value.start && previous?.end === value.end
          ? previous
          : value,
      ),
    [],
  );
  const future =
    selected && new Date(selected.startTime).getTime() > selectionTime;
  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Calendar / Lessons
        </h2>
        <Feedback
          error={options.error || lessons.error || mutation.error}
          success={mutation.success}
        />
        {(options.error || lessons.error) && (
          <button
            className={outlineButton}
            onClick={() => {
              void options.reload();
              void lessons.reload();
            }}
          >
            Retry
          </button>
        )}
        <div className="grid items-end gap-4 md:grid-cols-3">
          <TeacherSelect
            teachers={options.data?.teachers ?? []}
            value={teacherId}
            onChange={setTeacherId}
            disabled={options.loading}
          />
          <Field label="Student">
            <select
              className={inputClass}
              value={studentId}
              disabled={options.loading}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">All students</option>
              {options.data?.students.map((s) => (
                <option key={s._id} value={s._id}>
                  {getStudentFullName(s)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Group">
            <select
              className={inputClass}
              value={groupId}
              disabled={options.loading}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">All groups</option>
              {options.data?.groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {getGroupDisplayName(g)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="mt-3 text-sm text-gray-700">
          Times shown in {getBrowserTimeZone()}.{" "}
          {lessons.loading
            ? "Loading lessons…"
            : `${lessons.data?.length ?? 0} lessons in this range.`}
        </p>
      </section>
      <LessonsCalendar
        lessons={lessons.data ?? []}
        viewerRole="admin"
        onRangeChange={onRangeChange}
        onEventClick={(lesson) => {
          mutation.clear();
          setSelectionTime(Date.now());
          setSelected(lesson);
        }}
      />
      <TeacherLessonActionsModal
        key={selected?._id ?? "none"}
        lesson={mode ? null : selected}
        timeZone={getBrowserTimeZone()}
        showTeamsLink
        error={mutation.error}
        onClose={() => setSelected(null)}
        onDelete={() => {
          if (future) setMode("delete");
        }}
        onReschedule={() => {
          if (future) setMode("reschedule");
        }}
      />
      <RescheduleSingleModal
        open={mode === "reschedule" && !!future}
        lesson={selected}
        loading={mutation.busy}
        error={mutation.error}
        onClose={() => setMode(null)}
        onSubmit={(value) => {
          if (!selected || new Date(selected.startTime).getTime() <= Date.now())
            return;
          const lessonId = selected._id;
          void mutation.run(async () => {
            await rescheduleSingleLesson({
              lessonId,
              newDate: value.date,
              newTime: value.time,
              timezone: value.timezone,
              durationMinutes: value.durationMinutes,
            });
            setMode(null);
            setSelected(null);
            await lessons.reload();
          }, "Lesson rescheduled.");
        }}
      />
      <ConfirmActionModal
        open={mode === "delete" && !!future}
        title="Delete this lesson?"
        description="Only this future lesson will be deleted. Other lessons in the series will remain."
        confirmLabel="Delete Lesson"
        loading={mutation.busy}
        error={mutation.error}
        onClose={() => setMode(null)}
        onConfirm={() => {
          if (!selected || new Date(selected.startTime).getTime() <= Date.now())
            return;
          const id = selected._id;
          void mutation.run(async () => {
            await deleteLesson({ id, deleteRecurring: false });
            setMode(null);
            setSelected(null);
            await lessons.reload();
          }, "Lesson deleted.");
        }}
      />
    </div>
  );
}
