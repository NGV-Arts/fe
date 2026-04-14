"use client";

import { useEffect, useState } from "react";

import { fetchPastLessonDetails } from "@/lib/api/lessons";
import { formatLessonDateTime } from "@/lib/utils/datetime";
import { Lesson, PastLessonDetailsResponse } from "@/types/lesson";

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

function getUserDisplayName(user: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  const first = user.firstName ?? "";
  const last = user.lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || user.email || "Student";
}

export default function LessonDetailsModal({
  lesson,
  timeZone,
  joinDisabled,
  joining,
  onClose,
  onJoin,
}: Props) {
  const [pastDetails, setPastDetails] =
    useState<PastLessonDetailsResponse | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPastDetails = async () => {
      if (!lesson) {
        setPastDetails(null);
        return;
      }

      const isPastLesson = new Date(lesson.startTime).getTime() < Date.now();

      if (!isPastLesson) {
        setPastDetails(null);
        return;
      }

      try {
        setDetailsLoading(true);
        const data = await fetchPastLessonDetails(lesson._id);
        if (!cancelled) {
          setPastDetails(data);
        }
      } catch {
        if (!cancelled) {
          setPastDetails(null);
        }
      } finally {
        if (!cancelled) {
          setDetailsLoading(false);
        }
      }
    };

    void loadPastDetails();

    return () => {
      cancelled = true;
    };
  }, [lesson]);

  if (!lesson) return null;

  const isPastLesson = new Date(lesson.startTime).getTime() < Date.now();
  const teacherJoined =
    pastDetails?.attendance.teacherJoined ?? lesson.teacherJoined ?? false;
  const attendanceNames =
    pastDetails?.attendance.countedStudents?.map((student) =>
      getUserDisplayName(student),
    ) ?? [];
  const attendanceDisplay =
    attendanceNames.length > 0 ? attendanceNames.join(", ") : "None";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Lesson details
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {lesson.groupClass ? "Group class" : "Individual class"}
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

        <div className="space-y-3 text-sm text-gray-600">
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

          {isPastLesson ? (
            detailsLoading ? (
              <div className="text-sm text-gray-600">Loading attendance...</div>
            ) : (
              <>
                <div>
                  <span className="font-medium text-gray-900">
                    Teacher joined:
                  </span>{" "}
                  {teacherJoined ? "Yes" : "No"}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Attendance:</span>{" "}
                  {attendanceDisplay}
                </div>
              </>
            )
          ) : null}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => onJoin(lesson)}
            disabled={joinDisabled || joining}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {joining ? "Joining..." : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}
