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

export async function updatePassword(payload: {
  oldPassword: string;
  newPassword: string;
}): Promise<{ success?: boolean; message?: string }> {
  const response = await apiClient.post<{
    success?: boolean;
    message?: string;
  }>("/auth/update", payload);

  return response.data;
}

export async function triggerForgotPasswordEmail(payload: {
  email: string;
}): Promise<{ message?: string; resetLink?: string }> {
  const response = await apiClient.post<{
    message?: string;
    resetLink?: string;
  }>("/auth/forgot", payload);

  return response.data;
}
