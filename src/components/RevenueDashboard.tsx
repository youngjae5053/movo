"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMonthlyRevenue, type MonthlyRevenue } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";

function formatKRW(amount: number) {
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const rest = amount % 10000;
    return rest > 0 ? `${man}만 ${rest.toLocaleString()}원` : `${man}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

function formatMonth(yyyyMm: string) {
  const [, mm] = yyyyMm.split("-");
  return `${Number(mm)}월`;
}

export function RevenueDashboard() {
  const [data, setData] = useState<MonthlyRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const all = await fetchMonthlyRevenue(supabase);

      // Last 6 months including current
      const now = new Date();
      const months: string[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        );
      }

      const map = new Map(all.map((r) => [r.month, r]));
      const recent = months.map(
        (m) => map.get(m) ?? { month: m, revenue: 0, sessionCount: 0 },
      );
      setData(recent);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "수입 데이터를 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-border bg-surface-elevated p-5">
        <h2 className="text-lg font-semibold">수입 현황</h2>
        <p className="mt-4 text-sm text-muted">불러오는 중...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="rounded-2xl border border-border bg-surface-elevated p-5">
        <h2 className="text-lg font-semibold">수입 현황</h2>
        <p className="mt-4 text-sm text-red-400">{errorMessage}</p>
      </section>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonth = data.find((d) => d.month === currentMonth);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  const BAR_HEIGHT = 80;
  const BAR_WIDTH = 28;
  const GAP = 12;
  const CHART_WIDTH = data.length * (BAR_WIDTH + GAP) - GAP;

  return (
    <section className="rounded-2xl border border-border bg-surface-elevated p-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Revenue
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-100">수입 현황</h2>
        </div>
        {thisMonth ? (
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
            이번달 {thisMonth.sessionCount}회
          </span>
        ) : null}
      </div>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-[11px] text-zinc-500">이번달 수납액</p>
          <p className="mt-1 text-lg font-semibold text-emerald-400">
            {formatKRW(thisMonth?.revenue ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-[11px] text-zinc-500">이번달 수업</p>
          <p className="mt-1 text-lg font-semibold text-zinc-100">
            {thisMonth?.sessionCount ?? 0}회
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${BAR_HEIGHT + 24}`}
          width={CHART_WIDTH}
          height={BAR_HEIGHT + 24}
          style={{ minWidth: "100%" }}
        >
          {data.map((d, i) => {
            const x = i * (BAR_WIDTH + GAP);
            const barH = d.revenue > 0 ? Math.max((d.revenue / maxRevenue) * BAR_HEIGHT, 4) : 2;
            const y = BAR_HEIGHT - barH;
            const isCurrentMonth = d.month === currentMonth;

            return (
              <g key={d.month}>
                {/* Background track */}
                <rect
                  x={x}
                  y={0}
                  width={BAR_WIDTH}
                  height={BAR_HEIGHT}
                  rx={6}
                  fill="rgba(255,255,255,0.03)"
                />
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={BAR_WIDTH}
                  height={barH}
                  rx={6}
                  fill={isCurrentMonth ? "#10b981" : "rgba(16,185,129,0.3)"}
                />
                {/* Month label */}
                <text
                  x={x + BAR_WIDTH / 2}
                  y={BAR_HEIGHT + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill={isCurrentMonth ? "#10b981" : "#52525b"}
                  fontFamily="inherit"
                >
                  {formatMonth(d.month)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Revenue labels below chart */}
      <div className="mt-2 flex justify-between">
        {data.map((d) => (
          <div key={d.month} className="text-center" style={{ width: BAR_WIDTH }}>
            {d.revenue > 0 ? (
              <p className="text-[9px] text-zinc-600 leading-tight">
                {d.revenue >= 10000
                  ? `${Math.floor(d.revenue / 10000)}만`
                  : `${(d.revenue / 1000).toFixed(0)}천`}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
