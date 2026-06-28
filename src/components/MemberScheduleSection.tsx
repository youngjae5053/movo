"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { BookSessionModal } from "@/components/BookSessionModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ReservationStatusBadge } from "@/components/ReservationStatusBadge";
import {
  cancelMemberSchedule,
  fetchMemberWeekSchedules,
  requestMemberSchedule,
} from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Reservation } from "@/lib/types";
import { formatReservationTime, formatScheduleDay } from "@/lib/utils";

export function MemberScheduleSection() {
  const [grouped, setGrouped] = useState<
    { date: string; items: Reservation[] }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const data = await fetchMemberWeekSchedules(supabase);
      setGrouped(data);
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
    load();
  }, [load]);

  async function handleRequestBooking(data: { date: string; time: string }) {
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      await requestMemberSchedule(supabase, data.date, data.time);
      await load();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "예약 요청에 실패했습니다.";
      setErrorMessage(
        message.includes("Schedule conflict")
          ? "해당 시간에 이미 예약이 있습니다."
          : message,
      );
      throw error;
    }
  }

  async function handleCancelConfirm() {
    if (!cancellingId) return;

    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      await cancelMemberSchedule(supabase, cancellingId);
      await load();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "예약 취소에 실패했습니다.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-muted">불러오는 중...</div>;
  }

  return (
    <>
      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      <section className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">내 예약</h1>
            <p className="mt-1 text-sm text-muted">앞으로 30일간 예정된 수업</p>
          </div>
          <button
            type="button"
            onClick={() => setIsBookingOpen(true)}
            className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            예약 요청
          </button>
        </div>
      </section>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-10 text-center text-sm text-muted">
          예약된 수업이 없습니다. 예약 요청 버튼으로 트레이너에게 일정을 요청해 보세요.
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
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">PT 수업</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {formatReservationTime(reservation.time)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <ReservationStatusBadge status={reservation.status} />
                      <button
                        type="button"
                        onClick={() => setCancellingId(reservation.id)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-red-400 hover:border-red-500/30"
                      >
                        취소
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <BookSessionModal
        isOpen={isBookingOpen}
        memberName="나"
        title="예약 요청"
        submitLabel="요청하기"
        onClose={() => setIsBookingOpen(false)}
        onBook={handleRequestBooking}
      />

      <ConfirmModal
        isOpen={cancellingId !== null}
        title="예약을 취소할까요?"
        description="취소된 예약은 목록에서 제거됩니다."
        confirmLabel="취소하기"
        onConfirm={handleCancelConfirm}
        onClose={() => setCancellingId(null)}
      />
    </>
  );
}
