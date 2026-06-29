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
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111318] text-zinc-400 ring-1 ring-white/[0.06] transition-all hover:text-emerald-400 hover:ring-emerald-500/25 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h2 className="text-base font-bold tracking-tight">
          {year}년 {month}월
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111318] text-zinc-400 ring-1 ring-white/[0.06] transition-all hover:text-emerald-400 hover:ring-emerald-500/25 active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted">불러오는 중...</div>
      ) : (
        <>
          {/* Day labels */}
          <div className="mb-2 grid grid-cols-7 text-center">
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={`py-1 text-[11px] font-semibold tracking-wider ${i === 0 ? "text-red-500/70" : i === 6 ? "text-blue-400/70" : "text-zinc-600"}`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 rounded-2xl">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="min-h-[52px]" />;
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
                    "relative flex min-h-[52px] flex-col items-center rounded-xl pt-2 pb-1.5 transition-all active:scale-95",
                    isSelected
                      ? "bg-emerald-500/20 ring-1 ring-emerald-500/30"
                      : isToday
                        ? "bg-[#111318] ring-1 ring-white/[0.08]"
                        : "hover:bg-[#111318]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                      isToday
                        ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        : isSelected
                          ? "text-emerald-400"
                          : colIndex === 0
                            ? "text-red-400/80"
                            : colIndex === 6
                              ? "text-blue-400/80"
                              : "text-zinc-300",
                    ].join(" ")}
                  >
                    {day}
                  </span>

                  {count > 0 ? (
                    <span className="mt-1 flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  ) : (
                    <span className="mt-1 h-1.5 w-1.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day panel */}
          {selectedDate ? (
            <div className="mt-4 overflow-hidden rounded-2xl bg-[#111318] ring-1 ring-white/[0.07]">
              <div className="border-b border-white/[0.05] px-4 py-3">
                <h3 className="text-sm font-semibold text-emerald-400">
                  {(() => {
                    const [y, m, d] = selectedDate.split("-");
                    return `${Number(m)}월 ${Number(d)}일 예약`;
                  })()}
                </h3>
              </div>
              {selectedItems.length === 0 ? (
                <p className="px-4 py-5 text-sm text-zinc-600">예약이 없습니다.</p>
              ) : (
                <ul className="divide-y divide-white/[0.04]">
                  {selectedItems.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-400">
                          {r.memberName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{r.memberName}</p>
                          <p className="text-xs text-zinc-600">{formatReservationTime(r.time)}</p>
                        </div>
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
