import { Group } from "@/types/group";

import { apiClient } from "./client";

export async function fetchMyGroups(params?: {
  teacherId?: string;
}): Promise<Group[]> {
  const response = await apiClient.get<Group[]>("/groups/my-groups", {
    params,
  });
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

export async function deleteGroup(groupId: string): Promise<void> {
  await apiClient.delete(`/groups/${groupId}`);
}
