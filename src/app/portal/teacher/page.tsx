"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import PortalGuard from "@/components/auth/PortalGuard";
import AddClassModal from "@/components/portal/AddClassModal";
import ConfirmActionModal from "@/components/portal/ConfirmActionModal";
import LessonRecurringChoiceModal from "@/components/portal/LessonRecurringChoiceModal";
import LessonsCalendar from "@/components/portal/LessonsCalendar";
import PortalShell from "@/components/portal/PortalShell";
import RescheduleSeriesModal from "@/components/portal/RescheduleSeriesModal";
import RescheduleSingleModal from "@/components/portal/RescheduleSingleModal";
import TeacherLessonActionsModal from "@/components/portal/TeacherLessonActionsModal";
import { fetchMyGroups } from "@/lib/api/groups";
import {
  createLesson,
  deleteLesson,
  fetchMyLessonsInRange,
  getJoinedLessonUpdate,
  joinTeacherLesson,
  rescheduleRecurringLessons,
  rescheduleSingleLesson,
} from "@/lib/api/lessons";
import { fetchMyStudents } from "@/lib/api/users";
import { getBrowserTimeZone } from "@/lib/utils/datetime";
import { Group } from "@/types/group";
import { Lesson } from "@/types/lesson";
import { AuthUser } from "@/types/user";

type PendingDeleteMode = "single" | "series" | null;
type PendingRescheduleMode = "single" | "series" | null;

type ApiMessage = { message?: string | string[] };

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = (error.response?.data as ApiMessage | undefined)
      ?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage.join(", ") || fallback;
    }

    return responseMessage || fallback;
  }

  return fallback;
}

