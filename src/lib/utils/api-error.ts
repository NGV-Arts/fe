import axios from "axios";
export function getApiErrorMessage(
  error: unknown,
  fallback = "Unable to complete this action.",
): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    return (Array.isArray(message) ? message.join(", ") : message) || fallback;
  }
  return fallback;
}
export function entityId(value?: string | { _id: string } | null): string {
  return typeof value === "string" ? value : (value?._id ?? "");
}
