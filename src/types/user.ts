export type UserRole = "admin" | "teacher" | "student";

export interface AuthUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}
