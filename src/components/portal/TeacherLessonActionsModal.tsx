"use client";

import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/lib/utils/api-error";
import { fetchPastLessonDetails } from "@/lib/api/lessons";
import {
  formatLessonDateTime,
  formatViewerAndSavedTimeRange,
} from "@/lib/utils/datetime";
import {
  getGroupDisplayName,
  getGroupStudentFirstNames,
  getStudentFullName,
} from "@/lib/utils/group-display";
import { Group } from "@/types/group";
import { Lesson, PastLessonDetailsResponse } from "@/types/lesson";
import { AuthUser } from "@/types/user";

type Props = {
  lesson: Lesson | null;
  timeZone: string;
  onClose: () => void;
  onJoin?: (lesson: Lesson) => void;
  showTeamsLink?: boolean;
  onDelete: () => void;
  onReschedule: () => void;
  joining?: boolean;
  error?: string | null;
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

function getLessonGroup(lesson: Lesson): Group | null {
  if (lesson.group && typeof lesson.group === "object") {
    return lesson.group as Group;
  }
  return null;
}

function getLessonStudent(lesson: Lesson): AuthUser | null {
  if (lesson.student && typeof lesson.student === "object") {
    return lesson.student as AuthUser;
  }
  return null;
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

export default function TeacherLessonActionsModal({
  lesson,
  timeZone,
  onClose,
  onJoin,
  onDelete,
  onReschedule,
  joining = false,
  showTeamsLink = false,
  error,
}: Props) {
  const [pastDetails, setPastDetails] =
    useState<PastLessonDetailsResponse | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPastDetails = async () => {
      setPastDetails(null);
      setDetailsError(null);
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
      } catch (error) {
        if (!cancelled) {
          setPastDetails(null);
          setDetailsError(
            getApiErrorMessage(error, "Unable to load attendance."),
          );
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

  const timeRangeDisplay = formatViewerAndSavedTimeRange({
    startIso: lesson.startTime,
    endIso: lesson.endTime,
    savedTimeZone: lesson.timezone,
    viewerTimeZone: timeZone,
  });
  const lessonGroup = getLessonGroup(lesson);
  const lessonStudent = getLessonStudent(lesson);
  const isPastLesson = new Date(lesson.startTime).getTime() < Date.now();
  const modalTitle = lesson.groupClass
    ? lessonGroup?.name?.trim()
      ? getGroupDisplayName(lessonGroup)
      : "Lesson details"
    : getStudentFullName(lessonStudent);
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
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lesson details"
        className="max-h-[90vh] overflow-y-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {modalTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {lesson.groupClass
                ? getGroupStudentFirstNames(lessonGroup)
                : "Individual class"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
            <span className="font-medium text-gray-900">Time:</span>{" "}
            {timeRangeDisplay}
          </div>
          <div>
            <span className="font-medium text-gray-900">Date:</span>{" "}
            {formatLessonDateTime(lesson.startTime, timeZone)}
          </div>
          <div>
            <span className="font-medium text-gray-900">Meeting status:</span>{" "}
            {lesson.meetingStatus ?? "Not provided"}
          </div>

          <div>
            <span className="font-medium text-gray-900">Timezone:</span>{" "}
            {lesson.timezone || "Not provided"} · Viewing in {timeZone}
          </div>
          {showTeamsLink && (
            <div>
              <span className="font-medium text-gray-900">Teams:</span>{" "}
              {lesson.teamsJoinUrl ? (
                <a
                  className="font-medium text-red-700 underline break-all"
                  href={lesson.teamsJoinUrl}
                >
                  Open Teams meeting
                </a>
              ) : (
                "No meeting link available"
              )}
            </div>
          )}
          {detailsError && (
            <p role="alert" className="text-red-800">
              {detailsError}
            </p>
          )}
          {isPastLesson && !detailsError ? (
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

        <div className="mt-6 space-y-3">
          {error ? (
            <p role="alert" className="mb-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {onJoin && (
            <button
              type="button"
              onClick={() => onJoin(lesson)}
              disabled={joining}
              className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {joining ? "Joining..." : "Join"}
            </button>
          )}

          {!isPastLesson ? (
            <>
              <button
                type="button"
                onClick={onReschedule}
                className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Reschedule lesson
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete lesson
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
