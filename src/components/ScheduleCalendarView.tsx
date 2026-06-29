"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { ReservationStatusBadge } from "@/components/ReservationStatusBadge";
import { fetchMonthSchedules } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Reservation } from "@/lib/types";
import { formatReservationTime } from "@/lib/utils";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function getCalendarDays(year: number, month: number) {
  // month: 1-based
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const lastDate = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) cells.push(d);
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toDateString(year: number, month: number, day: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}

function getTodayString() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ScheduleCalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-based
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = getTodayString();

  const loadMonth = useCallback(
    async (y: number, m: number) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const supabase = createBrowserSupabaseClient();
        const data = await fetchMonthSchedules(supabase, y, m);
        setReservations(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "예약 목록을 불러오지 못했습니다.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadMonth(year, month);
    setSelectedDate(null);
  }, [year, month, loadMonth]);

  function prevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  // count map: date string -> count
  const countMap = new Map<string, number>();
  for (const r of reservations) {
    countMap.set(r.date, (countMap.get(r.date) ?? 0) + 1);
  }

  const cells = getCalendarDays(year, month);

  const selectedItems = selectedDate
    ? reservations.filter((r) => r.date === selectedDate)
    : [];

  return (
    <div>
      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400"
        >
          ‹
        </button>
        <h2 className="text-base font-semibold">
          {year}년 {month}월
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400"
        >
          ›
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted">불러오는 중...</div>
      ) : (
        <>
          {/* Day labels */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={`py-1 text-xs font-medium ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-zinc-500"}`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px rounded-2xl border border-border bg-border overflow-hidden">
            {cells.map((day, idx) => {
              if (day === null) {
                return (
                  <div key={`empty-${idx}`} className="bg-zinc-900 min-h-[52px]" />
                );
              }
              const dateStr = toDateString(year, month, day);
              const count = countMap.get(dateStr) ?? 0;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const colIndex = idx % 7;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() =>
                    setSelectedDate((prev) => (prev === dateStr ? null : dateStr))
                  }
                  className={[
                    "relative flex min-h-[52px] flex-col items-center pt-2 pb-1 transition-colors",
                    isSelected
                      ? "bg-emerald-500/20"
                      : "bg-zinc-900 hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {/* date number */}
                  <span
                    className={[
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      isToday
                        ? "border border-emerald-500 text-emerald-400"
                        : colIndex === 0
                          ? "text-red-400"
                          : colIndex === 6
                            ? "text-blue-400"
                            : "text-zinc-300",
                    ].join(" ")}
                  >
                    {day}
                  </span>

                  {/* reservation badge */}
                  {count > 0 ? (
                    <span className="mt-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-black">
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Selected day panel */}
          {selectedDate ? (
            <div className="mt-4 rounded-2xl border border-border bg-surface-elevated p-4">
              <h3 className="mb-3 text-sm font-medium text-emerald-400">
                {selectedDate.replace(/-/g, ".")} 예약
              </h3>
              {selectedItems.length === 0 ? (
                <p className="text-sm text-muted">예약이 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedItems.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-zinc-900 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{r.memberName}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {formatReservationTime(r.time)}
                        </p>
                      </div>
                      <ReservationStatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
