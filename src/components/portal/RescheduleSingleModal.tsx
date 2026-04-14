"use client";

import { useEffect, useState } from "react";

import { Lesson } from "@/types/lesson";

type Props = {
  open: boolean;
  lesson: Lesson | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { date: string; time: string }) => void;
};

function getInitialDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function getInitialTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(11, 16);
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

  useEffect(() => {
    if (lesson) {
      setDate(getInitialDate(lesson.startTime));
      setTime(getInitialTime(lesson.startTime));
    }
  }, [lesson]);

  if (!open || !lesson) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Reschedule class</h2>
        <p className="mt-2 text-sm text-gray-600">
          Choose the new date and time for this class.
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
            disabled={loading || !date || !time}
            onClick={() => onSubmit({ date, time })}
            className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
