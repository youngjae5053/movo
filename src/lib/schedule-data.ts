import type { Reservation } from "./types";
import { addDaysToDateString, getTodayDateString } from "./utils";

export function getInitialReservations(): Reservation[] {
  const today = getTodayDateString();

  return [
    {
      id: "seed-1",
      memberId: "1",
      memberName: "이서연",
      date: today,
      time: "10:00",
      status: "confirmed",
    },
    {
      id: "seed-2",
      memberId: "2",
      memberName: "박지호",
      date: today,
      time: "14:00",
      status: "confirmed",
    },
    {
      id: "seed-3",
      memberId: "4",
      memberName: "정현우",
      date: today,
      time: "17:00",
      status: "pending",
    },
    {
      id: "seed-4",
      memberId: "2",
      memberName: "박지호",
      date: addDaysToDateString(today, 1),
      time: "09:00",
      status: "confirmed",
    },
    {
      id: "seed-5",
      memberId: "1",
      memberName: "이서연",
      date: addDaysToDateString(today, 1),
      time: "11:00",
      status: "pending",
    },
    {
      id: "seed-6",
      memberId: "4",
      memberName: "정현우",
      date: addDaysToDateString(today, 2),
      time: "07:00",
      status: "confirmed",
    },
    {
      id: "seed-7",
      memberId: "3",
      memberName: "최유나",
      date: addDaysToDateString(today, 2),
      time: "19:00",
      status: "pending",
    },
    {
      id: "seed-8",
      memberId: "1",
      memberName: "이서연",
      date: addDaysToDateString(today, 3),
      time: "10:00",
      status: "confirmed",
    },
    {
      id: "seed-9",
      memberId: "2",
      memberName: "박지호",
      date: addDaysToDateString(today, 4),
      time: "15:00",
      status: "pending",
    },
    {
      id: "seed-10",
      memberId: "4",
      memberName: "정현우",
      date: addDaysToDateString(today, 5),
      time: "08:00",
      status: "confirmed",
    },
    {
      id: "seed-11",
      memberId: "3",
      memberName: "최유나",
      date: addDaysToDateString(today, 6),
      time: "13:00",
      status: "confirmed",
    },
  ];
}
