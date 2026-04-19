import { AuthUser } from "@/types/user";

import { apiClient } from "./client";

export async function updateMyProfile(payload: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<AuthUser> {
  const response = await apiClient.patch<AuthUser>("/users/me", payload);
  return response.data;
}

export async function fetchMyStudents(params?: {
  teacherId?: string;
}): Promise<AuthUser[]> {
  const response = await apiClient.get<AuthUser[]>("/users/my-students", {
    params,
  });
  return response.data;
}

export async function fetchStudentById(userId: string): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>(`/users/${userId}`);
  return response.data;
}

export async function createStudent(payload: {
  firstName: string;
  lastName: string;
  email: string;
  role: "student";
  class: {
    rate: number;
    currency: string;
    classCycle: number;
    left: number;
  };
}): Promise<AuthUser> {
  const response = await apiClient.post<AuthUser>("/users", payload);
  return response.data;
}

export async function updateStudentProfile(
  userId: string,
  payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
  },
): Promise<AuthUser> {
  const response = await apiClient.patch<AuthUser>(`/users/${userId}`, payload);
  return response.data;
}

export async function updateStudentClass(
  userId: string,
  payload: {
    rate?: number;
    currency?: string;
    classCycle?: number;
    left?: number;
  },
): Promise<AuthUser> {
  const response = await apiClient.patch<AuthUser>(
    `/users/class/${userId}`,
    payload,
  );
  return response.data;
}

export async function deleteStudent(
  userId: string,
): Promise<{ deleted?: boolean; message?: string }> {
  const response = await apiClient.delete<{
    deleted?: boolean;
    message?: string;
  }>(`/users/${userId}`);
  return response.data;
}
