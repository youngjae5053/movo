export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

export function getInitials(name: string): string {
  return name.slice(0, 1);
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatChatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatChatListTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const today = getTodayDateString();
  const messageDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  if (messageDate === today) {
    return formatChatTime(isoString);
  }

  const yesterday = addDaysToDateString(today, -1);
  if (messageDate === yesterday) {
    return "어제";
  }

  return date.toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
}

export function formatWorkoutDateParts(dateString: string): {
  day: number;
  monthYear: string;
  weekday: string;
} {
  const date = new Date(`${dateString}T00:00:00`);

  return {
    day: date.getDate(),
    monthYear: date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
    }),
    weekday: date.toLocaleDateString("ko-KR", { weekday: "long" }),
  };
}

export function getWorkoutRecordText(record: {
  content?: string;
  title?: string;
  exercises?: string[];
  note?: string;
}): string {
  if (record.content) {
    return record.content;
  }

  const lines = [
    record.title,
    ...(record.exercises ?? []),
    record.note,
  ].filter(Boolean);

  return lines.join("\n");
}

export function getDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function addDaysToDateString(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatScheduleDay(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  const label = date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  if (dateString === getTodayDateString()) {
    return `${label} · 오늘`;
  }

  return label;
}

export function formatReservationTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatReservationChatMessage(date: string, time: string): string {
  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });

  return `📅 ${dateLabel} ${formatReservationTime(time)} 수업이 예약되었습니다.`;
}

import type { Reservation } from "./types";

export function groupReservationsByDate(
  reservations: Reservation[],
): { date: string; items: Reservation[] }[] {
  const grouped = new Map<string, import("./types").Reservation[]>();

  for (const reservation of reservations) {
    const items = grouped.get(reservation.date) ?? [];
    items.push(reservation);
    grouped.set(reservation.date, items);
  }

  return Array.from(grouped.entries()).map(([date, items]) => ({
    date,
    items,
  }));
}
