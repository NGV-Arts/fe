"use client";

import { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";

import {
  getGroupDisplayName,
  getStudentFullName,
} from "@/lib/utils/group-display";
import { Group } from "@/types/group";
import { Lesson } from "@/types/lesson";
import { AuthUser } from "@/types/user";

type ViewerRole = "student" | "teacher" | "admin";

type Props = {
  lessons: Lesson[];
  viewerRole: ViewerRole;
  onRangeChange: (range: { start: string; end: string }) => void;
  onEventClick: (lesson: Lesson) => void;
};

function getTeacherName(lesson: Lesson): string {
  if (lesson.teacher && typeof lesson.teacher === "object") {
    const first = lesson.teacher.firstName ?? "";
    const last = lesson.teacher.lastName ?? "";
    const full = `${first} ${last}`.trim();
    return full || lesson.teacher.email || "Teacher";
  }
  return "Teacher";
}

function getLessonGroup(lesson: Lesson): Group | null {
  if (lesson.group && typeof lesson.group === "object") {
    return lesson.group as Group;
  }
  return null;
}

function getLessonStudent(lesson: Lesson): AuthUser | null {
  if (lesson.student && typeof lesson.student === "object") {
    return lesson.student as AuthUser;
  }
  return null;
}

function getEventTitle(lesson: Lesson, viewerRole: ViewerRole): string {
  const group = getLessonGroup(lesson);
  const student = getLessonStudent(lesson);

  if (viewerRole === "student") {
    return getTeacherName(lesson);
  }

  if (viewerRole === "teacher") {
    if (lesson.groupClass) {
      return getGroupDisplayName(group);
    }
    return getStudentFullName(student);
  }

  if (lesson.groupClass) {
    return getGroupDisplayName(group);
  }

  return getStudentFullName(student);
}

export default function LessonsCalendar({
  lessons,
  viewerRole,
  onRangeChange,
  onEventClick,
}: Props) {
  const events = lessons.map((lesson) => ({
    id: lesson._id,
    title: `${getEventTitle(lesson, viewerRole)}${lesson.meetingStatus ? ` (${lesson.meetingStatus})` : ""}`,
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
