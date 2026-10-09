import { Lesson, PastLessonDetailsResponse } from "@/types/lesson";

import { apiClient } from "./client";

type JoinMeetingResponse = {
  teamsJoinUrl?: string | null;
  lesson: Lesson;
};

type StudentJoinResponse = JoinMeetingResponse & {
  success: true;
  left: number;
  attended: number;
};
type TeacherJoinResponse = JoinMeetingResponse & {
  success: true;
  teacherJoined: true;
};

export function getJoinedLessonUpdate(lesson: Lesson) {
  // Retain populated teacher/student/group details already loaded by the calendar.
  return {
    meetingStatus: lesson.meetingStatus,
    teacherJoined: lesson.teacherJoined,
    joinedStudents: lesson.joinedStudents,
    countedStudents: lesson.countedStudents,
    teamsJoinUrl: lesson.teamsJoinUrl,
  };
}

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

export async function createLesson(payload: {
  groupClass: boolean;
  studentId?: string;
  groupId?: string;
  date: string;
  time: string;
  timezone: string;
  durationMinutes: number;
}): Promise<Lesson> {
  const response = await apiClient.post<Lesson>("/lessons", payload);
  return response.data;
}

export async function joinStudentLesson(
  lessonId: string,
): Promise<StudentJoinResponse> {
  const response = await apiClient.post<StudentJoinResponse>(
    `/lessons/${lessonId}/join/student`,
  );
  return response.data;
}

export async function joinTeacherLesson(
  lessonId: string,
): Promise<TeacherJoinResponse> {
  const response = await apiClient.post<TeacherJoinResponse>(
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
  newDate: string;
  newTime: string;
  timezone: string;
  durationMinutes: number;
}): Promise<{ affectedLessonIds: string[] }> {
  const response = await apiClient.patch<{ affectedLessonIds: string[] }>(
    `/lessons/${params.lessonId}/reschedule`,
    {
      scope: "single",
      newDate: params.newDate,
      newTime: params.newTime,
      timezone: params.timezone,
      durationMinutes: params.durationMinutes,
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
  newTime: string;
  timezone: string;
  durationMinutes: number;
}): Promise<{ affectedLessonIds: string[] }> {
  const response = await apiClient.patch<{ affectedLessonIds: string[] }>(
    `/lessons/${params.recurrenceId}/reschedule`,
    {
      scope: "series",
      newDayOfWeek: params.newDayOfWeek,
      newTime: params.newTime,
      timezone: params.timezone,
      durationMinutes: params.durationMinutes,
    },
  );
  return response.data;
}
