import { Lesson } from "@/types/lesson";

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
