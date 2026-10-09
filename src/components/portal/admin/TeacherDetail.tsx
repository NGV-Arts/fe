"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { getTeacher } from "@/lib/api/admin";
import { useResource } from "@/lib/hooks/use-management";
import { getStudentFullName } from "@/lib/utils/group-display";
import StudentsManager from "./StudentsManager";
import GroupsManager from "./GroupsManager";
import {
  cardClass,
  Feedback,
  outlineButton,
  primaryButton,
} from "../ManagementUI";
export default function TeacherDetail({
  teacherId,
  initialTab,
}: {
  teacherId: string;
  initialTab: "students" | "groups";
}) {
  const resource = useResource(
    useCallback(() => getTeacher(teacherId), [teacherId]),
  );
  const [tab, setTab] = useState(initialTab);
  return (
    <div className="space-y-6">
      <section className={cardClass}>
        <Link
          className="text-sm font-medium text-red-700 underline"
          href="/portal/admin/teachers"
        >
          Back to teachers
        </Link>
        <Feedback error={resource.error} />
        {resource.loading ? (
          <p role="status" className="mt-4 text-gray-700">
            Loading teacher…
          </p>
        ) : (
          resource.data && (
            <>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {getStudentFullName(resource.data)}
              </h2>
              <p className="mt-1 text-gray-700">{resource.data.email}</p>
              <p className="mt-3 text-sm text-gray-800">
                Assigned students: {resource.data.studentCount} · Groups:{" "}
                {resource.data.groupCount}
              </p>
            </>
          )
        )}
        {resource.error && (
          <button
            className={outlineButton}
            onClick={() => void resource.reload()}
          >
            Retry
          </button>
        )}
        <div className="mt-5 flex gap-3">
          {(["students", "groups"] as const).map((value) => (
            <button
              key={value}
              aria-pressed={tab === value}
              className={tab === value ? primaryButton : outlineButton}
              onClick={() => setTab(value)}
            >
              {value === "students" ? "Students" : "Groups"}
            </button>
          ))}
        </div>
      </section>
      {resource.data &&
        (tab === "students" ? (
          <StudentsManager
            teacherId={teacherId}
            onChanged={() => void resource.reload()}
          />
        ) : (
          <GroupsManager
            teacherId={teacherId}
            onChanged={() => void resource.reload()}
          />
        ))}
    </div>
  );
}
