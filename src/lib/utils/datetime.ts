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

  const savedStart = formatTimeInTimeZone(params.startIso, params.savedTimeZone);
  const savedEnd = formatTimeInTimeZone(params.endIso, params.savedTimeZone);

  return `${viewerStart} – ${viewerEnd} (${savedStart} – ${savedEnd} ${params.savedTimeZone})`;
}
