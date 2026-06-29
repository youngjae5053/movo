"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ensureTrainerProfile, fetchMembers } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Member } from "@/lib/types";

type TodayScheduleItem = {
  id: string;
  scheduleTime: string;
  status: string;
  memberName: string;
};

type DashboardData = {
  trainerName: string;
  totalMembers: number;
  activeMembers: number;
  todayCount: number;
  todaySchedules: TodayScheduleItem[];
};

function formatKoreanDate(date: Date): string {
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = days[date.getDay()];
  return `${year}년 ${month}월 ${day}일 ${dayOfWeek}`;
}

function formatTime(timeStr: string): string {
  // timeStr is like "09:00:00" or "09:00"
  const parts = timeStr.split(":");
  const hour = parseInt(parts[0], 10);
  const minute = parts[1] ?? "00";
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period} ${displayHour}:${minute}`;
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface-elevated px-4 py-4">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-2xl font-bold text-zinc-100">{value}</span>
      <span className="text-xs text-zinc-400">{unit}</span>
    </div>
  );
}

export function TrainerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();

      const [trainer, members] = await Promise.all([
        ensureTrainerProfile(supabase),
        fetchMembers(supabase),
      ]);

      const today = new Date().toISOString().split("T")[0];

      const { data: todayRows } = await supabase
        .from("schedules")
        .select("id, schedule_time, status, members(name)")
        .eq("schedule_date", today)
        .is("deleted_at", null)
        .is("cancelled_at", null)
        .order("schedule_time", { ascending: true });

      const todaySchedules: TodayScheduleItem[] = (todayRows ?? []).map(
        (row) => ({
          id: row.id as string,
          scheduleTime: row.schedule_time as string,
          status: row.status as string,
          memberName:
            (row.members as { name: string } | null)?.name ?? "회원",
        }),
      );

      const activeMembers = (members as Member[]).filter(
        (m) => m.status === "active",
      ).length;

      setData({
        trainerName: trainer.name,
        totalMembers: members.length,
        activeMembers,
        todayCount: todaySchedules.length,
        todaySchedules,
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "대시보드를 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-zinc-400">불러오는 중...</p>
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
        <p className="text-center text-zinc-400">
          {errorMessage ?? "알 수 없는 오류가 발생했습니다."}
        </p>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const today = new Date();

  return (
    <div className="flex flex-col gap-6">
      {/* 인사 섹션 */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-zinc-100">
          안녕하세요, {data.trainerName} 트레이너 👋
        </h1>
        <p className="text-sm text-zinc-400">{formatKoreanDate(today)}</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="전체 회원" value={data.totalMembers} unit="명" />
        <StatCard label="활성 회원" value={data.activeMembers} unit="명" />
        <StatCard label="오늘 수업" value={data.todayCount} unit="건" />
      </div>

      {/* 오늘 예약 섹션 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-100">오늘 예약</h2>
          <Link
            href="/schedule"
            className="text-sm font-medium text-emerald-400"
          >
            예약 관리 →
          </Link>
        </div>

        {data.todaySchedules.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-6 text-center">
            <p className="text-sm text-zinc-500">오늘 예정된 수업이 없습니다</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.todaySchedules.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface-elevated px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-zinc-100">
                    {item.memberName}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {formatTime(item.scheduleTime)}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    item.status === "confirmed"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-zinc-700/60 text-zinc-400"
                  }`}
                >
                  {item.status === "confirmed" ? "확정" : "대기"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 빠른 실행 섹션 */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-zinc-100">빠른 실행</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/members"
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface-elevated px-4 py-4 transition-colors active:bg-zinc-800"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-400"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            <span className="text-center text-xs font-medium text-zinc-300">
              새 회원 추가
            </span>
          </Link>

          <Link
            href="/revenue"
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface-elevated px-4 py-4 transition-colors active:bg-zinc-800"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-400"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="text-center text-xs font-medium text-zinc-300">
              수입 현황
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
