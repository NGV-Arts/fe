"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import Select from "react-select";
import { AuthUser } from "@/types/user";
import { getStudentFullName } from "@/lib/utils/group-display";

// These are the existing portal controls and card styles, shared by management forms.
export const primaryButton =
  "rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50";
export const redButton =
  "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50";
export const outlineButton =
  "rounded-md border border-gray-800 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50";
export const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-600 outline-none focus:border-black focus:ring-2 focus:ring-black/10";
export const cardClass =
  "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm";
export function Feedback({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  return (
    <>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {success}
        </p>
      )}
    </>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="text-sm font-medium text-gray-800">
      <label htmlFor={id} className="mb-1 block">
        {label}
      </label>
      {Children.map(children, (child) =>
        isValidElement<{ id?: string }>(child) &&
        ["input", "select", "textarea"].includes(String(child.type))
          ? cloneElement(child, { id })
          : child,
      )}
    </div>
  );
}
export function TeacherSelect({
  teachers,
  value,
  onChange,
  required = false,
  disabled = false,
}: {
  teachers: AuthUser[];
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  const options = teachers.map((t) => ({
    value: t._id,
    label: `${getStudentFullName(t)} (${t.email})`,
  }));
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-gray-800"
      >
        Primary teacher
      </label>
      <Select
        instanceId={id}
        inputId={id}
        options={options}
        value={options.find((o) => o.value === value) ?? null}
        onChange={(option) => onChange(option?.value ?? "")}
        isClearable={!required}
        required={required}
        isDisabled={disabled}
        placeholder={required ? "Search teachers…" : "All teachers"}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: 42,
            borderColor: "#9ca3af",
          }),
          option: (base, state) => ({
            ...base,
            color: state.isSelected ? "white" : "#111827",
            backgroundColor: state.isSelected
              ? "#111827"
              : state.isFocused
                ? "#fef2f2"
                : "white",
          }),
          placeholder: (base) => ({ ...base, color: "#4b5563" }),
          menu: (base) => ({ ...base, zIndex: 100 }),
        }}
      />
    </div>
  );
}
export function ModalFrame({
  title,
  children,
  onClose,
  busy = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
}) {
  const id = useId();
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => previous?.focus();
  }, []);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl"
        onKeyDown={(event) => {
          if (event.key === "Escape" && !busy) {
            event.stopPropagation();
            onClose();
          }
          if (event.key === "Tab") {
            const items = dialog.current?.querySelectorAll<HTMLElement>(
              'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
            );
            if (!items?.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id={id} className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className={redButton}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function TableFrame({
  headers,
  children,
  empty,
  loading,
}: {
  headers: string[];
  children: ReactNode;
  empty: boolean;
  loading: boolean;
}) {
  return (
    <div
      aria-busy={loading}
      className="max-h-[560px] overflow-auto rounded-xl border border-gray-200"
    >
      {loading ? (
        <p role="status" className="p-6 text-sm text-gray-700">
          Loading…
        </p>
      ) : empty ? (
        <p className="p-6 text-sm text-gray-700">No results found.</p>
      ) : (
        <table className="w-full min-w-[850px] text-left text-sm text-gray-800">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="whitespace-nowrap border-b border-gray-200 p-3 text-xs font-semibold uppercase tracking-wide text-gray-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 [&_td]:p-3">
            {children}
          </tbody>
        </table>
      )}
    </div>
  );
}
