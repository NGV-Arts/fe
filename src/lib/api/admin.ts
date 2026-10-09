import { apiClient } from "./client";
import { AuthUser } from "@/types/user";
import { Group } from "@/types/group";
import { Lesson } from "@/types/lesson";

export interface UserPage {
  items: AuthUser[];
  total: number;
  page: number;
  limit: number;
}
export interface UserQuery {
  search?: string;
  teacherId?: string;
  page?: number;
  limit?: number;
}
export interface ManagedUserInput {
  firstName: string;
  lastName: string;
  email: string;
}
export interface ManagedStudentInput extends ManagedUserInput {
  primaryTeacherId: string;
  rate: number;
  currency: string;
  classCycle: number;
}
export interface TeacherDetail extends AuthUser {
  students: AuthUser[];
  groups: Group[];
}

export async function getStudents(params?: UserQuery): Promise<UserPage> {
  return (await apiClient.get<UserPage>("/users/students", { params })).data;
}
export async function getTeachers(params?: UserQuery): Promise<UserPage> {
  return (await apiClient.get<UserPage>("/users/teachers", { params })).data;
}
// Dropdowns and local search must include every page, not just the API's first 20 users.
export async function getAllUsers(
  role: "student" | "teacher",
  teacherId?: string,
): Promise<AuthUser[]> {
  const fetchPage = role === "student" ? getStudents : getTeachers;
  const first = await fetchPage({ teacherId, page: 1, limit: 100 });
  const items = [...first.items];
  for (let page = 2; page <= Math.ceil(first.total / first.limit); page++) {
    items.push(...(await fetchPage({ teacherId, page, limit: 100 })).items);
  }
  return items;
}
export async function createAdminStudent(
  payload: ManagedStudentInput,
): Promise<AuthUser> {
  return (await apiClient.post<AuthUser>("/users/students", payload)).data;
}
export async function updateAdminStudent(
  id: string,
  payload: ManagedStudentInput,
): Promise<AuthUser> {
  return (await apiClient.patch<AuthUser>(`/users/students/${id}`, payload))
    .data;
}
export async function addStudentClasses(
  id: string,
  classesToAdd: number,
): Promise<AuthUser> {
  return (
    await apiClient.post<AuthUser>(`/users/students/${id}/add-classes`, {
      classesToAdd,
    })
  ).data;
}
export async function deleteAdminStudent(id: string): Promise<void> {
  await apiClient.delete(`/users/students/${id}`);
}
export async function createTeacher(
  payload: ManagedUserInput,
): Promise<AuthUser> {
  return (await apiClient.post<AuthUser>("/users/teachers", payload)).data;
}
export async function updateTeacher(
  id: string,
  payload: ManagedUserInput,
): Promise<AuthUser> {
  return (await apiClient.patch<AuthUser>(`/users/teachers/${id}`, payload))
    .data;
}
export async function getTeacher(id: string): Promise<TeacherDetail> {
  return (await apiClient.get<TeacherDetail>(`/users/teachers/${id}`)).data;
}
export async function deleteTeacher(id: string): Promise<void> {
  await apiClient.delete(`/users/teachers/${id}`);
}
export async function sendPasswordReset(id: string): Promise<void> {
  await apiClient.post(`/users/${id}/send-password-reset`);
}
export async function getGroups(params?: {
  teacherId?: string;
}): Promise<Group[]> {
  return (await apiClient.get<Group[]>("/groups", { params })).data;
}
export async function getGroup(id: string): Promise<Group> {
  return (await apiClient.get<Group>(`/groups/${id}`)).data;
}
export async function addStudentsToGroup(
  id: string,
  studentIds: string[],
): Promise<Group> {
  return (
    await apiClient.post<Group>(`/groups/${id}/students`, {
      studentIds: [...new Set(studentIds)],
    })
  ).data;
}
export async function removeStudentFromGroup(
  groupId: string,
  studentId: string,
): Promise<Group> {
  return (
    await apiClient.delete<Group>(`/groups/${groupId}/students/${studentId}`)
  ).data;
}
export interface LessonFilters {
  start?: string;
  end?: string;
  teacherId?: string;
  studentId?: string;
  groupId?: string;
}
export async function getAdminLessons(
  params?: LessonFilters,
): Promise<Lesson[]> {
  return (await apiClient.get<Lesson[]>("/lessons", { params })).data;
}
