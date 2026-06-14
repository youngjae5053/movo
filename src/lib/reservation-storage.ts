import { appendReservationChatMessage } from "./chat-storage";
import { getInitialReservations } from "./schedule-data";
import type { Reservation } from "./types";
import { addDaysToDateString, getTodayDateString } from "./utils";

const STORAGE_KEY = "movo-reservations";
export const RESERVATIONS_UPDATED_EVENT = "movo-reservations-updated";

function readAddedReservations(): Reservation[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as Reservation[];
  } catch {
    return [];
  }
}

export function getAllReservations(): Reservation[] {
  const seed = getInitialReservations();
  const added = readAddedReservations();
  const existingIds = new Set(seed.map((reservation) => reservation.id));

  return [...seed, ...added.filter((reservation) => !existingIds.has(reservation.id))];
}

export function saveReservation(reservation: Reservation): void {
  const added = readAddedReservations();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...added, reservation]));
  appendReservationChatMessage(reservation);
  window.dispatchEvent(new Event(RESERVATIONS_UPDATED_EVENT));
}

export function getTodayReservations(): Reservation[] {
  const today = getTodayDateString();
  return getAllReservations()
    .filter((reservation) => reservation.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function getTodayReservationCount(): number {
  return getTodayReservations().length;
}

export function getWeekReservations(): Reservation[] {
  const today = getTodayDateString();
  const weekEnd = addDaysToDateString(today, 6);

  return getAllReservations()
    .filter(
      (reservation) =>
        reservation.date >= today && reservation.date <= weekEnd,
    )
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return a.time.localeCompare(b.time);
    });
}

export function groupReservationsByDate(
  reservations: Reservation[],
): { date: string; items: Reservation[] }[] {
  const grouped = new Map<string, Reservation[]>();

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
