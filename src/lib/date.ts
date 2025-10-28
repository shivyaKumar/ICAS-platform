export function formatAppDate(value?: string | Date | null): string {
  if (!value) return "";

  // Ensure backend times are treated as UTC
  const utcValue =
    typeof value === "string" && !value.endsWith("Z")
      ? value + "Z"
      : value;

  const date = value instanceof Date ? value : new Date(utcValue);
  const formatter = new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Fiji",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return Number.isFinite(date.getTime()) ? formatter.format(date) : "";
}
