"use client";

import { useCallback, useEffect, useState } from "react";
import { ReservationStatusBadge } from "@/components/ReservationStatusBadge";
import { fetchMemberWeekSchedules } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Reservation } from "@/lib/types";
import { formatReservationTime, formatScheduleDay } from "@/lib/utils";

export function MemberScheduleSection() {
  const [grouped, setGrouped] = useState<
    { date: string; items: Reservation[] }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const data = await fetchMemberWeekSchedules(supabase);
      setGrouped(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-muted">불러오는 중...</div>;
  }

  return (
    <>
      <section className="mb-6">
        <h1 className="text-2xl font-bold">내 예약</h1>
        <p className="mt-1 text-sm text-muted">앞으로 30일간 예정된 수업</p>
      </section>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-10 text-center text-sm text-muted">
          예약된 수업이 없습니다.
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
                  <li
                    key={reservation.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-surface-elevated px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">PT 수업</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {formatReservationTime(reservation.time)}
                      </p>
                    </div>
                    <ReservationStatusBadge status={reservation.status} />
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
