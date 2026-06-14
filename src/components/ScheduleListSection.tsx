"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { ReservationStatusBadge } from "@/components/ReservationStatusBadge";
import { fetchWeekSchedules } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Reservation } from "@/lib/types";
import { formatReservationTime, formatScheduleDay } from "@/lib/utils";

export function ScheduleListSection() {
  const [grouped, setGrouped] = useState<
    { date: string; items: Reservation[] }[]
  >([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSchedules = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const groups = await fetchWeekSchedules(supabase);
      setGrouped(groups);
      setTotalCount(groups.reduce((sum, group) => sum + group.items.length, 0));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "예약 목록을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-muted">불러오는 중...</div>
    );
  }

  return (
    <>
      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      <section className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">예약 목록</h1>
        <p className="mt-2 text-sm text-muted">
          오늘부터 7일간 예정된 수업 {totalCount}건
        </p>
      </section>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-10 text-center">
          <p className="text-sm text-muted">예약된 수업이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ date, items }) => (
            <section key={date}>
              <h2 className="mb-3 text-sm font-medium text-emerald-400">
                {formatScheduleDay(date)}
              </h2>
              <ul className="space-y-2">
                {items.map((reservation) => (
                  <li key={reservation.id}>
                    <Link
                      href={`/members/${reservation.memberId}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-3 transition-colors hover:border-emerald-500/30"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{reservation.memberName}</p>
                        <p className="mt-0.5 text-sm text-muted">
                          {formatReservationTime(reservation.time)}
                        </p>
                      </div>
                      <ReservationStatusBadge status={reservation.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
