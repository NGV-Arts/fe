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
