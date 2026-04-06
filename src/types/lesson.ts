import { AuthUser } from "./user";

export interface LessonGroup {
  _id: string;
  name?: string;
  students?: Array<string | AuthUser>;
}

export interface Lesson {
  _id: string;
  teacher: AuthUser | string | null;
  student: AuthUser | string | null;
  group: LessonGroup | string | null;
  groupClass: boolean;
  startTime: string;
  endTime: string;
  status: "scheduled" | "meeting_created" | "completed";
  teacherJoined?: boolean;
  joinedStudents?: string[];
  teamsMeetingId?: string | null;
  teamsJoinUrl?: string | null;
  recurrenceId?: string | null;
  meetingStatus?: "pending" | "created" | "failed";
}
