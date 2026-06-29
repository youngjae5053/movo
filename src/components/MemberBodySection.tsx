"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMemberBodyRecords } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { BodyRecord } from "@/lib/types";

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function WeightChart({ records }: { records: BodyRecord[] }) {
  const withWeight = records.filter((r) => r.weight != null).slice(-10);
  if (withWeight.length < 2) return null;

  const W = 280;
  const H = 80;
  const PAD = 20;
  const weights = withWeight.map((r) => r.weight as number);
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;

  const toX = (i: number) => PAD + (i / (withWeight.length - 1)) * (W - PAD * 2);
  const toY = (w: number) => H - PAD - ((w - min) / (max - min)) * (H - PAD * 2);

  const points = withWeight.map((r, i) => `${toX(i)},${toY(r.weight as number)}`).join(" ");

  return (
    <div className="mb-5 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="mb-2 text-xs text-zinc-500">체중 추이 (kg)</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <polyline
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {withWeight.map((r, i) => (
          <g key={r.id}>
            <circle cx={toX(i)} cy={toY(r.weight as number)} r={3} fill="#10b981" />
            <text
              x={toX(i)}
              y={toY(r.weight as number) - 7}
              textAnchor="middle"
              fontSize={8}
              fill="#71717a"
            >
              {r.weight}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function MemberBodySection() {
  const [records, setRecords] = useState<BodyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const data = await fetchMemberBodyRecords(supabase);
      setRecords([...data].reverse());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="px-4 py-4">
            <h1 className="text-lg font-semibold">체성분 기록</h1>
          </div>
        </header>
        <main className="flex-1 px-4 py-5">
          <div className="py-20 text-center text-sm text-muted">불러오는 중...</div>
        </main>
      </div>
    );
  }

  const ascRecords = [...records].reverse();

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="px-4 py-4">
          <h1 className="text-lg font-semibold">체성분 기록</h1>
          <p className="mt-0.5 text-xs text-muted">트레이너가 기록한 체성분 데이터</p>
        </div>
      </header>
      <main className="flex-1 px-4 py-5">
      <section className="mb-5 sr-only">
        <h1 className="text-2xl font-bold">체성분 기록</h1>
        <p className="mt-1 text-sm text-muted">트레이너가 기록한 체성분 데이터입니다</p>
      </section>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-10 text-center text-sm text-muted">
          아직 체성분 기록이 없습니다.
        </div>
      ) : (
        <>
          <WeightChart records={ascRecords} />
          <ul className="space-y-3">
            {records.map((record) => (
              <li key={record.id} className="rounded-2xl border border-border bg-surface-elevated p-4">
                <p className="mb-3 text-xs font-medium text-zinc-400">{formatDate(record.recordedAt)}</p>
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {record.weight != null ? (
                    <Stat label="체중" value={`${record.weight} kg`} />
                  ) : null}
                  {record.muscleMass != null ? (
                    <Stat label="골격근량" value={`${record.muscleMass} kg`} />
                  ) : null}
                  {record.bodyFatPercent != null ? (
                    <Stat label="체지방률" value={`${record.bodyFatPercent} %`} />
                  ) : null}
                  {record.bmi != null ? (
                    <Stat label="BMI" value={String(record.bmi)} />
                  ) : null}
                </dl>
                {record.note ? (
                  <p className="mt-3 text-xs text-zinc-500">{record.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] text-zinc-600">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-zinc-100">{value}</dd>
    </div>
  );
}
