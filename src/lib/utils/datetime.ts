export function getBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function formatLessonDateTime(iso: string, timeZone: string): string {
  const date = new Date(iso);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatLessonTimeOnly(iso: string, timeZone: string): string {
  const date = new Date(iso);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatTimeInTimeZone(iso: string, timeZone: string): string {
  const date = new Date(iso);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatViewerAndSavedTimeRange(params: {
  startIso: string;
  endIso: string;
  savedTimeZone?: string | null;
  viewerTimeZone: string;
}): string {
  const viewerStart = formatTimeInTimeZone(
    params.startIso,
    params.viewerTimeZone,
  );
  const viewerEnd = formatTimeInTimeZone(params.endIso, params.viewerTimeZone);

  if (!params.savedTimeZone) {
    return `${viewerStart} – ${viewerEnd}`;
  }

  const savedStart = formatTimeInTimeZone(
    params.startIso,
    params.savedTimeZone,
  );
  const savedEnd = formatTimeInTimeZone(params.endIso, params.savedTimeZone);

  return `${viewerStart} – ${viewerEnd} (${savedStart} – ${savedEnd} ${params.savedTimeZone})`;
}

export function getLessonFormDateTime(
  iso: string | undefined,
  timeZone: string,
) {
  if (!iso) return { date: "", time: "" };
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}
