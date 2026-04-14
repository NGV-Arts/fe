"use client";

type Mode = "delete" | "reschedule";

type Props = {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onChooseSingle: () => void;
  onChooseSeries: () => void;
};

export default function LessonRecurringChoiceModal({
  open,
  mode,
  onClose,
  onChooseSingle,
  onChooseSeries,
}: Props) {
  if (!open) return null;

  const actionLabel = mode === "delete" ? "Delete" : "Reschedule";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">
          {actionLabel} recurring lesson
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Choose whether to {mode} only this class or all future classes in the
          series.
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onChooseSingle}
            className="w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            {actionLabel} this class
          </button>

          <button
            type="button"
            onClick={onChooseSeries}
            className="w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            {actionLabel} all future classes
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
