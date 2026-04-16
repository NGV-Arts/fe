"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import PortalGuard from "@/components/auth/PortalGuard";
import AddGroupModal from "@/components/portal/AddGroupModal";
import EditGroupModal from "@/components/portal/EditGroupModal";
import EditStudentModal from "@/components/portal/EditStudentModal";
import PortalShell from "@/components/portal/PortalShell";
import { triggerForgotPasswordEmail } from "@/lib/api/auth";
import {
  createGroup,
  deleteGroup,
  fetchMyGroups,
  updateGroup,
} from "@/lib/api/groups";
import {
  deleteStudent,
  fetchMyStudents,
  updateStudentClass,
  updateStudentProfile,
} from "@/lib/api/users";
import { getUser } from "@/lib/auth/session";
import { getGroupDisplayName } from "@/lib/utils/group-display";
import { Group } from "@/types/group";
import { AuthUser } from "@/types/user";

type StudentsTab = "students" | "groups";

function getStudentName(student: AuthUser) {
  const first = student.firstName ?? "";
  const last = student.lastName ?? "";
  const full = `${first} ${last}`.trim();
  return full || student.email;
}

function getGroupStudentList(group: Group) {
  return (group.students ?? []).map(getStudentName).join(", ") || "No students";
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    const rawMessage = data?.message;

    if (Array.isArray(rawMessage)) {
      return rawMessage.join(", ") || fallback;
    }

    return rawMessage || fallback;
  }

  return fallback;
}

