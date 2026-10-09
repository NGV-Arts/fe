export type UserRole = "admin" | "teacher" | "student";

export interface UserClassBalance {
  rate: number;
  currency: string;
  classCycle: number;
  left: number;
}

export interface AuthUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  class?: UserClassBalance;
  attended?: number;
  primaryTeacher?:
    string | Pick<AuthUser, "_id" | "firstName" | "lastName" | "email"> | null;
  studentCount?: number;
  groupCount?: number;
}
