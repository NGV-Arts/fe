"use client";

import { formatLessonDateTime } from "@/lib/utils/datetime";
import { Lesson } from "@/types/lesson";

type Props = {
  lessons: Lesson[];
  timeZone: string;
  classesLeft: number;
  joiningLessonId: string | null;
  onJoin: (lessonId: string) => void;
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

export default function FutureClassesCard({
  lessons,
  timeZone,
  classesLeft,
  joiningLessonId,
  onJoin,
}: Props) {
  const joinDisabled = classesLeft < 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming classes</h2>
        <p className="text-sm text-gray-500">
          Times shown in your timezone: {timeZone}
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
          No upcoming classes found.
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div
              key={lesson._id}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatLessonDateTime(lesson.startTime, timeZone)}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Ends: {formatLessonDateTime(lesson.endTime, timeZone)}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  With {getTeacherName(lesson)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {lesson.groupClass ? "Group class" : "Individual class"}
                </p>
              </div>

              <button
                onClick={() => onJoin(lesson._id)}
                disabled={joinDisabled || joiningLessonId === lesson._id}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {joiningLessonId === lesson._id ? "Joining..." : "Join"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
