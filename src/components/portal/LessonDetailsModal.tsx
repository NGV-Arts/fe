"use client";

import { formatLessonDateTime } from "@/lib/utils/datetime";
import { Lesson } from "@/types/lesson";

type Props = {
  lesson: Lesson | null;
  timeZone: string;
  joinDisabled: boolean;
  joining: boolean;
  onClose: () => void;
  onJoin: (lesson: Lesson) => void;
};

function getTeacherName(lesson: Lesson): string {
  if (lesson.teacher && typeof lesson.teacher === "object") {
    const first = lesson.teacher.firstName ?? "";
    const last = lesson.teacher.lastName ?? "";
    const full = `${first} ${last}`.trim();
    return full || lesson.teacher.email || "Teacher";
  }

  return "Teacher";
}

export default function LessonDetailsModal({
  lesson,
  timeZone,
  joinDisabled,
  joining,
  onClose,
  onJoin,
}: Props) {
  if (!lesson) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Lesson details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {lesson.groupClass ? "Group class" : "Individual class"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <span className="font-medium text-gray-900">Teacher:</span>{" "}
            {getTeacherName(lesson)}
          </div>
          <div>
            <span className="font-medium text-gray-900">Start:</span>{" "}
            {formatLessonDateTime(lesson.startTime, timeZone)}
          </div>
          <div>
            <span className="font-medium text-gray-900">End:</span>{" "}
            {formatLessonDateTime(lesson.endTime, timeZone)}
          </div>
          <div>
            <span className="font-medium text-gray-900">Meeting status:</span>{" "}
            {lesson.meetingStatus ?? "pending"}
          </div>
          <div>
            <span className="font-medium text-gray-900">Attendance:</span>{" "}
            Teacher joined: {lesson.teacherJoined ? "Yes" : "No"}
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => onJoin(lesson)}
            disabled={joinDisabled || joining}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {joining ? "Joining..." : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}
