"use client";
import Link from "next/link";
import { useCallback } from "react";
import { getStudents, getTeachers, getGroups } from "@/lib/api/admin";
import { fetchMyFutureLessons } from "@/lib/api/lessons";
import { useResource } from "@/lib/hooks/use-management";
import {
  cardClass,
  Feedback,
  outlineButton,
} from "@/components/portal/ManagementUI";
export default function AdminPortalPage() {
  const resource = useResource(
    useCallback(async () => {
      const [students, teachers, groups, lessons] = await Promise.all([
        getStudents({ limit: 1 }),
        getTeachers({ limit: 1 }),
        getGroups(),
        fetchMyFutureLessons(),
      ]);
      return {
        students: students.total,
        teachers: teachers.total,
        groups: groups.length,
        lessons: lessons.length,
        today: lessons.filter(
          (l) =>
            new Date(l.startTime).toDateString() === new Date().toDateString(),
        ).length,
      };
    }, []),
  );
  const cards = [
    ["Total Students", resource.data?.students, "students"],
    ["Total Teachers", resource.data?.teachers, "teachers"],
    ["Total Groups", resource.data?.groups, "groups"],
    ["Upcoming Lessons", resource.data?.lessons, "calendar"],
  ] as const;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-sm text-gray-700">
          An overview of your students, teachers and classes.
        </p>
      </div>
      <Feedback error={resource.error} />
      {resource.error && (
        <button
          className={outlineButton}
          onClick={() => void resource.reload()}
        >
          Retry
        </button>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([title, value, route]) => (
          <Link
            key={title}
            href={`/portal/admin/${route}`}
            className={`${cardClass} border-t-4 border-t-red-600 transition hover:border-red-600`}
          >
            <p className="text-sm font-medium text-gray-700">{title}</p>
            <p className="mt-3 text-3xl font-semibold text-gray-900">
              {resource.loading ? "…" : (value ?? "—")}
            </p>
          </Link>
        ))}
      </div>
      <section className={cardClass}>
        <h3 className="font-semibold text-gray-900">
          Today’s upcoming lessons
        </h3>
        <p className="mt-2 text-gray-700">
          {resource.loading
            ? "Loading…"
            : resource.data
              ? `${resource.data.today} lessons remaining today in your local timezone.`
              : "Overview unavailable."}
        </p>
        <Link
          className="mt-4 inline-block text-sm font-semibold text-red-700 underline"
          href="/portal/admin/calendar"
        >
          Open calendar
        </Link>
      </section>
    </div>
  );
}
