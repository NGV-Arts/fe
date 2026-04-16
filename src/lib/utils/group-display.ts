import { Group } from "@/types/group";
import { AuthUser } from "@/types/user";

type GroupStudent = AuthUser | string | null | undefined;

function isAuthUser(student: GroupStudent): student is AuthUser {
  return Boolean(student && typeof student === "object");
}

function getFirstName(student: GroupStudent) {
  if (!isAuthUser(student)) {
    return "Student";
  }

  return student.firstName?.trim() || student.email || "Student";
}

export function getGroupDisplayName(
  group?:
    | Group
    | {
        name?: string;
        students?: GroupStudent[];
      }
    | null,
): string {
  if (!group) return "Group";

  const trimmedName = group.name?.trim();
  if (trimmedName) return trimmedName;

  const names = (group.students ?? []).map(getFirstName).filter(Boolean);
  return names.length > 0 ? names.join(", ") : "Group";
}

export function getStudentFullName(student?: AuthUser | null): string {
  if (!student) return "Student";

  const first = student.firstName ?? "";
  const last = student.lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || student.email || "Student";
}

export function getGroupStudentFirstNames(group?: Group | null): string {
  if (!group) return "Group class";

  const hasName = !!group.name?.trim();
  if (!hasName) return "Group class";

  const names = (group.students ?? [])
    .map((student) => student.firstName?.trim() || student.email || "Student")
    .filter(Boolean);

  return names.length > 0 ? names.join(", ") : "Group class";
}