export default function StudentsPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<StudentsTab>("students");

  const [students, setStudents] = useState<AuthUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [search, setSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [saveLoading, setSaveLoading] = useState(false);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);
  const [groupSaveLoading, setGroupSaveLoading] = useState(false);
  const [groupDeleteLoading, setGroupDeleteLoading] = useState(false);
  const [deleteStudentLoading, setDeleteStudentLoading] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<AuthUser | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [addGroupOpen, setAddGroupOpen] = useState(false);

  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoadingStudents(true);
        setError(null);

        const user = getUser();
        if (!user) {
          setStudents([]);
          return;
        }

        if (user.role === "teacher") {
          const data = await fetchMyStudents();
          setStudents(data);
          return;
        }

        if (user.role === "admin") {
          setStudents([]);
          return;
        }

        setStudents([]);
      } catch (error) {
        setError(getApiErrorMessage(error, "Failed to load students"));
      } finally {
        setLoadingStudents(false);
      }
    };

    void loadStudents();
  }, []);

  const loadGroups = async () => {
    try {
      setLoadingGroups(true);
      setError(null);

      const user = getUser();
      if (!user) {
        setGroups([]);
        return;
      }

      if (user.role === "teacher") {
        const data = await fetchMyGroups();
        setGroups(data);
        return;
      }

      if (user.role === "admin") {
        setGroups([]);
        return;
      }

      setGroups([]);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string } | undefined)?.message ||
          "Failed to load groups";
        setError(message);
      } else {
        setError("Failed to load groups");
      }
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    void loadGroups();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) => {
      const fullName = `${student.firstName ?? ""} ${
        student.lastName ?? ""
      }`
        .trim()
        .toLowerCase();
      const email = (student.email ?? "").toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [students, search]);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return groups;

    return groups.filter((group) => {
      const groupName = group.name?.trim().toLowerCase() ?? "";
      if (groupName.includes(query)) {
        return true;
      }

      return (group.students ?? []).some((student) => {
        const fullName = `${student.firstName ?? ""} ${
          student.lastName ?? ""
        }`
          .trim()
          .toLowerCase();
        const email = (student.email ?? "").toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    });
  }, [groups, search]);

  const handleSaveStudent = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    rate: number;
    currency: string;
    classCycle: number;
    classesToAdd: number;
  }) => {
    if (!selectedStudent) return;

    try {
      setSaveLoading(true);
      setError(null);
      setResetSuccess(null);
      setResetError(null);

      const currentLeft = selectedStudent.class?.left ?? 0;

      const updatedProfile = await updateStudentProfile(selectedStudent._id, {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
      });

      const updatedClass = await updateStudentClass(selectedStudent._id, {
        rate: payload.rate,
        currency: payload.currency,
        classCycle: payload.classCycle,
        left: currentLeft + payload.classesToAdd,
      });

      const mergedStudent: AuthUser = {
        ...updatedProfile,
        class: updatedClass.class,
        attended: updatedClass.attended,
      };

      setStudents((previous) =>
        previous.map((student) =>
          student._id === selectedStudent._id ? mergedStudent : student,
        ),
      );

      setGroups((previous) =>
        previous.map((group) => ({
          ...group,
          students: group.students.map((student) =>
            student._id === selectedStudent._id ? mergedStudent : student,
          ),
        })),
      );

      setSelectedStudent(null);
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to update student"));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSendReset = async (student: AuthUser) => {
    try {
      setResetLoading(true);
      setResetSuccess(null);
      setResetError(null);

      await triggerForgotPasswordEmail({
        email: student.email,
      });

      setResetSuccess(`Password reset email sent to ${student.email}.`);
    } catch (error) {
      setResetError(
        getApiErrorMessage(error, "Failed to send password reset email"),
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteStudent = async (student: AuthUser) => {
    try {
      setDeleteStudentLoading(true);
      setError(null);

      await deleteStudent(student._id);

      setStudents((prev) => prev.filter((item) => item._id !== student._id));
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          students: group.students.filter((item) => item._id !== student._id),
        })),
      );
      setSelectedStudent(null);
      setResetSuccess(null);
      setResetError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as
          | { message?: string | string[] }
          | undefined;
        const rawMessage = data?.message;
        const message = Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : rawMessage || "Failed to delete student";

        setError(message);
      } else {
        setError("Failed to delete student");
      }
    } finally {
      setDeleteStudentLoading(false);
    }
  };

  const handleSaveGroup = async (payload: {
    name: string;
    studentIds: string[];
  }) => {
    if (!selectedGroup) return;

    try {
      setGroupSaveLoading(true);
      setError(null);

      await updateGroup(selectedGroup._id, {
        name: payload.name,
        students: payload.studentIds,
      });

      setSelectedGroup(null);
      await loadGroups();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as
          | { message?: string | string[] }
          | undefined;
        const rawMessage = data?.message;
        const message = Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : rawMessage || "Failed to update group";

        setError(message);
      } else {
        setError("Failed to update group");
      }
    } finally {
      setGroupSaveLoading(false);
    }
  };

  const handleCreateGroup = async (payload: {
    name?: string;
    studentIds: string[];
  }) => {
    try {
      setCreateGroupLoading(true);
      setError(null);

      await createGroup({
        name: payload.name,
        students: payload.studentIds,
      });

      setAddGroupOpen(false);
      await loadGroups();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as
          | { message?: string | string[] }
          | undefined;
        const rawMessage = data?.message;
        const message = Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : rawMessage || "Failed to create group";

        setError(message);
      } else {
        setError("Failed to create group");
      }
    } finally {
      setCreateGroupLoading(false);
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    try {
      setGroupDeleteLoading(true);
      setError(null);

      await deleteGroup(group._id);

      setSelectedGroup(null);
      await loadGroups();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as
          | { message?: string | string[] }
          | undefined;
        const rawMessage = data?.message;
        const message = Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : rawMessage || "Failed to delete group";

        setError(message);
      } else {
        setError("Failed to delete group");
      }
    } finally {
      setGroupDeleteLoading(false);
    }
  };

  const isTeacher = currentUser?.role === "teacher";
  const isAdmin = currentUser?.role === "admin";

  return (
    <PortalGuard allowedRoles={["teacher", "admin"]}>
      <PortalShell title="Students">
        <div className="space-y-6">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "students"
                    ? "border-b-2 border-black text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Students
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("groups")}
                className={`px-4 py-2 text-sm font-medium transition ${
                  activeTab === "groups"
                    ? "border-b-2 border-black text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Groups
              </button>
            </div>

            {isAdmin ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeTab === "students" ? "Students" : "Groups"}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Teacher selection not yet implemented.
                </p>
              </div>
            ) : null}

            {isTeacher ? (
              <>
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {activeTab === "students" ? "My students" : "My groups"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {activeTab === "students"
                        ? "Search and manage your assigned students."
                        : "Search groups by student name or email."}
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                    {activeTab === "students" ? (
                      <Link
                        href="/portal/students/new"
                        className="rounded-md bg-black px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90"
                      >
                        Add student
                      </Link>
                    ) : isTeacher ? (
                      <button
                        type="button"
                        onClick={() => setAddGroupOpen(true)}
                        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                      >
                        Add group
                      </button>
                    ) : null}

                    <div className="w-full md:w-72">
                      <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={
                          activeTab === "students"
                            ? "Search students..."
                            : "Search by student..."
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                      />
                    </div>
                  </div>
                </div>

                {activeTab === "students" ? (
                  <div className="max-h-[520px] overflow-y-auto rounded-xl border border-gray-200">
                    {loadingStudents ? (
                      <div className="p-4 text-sm text-gray-500">
                        Loading students...
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">
                        No students found.
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredStudents.map((student) => (
                          <div
                            key={student._id}
                            className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900">
                                {getStudentName(student)}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {student.email}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                <span>
                                  Rate: {student.class?.currency ?? "USD"}{" "}
                                  {student.class?.rate ?? 0}
                                </span>
                                <span>
                                  Lifetime attended: {student.attended ?? 0}
                                </span>
                                <span>
                                  Class cycle: {student.class?.classCycle ?? 0}
                                </span>
                                <span>
                                  Classes left: {student.class?.left ?? 0}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setResetSuccess(null);
                                  setResetError(null);
                                  setSelectedStudent(student);
                                }}
                                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-h-[520px] overflow-y-auto rounded-xl border border-gray-200">
                    {loadingGroups ? (
                      <div className="flex items-center gap-3 p-4 text-sm text-gray-600">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
                        <span>Loading groups...</span>
                      </div>
                    ) : filteredGroups.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">
                        No groups found.
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredGroups.map((group) => (
                          <div
                            key={group._id}
                            className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900">
                                {getGroupDisplayName(group)}
                              </p>
                              <p className="mt-2 text-sm text-gray-600">
                                Students: {getGroupStudentList(group)}
                              </p>
                            </div>

                            <div className="shrink-0">
                              <button
                                type="button"
                                onClick={() => setSelectedGroup(group)}
                                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        <EditStudentModal
          student={selectedStudent}
          open={!!selectedStudent}
          loading={saveLoading}
          resetLoading={resetLoading}
          resetSuccess={resetSuccess}
          resetError={resetError}
          deleteLoading={deleteStudentLoading}
          onClose={() => {
            setSelectedStudent(null);
            setResetSuccess(null);
            setResetError(null);
          }}
          onSave={handleSaveStudent}
          onSendReset={handleSendReset}
          onDelete={handleDeleteStudent}
        />

        <EditGroupModal
          group={selectedGroup}
          allStudents={students}
          open={!!selectedGroup}
          loading={groupSaveLoading}
          deleteLoading={groupDeleteLoading}
          onClose={() => setSelectedGroup(null)}
          onSave={handleSaveGroup}
          onDelete={handleDeleteGroup}
        />

        <AddGroupModal
          open={addGroupOpen}
          allStudents={students}
          loading={createGroupLoading}
          onClose={() => setAddGroupOpen(false)}
          onCreate={handleCreateGroup}
        />
      </PortalShell>
    </PortalGuard>
  );
}
