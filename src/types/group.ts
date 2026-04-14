import { AuthUser } from "./user";

export interface Group {
  _id: string;
  name?: string;
  students: AuthUser[];
  teacher?: string | AuthUser | null;
}
