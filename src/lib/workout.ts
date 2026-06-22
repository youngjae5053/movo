export const BODY_PART_OPTIONS = [
  "상체",
  "하체",
  "전신",
  "유산소",
  "코어",
  "스트레칭",
] as const;

export const DURATION_OPTIONS = [30, 45, 60, 75, 90] as const;

export const MOOD_OPTIONS = [
  { value: "great", label: "최고", emoji: "🔥" },
  { value: "good", label: "좋음", emoji: "💪" },
  { value: "normal", label: "보통", emoji: "🙂" },
  { value: "tired", label: "피곤", emoji: "😮‍💨" },
] as const;

export type MoodValue = (typeof MOOD_OPTIONS)[number]["value"];

export function formatWorkoutTime(isoString?: string): string | null {
  if (!isoString) return null;

  const date = new Date(isoString);
  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function isMediaOnlyPlaceholder(content?: string): boolean {
  return content === "(사진/영상 첨부)";
}
