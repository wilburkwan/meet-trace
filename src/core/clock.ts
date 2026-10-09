const pad = (value: number): string => String(value).padStart(2, "0");

/**
 * 24-hour clock, e.g. "00:38:33": the same in every language and shorter than
 * "上午12:38:33" / "12:38:33 AM", which keeps exports and AI prompts lean.
 */
export const formatClock24 = (timestamp: number, withSeconds = true): string => {
  const date = new Date(timestamp);
  const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return withSeconds ? `${clock}:${pad(date.getSeconds())}` : clock;
};