export default function TeacherPortalPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningLessonId, setJoiningLessonId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeZone, setTimeZone] = useState("UTC");
  const [students, setStudents] = useState<AuthUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [lastRange, setLastRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [createClassLoading, setCreateClassLoading] = useState(false);

  const [recurringChoiceOpen, setRecurringChoiceOpen] = useState(false);
  const [recurringChoiceMode, setRecurringChoiceMode] = useState<
    "delete" | "reschedule"
  >("delete");

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteMode, setPendingDeleteMode] =
    useState<PendingDeleteMode>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [rescheduleSingleOpen, setRescheduleSingleOpen] = useState(false);
  const [rescheduleSeriesOpen, setRescheduleSeriesOpen] = useState(false);
  const [, setPendingRescheduleMode] = useState<PendingRescheduleMode>(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  useEffect(() => {
    setTimeZone(getBrowserTimeZone());
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [studentsData, groupsData] = await Promise.all([
          fetchMyStudents(),
          fetchMyGroups(),
        ]);
        setStudents(studentsData);
        setGroups(groupsData);
      } catch {
        // Keep the calendar usable even if selector options fail to load.
      }
    };

    void loadOptions();
  }, []);

  const closeAllModals = () => {
    setSelectedLesson(null);
    setAddClassOpen(false);
    setRecurringChoiceOpen(false);
    setConfirmDeleteOpen(false);
    setRescheduleSingleOpen(false);
    setRescheduleSeriesOpen(false);
    setPendingDeleteMode(null);
    setPendingRescheduleMode(null);
  };

  const loadRange = async (start: string, end: string) => {
    try {
      setLoading(true);
      setError(null);
      setLastRange({ start, end });
      const data = await fetchMyLessonsInRange({ start, end });

      setLessons(data);
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to load classes"));
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentRange = async () => {
    if (!lastRange) return;
    await loadRange(lastRange.start, lastRange.end);
  };

  const handleJoin = async (lesson: Lesson) => {
    if (!lesson?._id) {
      console.error("[JoinLesson][teacher] missing lesson id");
      setError("Unable to identify this lesson.");
      return;
    }

    try {
      setJoiningLessonId(lesson._id);
      setError(null);

      const result = await joinTeacherLesson(lesson._id);

      const lessonUpdate = getJoinedLessonUpdate(result.lesson);
      setLessons((previousLessons) =>
        previousLessons.map((item) =>
          item._id === lesson._id
            ? {
                ...item,
                ...lessonUpdate,
              }
            : item,
        ),
      );

      setSelectedLesson((previousLesson) =>
        previousLesson && previousLesson._id === lesson._id
          ? {
              ...previousLesson,
              ...lessonUpdate,
            }
          : previousLesson,
      );

      const joinUrl =
        result.lesson.teamsJoinUrl ||
        result.teamsJoinUrl ||
        lesson.teamsJoinUrl;

      if (!joinUrl) {
        console.error("[JoinLesson][teacher] no Teams URL available", {
          lesson,
          joinResponse: result,
        });
        setError(
          "This lesson does not currently have a Teams meeting link. Please refresh the calendar and try again.",
        );
        return;
      }

      window.location.assign(joinUrl);
    } catch (error) {
      console.error("[JoinLesson][teacher] failed", error);
      setError(getApiErrorMessage(error, "Failed to join class"));
    } finally {
      setJoiningLessonId(null);
    }
  };

  const handleCreateClass = async (payload: {
    groupClass: boolean;
    studentId?: string;
    groupId?: string;
    date: string;
    time: string;
    timezone: string;
    durationMinutes: number;
  }) => {
    try {
      setCreateClassLoading(true);
      setError(null);

      await createLesson(payload);

      setAddClassOpen(false);
      await refreshCurrentRange();
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to create class"));
    } finally {
      setCreateClassLoading(false);
    }
  };

  const startDeleteFlow = () => {
    if (!selectedLesson) return;

    if (selectedLesson.recurrenceId) {
      setRecurringChoiceMode("delete");
      setRecurringChoiceOpen(true);
      return;
    }

    setPendingDeleteMode("single");
    setConfirmDeleteOpen(true);
  };

  const startRescheduleFlow = () => {
    if (!selectedLesson) return;

    if (selectedLesson.recurrenceId) {
      setRecurringChoiceMode("reschedule");
      setRecurringChoiceOpen(true);
      return;
    }

    setPendingRescheduleMode("single");
    setRescheduleSingleOpen(true);
  };

  const handleChooseRecurringSingle = () => {
    setRecurringChoiceOpen(false);

    if (recurringChoiceMode === "delete") {
      setPendingDeleteMode("single");
      setConfirmDeleteOpen(true);
      return;
    }

    setPendingRescheduleMode("single");
    setRescheduleSingleOpen(true);
  };

  const handleChooseRecurringSeries = () => {
    setRecurringChoiceOpen(false);

    if (recurringChoiceMode === "delete") {
      setPendingDeleteMode("series");
      setConfirmDeleteOpen(true);
      return;
    }

    setPendingRescheduleMode("series");
    setRescheduleSeriesOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLesson || !pendingDeleteMode) return;

    try {
      setDeleteLoading(true);
      setError(null);

      await deleteLesson({
        id:
          pendingDeleteMode === "series"
            ? selectedLesson.recurrenceId || selectedLesson._id
            : selectedLesson._id,
        deleteRecurring: pendingDeleteMode === "series",
      });

      closeAllModals();
      await refreshCurrentRange();
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to delete class"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSingleRescheduleSubmit = async (payload: {
    date: string;
    time: string;
    timezone: string;
    durationMinutes: number;
  }) => {
    if (!selectedLesson) return;

    try {
      setRescheduleLoading(true);
      setError(null);

      await rescheduleSingleLesson({
        lessonId: selectedLesson._id,
        newDate: payload.date,
        newTime: payload.time,
        timezone: payload.timezone,
        durationMinutes: payload.durationMinutes,
      });

      setRescheduleSingleOpen(false);
      setSelectedLesson(null);
      setPendingRescheduleMode(null);
      await refreshCurrentRange();
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to reschedule lesson"));
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleSeriesRescheduleSubmit = async (payload: {
    day:
      | "sunday"
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday";
    time: string;
    timezone: string;
    durationMinutes: number;
  }) => {
    if (!selectedLesson?.recurrenceId) return;

    try {
      setRescheduleLoading(true);
      setError(null);

      await rescheduleRecurringLessons({
        recurrenceId: selectedLesson.recurrenceId,
        newDayOfWeek: payload.day,
        newTime: payload.time,
        timezone: payload.timezone,
        durationMinutes: payload.durationMinutes,
      });

      setRescheduleSeriesOpen(false);
      setSelectedLesson(null);
      setPendingRescheduleMode(null);
      await refreshCurrentRange();
    } catch (error) {
      setError(
        getApiErrorMessage(error, "Failed to reschedule recurring lessons"),
      );
    } finally {
      setRescheduleLoading(false);
    }
  };

  return (
    <PortalGuard allowedRoles={["teacher"]}>
      <PortalShell title="Teacher Portal">
        <div className="space-y-6">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Loading calendar...</p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setAddClassOpen(true)}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Add class
              </button>
            </div>

            <LessonsCalendar
              lessons={lessons}
              viewerRole="teacher"
              onRangeChange={({ start, end }) => {
                void loadRange(start, end);
              }}
              onEventClick={(lesson) => setSelectedLesson(lesson)}
            />
          </div>

          <TeacherLessonActionsModal
            lesson={selectedLesson}
            timeZone={timeZone}
            joining={joiningLessonId === selectedLesson?._id}
            error={error}
            onClose={closeAllModals}
            onJoin={handleJoin}
            onDelete={startDeleteFlow}
            onReschedule={startRescheduleFlow}
          />

          <LessonRecurringChoiceModal
            open={recurringChoiceOpen}
            mode={recurringChoiceMode}
            onClose={closeAllModals}
            onChooseSingle={handleChooseRecurringSingle}
            onChooseSeries={handleChooseRecurringSeries}
          />

          <ConfirmActionModal
            open={confirmDeleteOpen}
            title="Are you sure?"
            description={
              pendingDeleteMode === "series"
                ? "This will delete all future classes in the recurring series."
                : "This will delete this class."
            }
            confirmLabel={
              pendingDeleteMode === "series"
                ? "Delete all future classes"
                : "Delete class"
            }
            loading={deleteLoading}
            onClose={closeAllModals}
            onConfirm={() => {
              void handleDeleteConfirm();
            }}
          />

          <RescheduleSingleModal
            open={rescheduleSingleOpen}
            lesson={selectedLesson}
            loading={rescheduleLoading}
            onClose={closeAllModals}
            onSubmit={(payload) => {
              void handleSingleRescheduleSubmit(payload);
            }}
          />

          <RescheduleSeriesModal
            open={rescheduleSeriesOpen}
            lesson={selectedLesson}
            loading={rescheduleLoading}
            onClose={closeAllModals}
            onSubmit={(payload) => {
              void handleSeriesRescheduleSubmit(payload);
            }}
          />

          <AddClassModal
            open={addClassOpen}
            students={students}
            groups={groups}
            loading={createClassLoading}
            onClose={() => setAddClassOpen(false)}
            onCreate={(payload) => {
              void handleCreateClass(payload);
            }}
          />

          <div className="text-sm text-gray-500">
            Times shown in your browser time zone: {timeZone}
          </div>
        </div>
      </PortalShell>
    </PortalGuard>
  );
}
