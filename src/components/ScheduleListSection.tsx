"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useScheduleRealtime } from "@/hooks/useScheduleRealtime";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { BookSessionModal } from "@/components/BookSessionModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ReservationStatusBadge } from "@/components/ReservationStatusBadge";
import {
  attendSchedule,
  cancelSchedule,
  confirmSchedule,
  fetchWeekSchedules,
  updateSchedule,
} from "@/lib/api/client";
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
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<Reservation | null>(null);

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

  useScheduleRealtime(loadSchedules);

  async function handleConfirm(scheduleId: string) {
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      await confirmSchedule(supabase, scheduleId);
      await loadSchedules();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "예약 확인에 실패했습니다.",
      );
    }
  }

  async function handleCancelConfirm() {
    if (!cancellingId) return;

    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      await cancelSchedule(supabase, cancellingId);
      await loadSchedules();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "예약 취소에 실패했습니다.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  async function handleAttend(scheduleId: string) {
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      await attendSchedule(supabase, scheduleId);
      await loadSchedules();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "출석 처리에 실패했습니다.",
      );
    }
  }

  async function handleReschedule(data: { date: string; time: string }) {
    if (!rescheduling) return;

    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      await updateSchedule(supabase, rescheduling.id, data);
      await loadSchedules();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "일정 변경에 실패했습니다.",
      );
      throw error;
    }
  }

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
        <div className="rounded-2xl bg-[#111318] px-4 py-10 text-center ring-1 ring-white/[0.06]">
          <p className="text-sm text-zinc-600">예약된 수업이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ date, items }) => (
            <section key={date}>
              <h2 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-500/80">
                <span className="h-px flex-1 bg-emerald-500/15" />
                {formatScheduleDay(date)}
                <span className="h-px flex-1 bg-emerald-500/15" />
              </h2>
              <ul className="space-y-2">
                {items.map((reservation) => (
                  <li key={reservation.id}>
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#111318] px-4 py-3.5 ring-1 ring-white/[0.06]">
                      <Link
                        href={`/members/${reservation.memberId}`}
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-bold text-emerald-400">
                          {reservation.memberName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-100">{reservation.memberName}</p>
                          <p className="mt-0.5 text-xs text-zinc-600">
                            {formatReservationTime(reservation.time)}
                          </p>
                        </div>
                      </Link>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <ReservationStatusBadge status={reservation.status} />
                        {reservation.status === "pending" ? (
                          <button
                            type="button"
                            onClick={() => handleConfirm(reservation.id)}
                            className="rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/25 hover:bg-emerald-500/25 transition-colors"
                          >
                            확인
                          </button>
                        ) : null}
                        {reservation.status === "confirmed" ? (
                          reservation.attendedAt ? (
                            <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400">
                              출석 ✓
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAttend(reservation.id)}
                              className="rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/25 hover:bg-emerald-500/25 transition-colors"
                            >
                              출석
                            </button>
                          )
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setRescheduling(reservation)}
                          className="rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-xs text-zinc-500 ring-1 ring-white/[0.07] hover:text-zinc-300 transition-colors"
                        >
                          변경
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancellingId(reservation.id)}
                          className="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/20 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={cancellingId !== null}
        title="예약을 취소할까요?"
        description="취소된 예약은 목록에서 제거됩니다."
        confirmLabel="취소하기"
        onConfirm={handleCancelConfirm}
        onClose={() => setCancellingId(null)}
      />

      <BookSessionModal
        isOpen={rescheduling !== null}
        memberName={rescheduling?.memberName ?? ""}
        title="일정 변경"
        submitLabel="변경하기"
        initialDate={rescheduling?.date}
        initialTime={rescheduling?.time}
        onClose={() => setRescheduling(null)}
        onBook={handleReschedule}
      />
    </>
  );
}
