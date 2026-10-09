import { AuthUser } from "./user";

export interface Group {
  _id: string;
  name?: string;
  studentCount?: number;
  students: AuthUser[];
  teacher?: string | AuthUser | null;
}
