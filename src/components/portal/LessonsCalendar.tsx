"use client";

import { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";

import { Lesson } from "@/types/lesson";
import { AuthUser } from "@/types/user";

type ViewerRole = "student" | "teacher" | "admin";

type Props = {
  lessons: Lesson[];
  viewerRole: ViewerRole;
  onRangeChange: (range: { start: string; end: string }) => void;
  onEventClick: (lesson: Lesson) => void;
};

function getPersonName(
  user: AuthUser | string | null | undefined,
  fallback: string,
): string {
  if (user && typeof user === "object") {
    const first = user.firstName ?? "";
    const last = user.lastName ?? "";
    const full = `${first} ${last}`.trim();
    return full || user.email || fallback;
  }

  return fallback;
}

function getTeacherName(lesson: Lesson): string {
  return getPersonName(lesson.teacher, "Teacher");
}

function getStudentName(lesson: Lesson): string {
  return getPersonName(lesson.student, "Student");
}

function getGroupStudentNames(lesson: Lesson): string {
  if (!lesson.group || typeof lesson.group === "string") {
    return "Group";
  }

  const students = lesson.group.students ?? [];
  const names = students
    .map((student) => getPersonName(student, "Student"))
    .filter(Boolean);

  if (names.length === 0) {
    return lesson.group.name || "Group";
  }

  return names.join(", ");
}

function getEventTitle(lesson: Lesson, viewerRole: ViewerRole): string {
  if (viewerRole === "student") {
    return getTeacherName(lesson);
  }

  if (viewerRole === "teacher") {
    if (lesson.groupClass) {
      return getGroupStudentNames(lesson);
    }

    return getStudentName(lesson);
  }

  if (lesson.groupClass) {
    return `${getTeacherName(lesson)} · ${getGroupStudentNames(lesson)}`;
  }

  return `${getTeacherName(lesson)} · ${getStudentName(lesson)}`;
}

export default function LessonsCalendar({
  lessons,
  viewerRole,
  onRangeChange,
  onEventClick,
}: Props) {
  const events = lessons.map((lesson) => ({
    id: lesson._id,
    title: getEventTitle(lesson, viewerRole),
    start: lesson.startTime,
    end: lesson.endTime,
    extendedProps: {
      lesson,
    },
  }));

  const handleDatesSet = (arg: DatesSetArg) => {
    onRangeChange({
      start: arg.start.toISOString(),
      end: arg.end.toISOString(),
    });
  };

  const handleEventClick = (arg: EventClickArg) => {
    const lesson = arg.event.extendedProps.lesson as Lesson;
    onEventClick(lesson);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridDay"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridDay,timeGridWeek,dayGridMonth",
        }}
        timeZone="local"
        nowIndicator
        height={720}
        contentHeight={650}
        expandRows={true}
        stickyHeaderDates={true}
        events={events}
        datesSet={handleDatesSet}
        eventClick={handleEventClick}
      />
    </div>
  );
}
