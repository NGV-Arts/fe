"use client";

import { useEffect, useState } from "react";
import TimezoneSelect, { type ITimezone } from "react-timezone-select";

import { getBrowserTimeZone } from "@/lib/utils/datetime";
import { Lesson } from "@/types/lesson";

type Props = {
  open: boolean;
  lesson: Lesson | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    date: string;
    time: string;
    timezone: string;
    durationMinutes: number;
  }) => void;
};

function getInitialDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function getInitialTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(11, 16);
}

function getInitialDurationMinutes(lesson?: Lesson | null) {
  if (!lesson) return 60;
  const start = new Date(lesson.startTime).getTime();
  const end = new Date(lesson.endTime).getTime();
  return Math.max(1, Math.round((end - start) / 60000));
}

function getTimeZoneValue(timezone: ITimezone): string {
  return typeof timezone === "string" ? timezone : timezone.value;
}

export default function RescheduleSingleModal({
  open,
  lesson,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timezone, setTimezone] = useState<ITimezone>({
    value: getBrowserTimeZone(),
    label: getBrowserTimeZone(),
  });

  useEffect(() => {
    if (lesson) {
      setDate(getInitialDate(lesson.startTime));
      setTime(getInitialTime(lesson.startTime));
      setDurationMinutes(getInitialDurationMinutes(lesson));
      const nextTimeZone = lesson.timezone || getBrowserTimeZone();
      setTimezone({
        value: nextTimeZone,
        label: nextTimeZone,
      });
    }
  }, [lesson]);

  if (!open || !lesson) return null;

  const timezoneValue = getTimeZoneValue(timezone);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Reschedule class</h2>
        <p className="mt-2 text-sm text-gray-600">
          Choose the new date, time, timezone, and duration for this class.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Timezone
            </label>
            <TimezoneSelect
              value={timezone}
              onChange={(value) => setTimezone(value)}
              className="text-sm"
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: 42,
                  borderColor: state.isFocused ? "#111827" : "#d1d5db",
                  boxShadow: state.isFocused
                    ? "0 0 0 2px rgba(17, 24, 39, 0.1)"
                    : "none",
                  "&:hover": {
                    borderColor: "#111827",
                  },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 90,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? "#111827"
                    : state.isFocused
                      ? "#f3f4f6"
                      : "#ffffff",
                  color: state.isSelected ? "#ffffff" : "#111827",
                }),
              }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(Number(event.target.value) || 0)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
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
            disabled={
              loading || !date || !time || !timezoneValue || durationMinutes < 1
            }
            onClick={() =>
              onSubmit({
                date,
                time,
                timezone: timezoneValue,
                durationMinutes,
              })
            }
            className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
