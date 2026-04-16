import { apiClient } from "./client";
import { Group } from "@/types/group";

export async function fetchMyGroups(params?: {
  teacherId?: string;
}): Promise<Group[]> {
  const response = await apiClient.get<Group[]>("/groups/my-groups", {
    params,
  });
  return response.data;
}

export async function createGroup(payload: {
  name?: string;
  students: string[];
}): Promise<Group> {
  const response = await apiClient.post<Group>("/groups", payload);
  return response.data;
}

export async function updateGroup(
  groupId: string,
  payload: {
    name?: string;
    students?: string[];
  },
): Promise<Group> {
  const response = await apiClient.patch<Group>(`/groups/${groupId}`, payload);
  return response.data;
}

export async function deleteGroup(
  groupId: string,
): Promise<{ deletedGroup: boolean; deletedFutureLessons: number }> {
  const response = await apiClient.delete<{
    deletedGroup: boolean;
    deletedFutureLessons: number;
  }>(`/groups/${groupId}`);
  return response.data;
}
