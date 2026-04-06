"use client";

import axios from "axios";
import { useEffect, useState } from "react";

import PortalGuard from "@/components/auth/PortalGuard";
import LessonDetailsModal from "@/components/portal/LessonDetailsModal";
import LessonsCalendar from "@/components/portal/LessonsCalendar";
import PortalShell from "@/components/portal/PortalShell";
import {
  fetchMyLessonsInRange,
  joinTeacherLesson,
} from "@/lib/api/lessons";
import { getBrowserTimeZone } from "@/lib/utils/datetime";
import { Lesson } from "@/types/lesson";

function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = (error.response?.data as
      | { message?: string | string[] }
      | undefined)?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage[0] || fallback;
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

  useEffect(() => {
    setTimeZone(getBrowserTimeZone());
  }, []);

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
    try {
      setJoiningLessonId(lesson._id);
      setError(null);

      await joinTeacherLesson(lesson._id);

      setLessons((previousLessons) =>
        previousLessons.map((item) =>
          item._id === lesson._id
            ? {
                ...item,
                teacherJoined: true,
              }
            : item,
        ),
      );

      setSelectedLesson((previousLesson) =>
        previousLesson && previousLesson._id === lesson._id
          ? {
              ...previousLesson,
              teacherJoined: true,
            }
          : previousLesson,
      );
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to join class"));
    } finally {
      setJoiningLessonId(null);
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

          <LessonsCalendar
            lessons={lessons}
            viewerRole="teacher"
            onRangeChange={({ start, end }) => {
              void loadRange(start, end);
            }}
            onEventClick={(lesson) => setSelectedLesson(lesson)}
          />

          <LessonDetailsModal
            lesson={selectedLesson}
            timeZone={timeZone}
            joinDisabled={false}
            joining={joiningLessonId === selectedLesson?._id}
            onClose={() => setSelectedLesson(null)}
            onJoin={handleJoin}
          />
        </div>
      </PortalShell>
    </PortalGuard>
  );
}
