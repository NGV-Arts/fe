"use client";

import { useEffect, useMemo, useState } from "react";

import { Lesson } from "@/types/lesson";

type DayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

type Props = {
  open: boolean;
  lesson: Lesson | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { day: DayOfWeek; time: string }) => void;
};

const DAY_OPTIONS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export default function RescheduleSeriesModal({
  open,
  lesson,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const initialDay = useMemo<DayOfWeek>(() => {
    if (!lesson) return "monday";
    return DAY_OPTIONS[new Date(lesson.startTime).getUTCDay()];
  }, [lesson]);

  const initialTime = useMemo(() => {
    if (!lesson) return "";
    return new Date(lesson.startTime).toISOString().slice(11, 16);
  }, [lesson]);

  const [day, setDay] = useState<DayOfWeek>("monday");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (lesson) {
      setDay(initialDay);
      setTime(initialTime);
    }
  }, [lesson, initialDay, initialTime]);

  if (!open || !lesson) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">
          Reschedule all future classes
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Choose the new weekday and time for all future classes in this
          series.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Day
            </label>
            <select
              value={day}
              onChange={(event) => setDay(event.target.value as DayOfWeek)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
            >
              {DAY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Time (GMT)
            </label>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || !day || !time}
            onClick={() => onSubmit({ day, time })}
            className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
