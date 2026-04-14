import { Lesson, PastLessonDetailsResponse } from "@/types/lesson";

import { apiClient } from "./client";

export async function fetchMyFutureLessons(): Promise<Lesson[]> {
  const response = await apiClient.get<Lesson[]>("/lessons/me/future");
  return response.data;
}

export async function fetchMyLessonsInRange(params: {
  start: string;
  end: string;
}): Promise<Lesson[]> {
  const response = await apiClient.get<Lesson[]>("/lessons/me/range", {
    params,
  });
  return response.data;
}

export async function fetchPastLessonDetails(
  lessonId: string,
): Promise<PastLessonDetailsResponse> {
  const response = await apiClient.get<PastLessonDetailsResponse>(
    `/lessons/${lessonId}/past-details`,
  );
  return response.data;
}

export async function joinStudentLesson(
  lessonId: string,
): Promise<{ success: true; left: number }> {
  const response = await apiClient.post<{ success: true; left: number }>(
    `/lessons/${lessonId}/join/student`,
  );
  return response.data;
}

export async function joinTeacherLesson(
  lessonId: string,
): Promise<{ success: true; teacherJoined: true }> {
  const response = await apiClient.post<{ success: true; teacherJoined: true }>(
    `/lessons/${lessonId}/join/teacher`,
  );
  return response.data;
}

export async function deleteLesson(params: {
  id: string;
  deleteRecurring: boolean;
}): Promise<{ scope: "single" | "series"; deletedCount: number }> {
  const response = await apiClient.delete<{
    scope: "single" | "series";
    deletedCount: number;
  }>(`/lessons/${params.id}`, {
    data: {
      deleteRecurring: params.deleteRecurring,
    },
  });
  return response.data;
}

export async function rescheduleSingleLesson(params: {
  lessonId: string;
  newStartTime: string;
}): Promise<{ affectedLessonIds: string[] }> {
  const response = await apiClient.patch<{ affectedLessonIds: string[] }>(
    `/lessons/${params.lessonId}/reschedule`,
    {
      scope: "single",
      newStartTime: params.newStartTime,
    },
  );
  return response.data;
}

export async function rescheduleRecurringLessons(params: {
  recurrenceId: string;
  newDayOfWeek:
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday";
  newTimeGMT: string;
}): Promise<{ affectedLessonIds: string[] }> {
  const response = await apiClient.patch<{ affectedLessonIds: string[] }>(
    `/lessons/${params.recurrenceId}/reschedule`,
    {
      scope: "series",
      newDayOfWeek: params.newDayOfWeek,
      newTimeGMT: params.newTimeGMT,
    },
  );
  return response.data;
}
