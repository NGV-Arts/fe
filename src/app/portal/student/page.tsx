"use client";

import axios from "axios";
import { useEffect, useState } from "react";

import PortalGuard from "@/components/auth/PortalGuard";
import ClassBalanceWarning from "@/components/portal/ClassBalanceWarning";
import LessonDetailsModal from "@/components/portal/LessonDetailsModal";
import LessonsCalendar from "@/components/portal/LessonsCalendar";
import PlaceholderSection from "@/components/portal/PlaceholderSection";
import PortalShell from "@/components/portal/PortalShell";
import {
  fetchMyLessonsInRange,
  getJoinedLessonUpdate,
  joinStudentLesson,
} from "@/lib/api/lessons";
import { getUser, updateStoredUser } from "@/lib/auth/session";
import { getBrowserTimeZone } from "@/lib/utils/datetime";
import { Lesson } from "@/types/lesson";
import { AuthUser } from "@/types/user";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = (
      error.response?.data as { message?: string | string[] } | undefined
    )?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage.join(", ") || fallback;
    }

    return responseMessage || fallback;
  }

  return fallback;
}

export default function StudentPortalPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningLessonId, setJoiningLessonId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeZone, setTimeZone] = useState("UTC");

  useEffect(() => {
    setUser(getUser());
    setTimeZone(getBrowserTimeZone());
  }, []);

  const classesLeft = user?.class?.left ?? 0;

  const loadRange = async (start: string, end: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMyLessonsInRange({ start, end });

      setLessons(data);
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to load classes"));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (lesson: Lesson) => {
    if (!lesson?._id) {
      console.error("[JoinLesson][student] missing lesson id");
      setError("Unable to identify this lesson.");
      return;
    }

    if (classesLeft < 0) {
      console.warn("[JoinLesson][student] blocked by class balance", {
        classesLeft,
      });
      setError(
        "You have exceeded your class limit. Please contact your teacher.",
      );
      return;
    }

    try {
      setJoiningLessonId(lesson._id);
      setError(null);

      const result = await joinStudentLesson(lesson._id);

      setUser((previousUser) => {
        if (!previousUser) {
          return previousUser;
        }

        const nextUser: AuthUser = {
          ...previousUser,
          class: {
            rate: previousUser.class?.rate ?? 0,
            currency: previousUser.class?.currency ?? "USD",
            classCycle: previousUser.class?.classCycle ?? 0,
            left: result.left,
          },
          attended: result.attended,
        };

        updateStoredUser(nextUser);
        return nextUser;
      });

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
        console.error("[JoinLesson][student] no Teams URL available", {
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
      console.error("[JoinLesson][student] failed", error);
      setError(getApiErrorMessage(error, "Failed to join class"));
    } finally {
      setJoiningLessonId(null);
    }
  };

  return (
    <PortalGuard allowedRoles={["student"]}>
      <PortalShell title="Student Portal">
        <div className="space-y-6">
          <ClassBalanceWarning classesLeft={classesLeft} />

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Class balance
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Classes left
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {classesLeft}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Class cycle
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {user?.class?.classCycle ?? 0}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Rate
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {user?.class?.currency ?? "USD"} {user?.class?.rate ?? 0}
                </p>
              </div>
            </div>
          </div>

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

          <LessonsCalendar
            lessons={lessons}
            viewerRole="student"
            onRangeChange={({ start, end }) => {
              void loadRange(start, end);
            }}
            onEventClick={(lesson) => setSelectedLesson(lesson)}
          />

          <PlaceholderSection title="Documents" />
          <PlaceholderSection title="Videos" />

          <LessonDetailsModal
            lesson={selectedLesson}
            timeZone={timeZone}
            joinDisabled={classesLeft < 0}
            joining={joiningLessonId === selectedLesson?._id}
            error={error}
            onClose={() => setSelectedLesson(null)}
            onJoin={handleJoin}
          />
        </div>
      </PortalShell>
    </PortalGuard>
  );
}
