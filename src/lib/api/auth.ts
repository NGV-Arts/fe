import { LoginResponse } from "@/types/auth";

import { apiClient } from "./client";

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  return response.data;
}
