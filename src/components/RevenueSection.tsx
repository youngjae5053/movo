"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchMonthlyRevenue, type MonthlyRevenue } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";

function formatKRW(amount: number) {
  if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억원`;
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const rest = amount % 10000;
    return rest > 0 ? `${man}만 ${rest.toLocaleString()}원` : `${man}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

function formatMonth(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-");
  return `${y}년 ${Number(m)}월`;
}

function formatMonthShort(yyyyMm: string) {
  const [, m] = yyyyMm.split("-");
  return `${Number(m)}월`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function RevenueSection() {
  const [data, setData] = useState<MonthlyRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const [all] = await Promise.all([
        fetchMonthlyRevenue(supabase),
      ]);

      const now = new Date();
      const months: string[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }

      const map = new Map(all.map((r) => [r.month, r]));
      const recent = months.map((m) => map.get(m) ?? { month: m, revenue: 0, sessionCount: 0 });
      setData(recent);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "수입 데이터를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-surface-elevated" />
        ))}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center">
        <p className="text-sm text-red-400">{errorMessage}</p>
        <button
          type="button"
          onClick={load}
          className="mt-3 rounded-lg border border-border px-4 py-2 text-sm text-zinc-300 hover:text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonth = data.find((d) => d.month === currentMonth);
  const lastMonth = data.find((d) => {
    const [y, m] = currentMonth.split("-").map(Number);
    const prev = new Date(y, m - 2, 1);
    return d.month === `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
  });

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  const growth =
    lastMonth && lastMonth.revenue > 0
      ? Math.round(((thisMonth?.revenue ?? 0) - lastMonth.revenue) / lastMonth.revenue * 100)
      : null;

  const BAR_HEIGHT = 100;
  const BAR_WIDTH = 24;
  const GAP = 8;
  const CHART_WIDTH = data.length * (BAR_WIDTH + GAP) - GAP;

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface-elevated p-4">
          <p className="text-xs text-muted">이번달 수납액</p>
          <p className="mt-1.5 text-2xl font-bold text-emerald-400">
            {formatKRW(thisMonth?.revenue ?? 0)}
          </p>
          {growth !== null && (
            <p className={`mt-1 text-xs ${growth >= 0 ? "text-emerald-500" : "text-red-400"}`}>
              전월 대비 {growth >= 0 ? "+" : ""}{growth}%
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-surface-elevated p-4">
          <p className="text-xs text-muted">이번달 수업</p>
          <p className="mt-1.5 text-2xl font-bold">{thisMonth?.sessionCount ?? 0}회</p>
          <p className="mt-1 text-xs text-muted">전월 {lastMonth?.sessionCount ?? 0}회</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-elevated p-4">
          <p className="text-xs text-muted">연간 누적 수납액</p>
          <p className="mt-1.5 text-xl font-bold">{formatKRW(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-elevated p-4">
          <p className="text-xs text-muted">연간 누적 수업</p>
          <p className="mt-1.5 text-xl font-bold">{data.reduce((s, d) => s + d.sessionCount, 0)}회</p>
        </div>
      </div>

      {/* 월별 바 차트 */}
      <div className="rounded-2xl border border-border bg-surface-elevated p-5">
        <h2 className="mb-4 text-sm font-semibold">월별 수납액 (12개월)</h2>
        <div className="overflow-x-auto pb-2">
          <svg viewBox={`0 0 ${CHART_WIDTH} ${BAR_HEIGHT + 28}`} width={CHART_WIDTH} height={BAR_HEIGHT + 28} style={{ minWidth: "100%" }}>
            {data.map((d, i) => {
              const x = i * (BAR_WIDTH + GAP);
              const barH = d.revenue > 0 ? Math.max((d.revenue / maxRevenue) * BAR_HEIGHT, 4) : 2;
              const y = BAR_HEIGHT - barH;
              const isCurrent = d.month === currentMonth;
              return (
                <g key={d.month}>
                  <rect x={x} y={0} width={BAR_WIDTH} height={BAR_HEIGHT} rx={5} fill="rgba(255,255,255,0.03)" />
                  <rect x={x} y={y} width={BAR_WIDTH} height={barH} rx={5} fill={isCurrent ? "#10b981" : "rgba(16,185,129,0.35)"} />
                  <text x={x + BAR_WIDTH / 2} y={BAR_HEIGHT + 18} textAnchor="middle" fontSize={8} fill={isCurrent ? "#10b981" : "#52525b"} fontFamily="inherit">
                    {formatMonthShort(d.month)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 월별 테이블 */}
        <div className="mt-4 space-y-1">
          {[...data].reverse().filter(d => d.revenue > 0).slice(0, 6).map((d) => (
            <div key={d.month} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5">
              <span className={`text-sm ${d.month === currentMonth ? "text-emerald-400 font-medium" : "text-zinc-400"}`}>
                {formatMonthShort(d.month)}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted">{d.sessionCount}회</span>
                <span className="text-sm font-medium">{formatKRW(d.revenue)}</span>
              </div>
            </div>
          ))}
          {data.every(d => d.revenue === 0) && (
            <p className="py-4 text-center text-sm text-muted">아직 결제 기록이 없습니다.<br />PT 회차 패키지에 결제 금액을 입력해 보세요.</p>
          )}
        </div>
      </div>

      {/* 미수금 안내 */}
      <div className="rounded-2xl border border-zinc-700/50 bg-surface-elevated p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">결제 금액 입력 방법</p>
            <p className="mt-1 text-xs text-muted">회원 상세 → PT회차 탭 → 패키지 추가 시 결제 금액을 입력하면 이 페이지에 자동 반영됩니다.</p>
            <Link href="/members" className="mt-2 inline-block text-xs text-emerald-400 hover:underline">
              회원 목록으로 이동 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
