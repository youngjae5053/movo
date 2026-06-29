"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  createBodyRecord,
  deleteBodyRecord,
  ensureTrainerProfile,
  fetchBodyRecords,
} from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { BodyRecord } from "@/lib/types";

type BodyRecordSectionProps = {
  memberId: string;
};

function WeightChart({ records }: { records: BodyRecord[] }) {
  const chartData = records
    .filter((r) => r.weight != null)
    .slice()
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    )
    .slice(-10);

  if (chartData.length < 2) return null;

  const weights = chartData.map((r) => r.weight as number);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const W = 400;
  const H = 120;
  const PAD = { top: 16, right: 16, bottom: 32, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const points = chartData.map((r, i) => {
    const x = PAD.left + (i / (chartData.length - 1)) * chartW;
    const y = PAD.top + (1 - ((r.weight as number) - minW) / range) * chartH;
    return { x, y, record: r };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  function fmtDate(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  return (
    <div className="mb-6 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-zinc-900/50 p-4">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        체중 추이
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        aria-label="체중 추이 차트"
      >
        {/* y-axis labels */}
        {[0, 0.5, 1].map((t) => {
          const val = minW + t * range;
          const y = PAD.top + (1 - t) * chartH;
          return (
            <g key={t}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 4}
                y={y + 4}
                textAnchor="end"
                fontSize="9"
                fill="rgba(255,255,255,0.3)"
              >
                {val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* x-axis date labels (first, middle, last) */}
        {[0, Math.floor((chartData.length - 1) / 2), chartData.length - 1]
          .filter((i, idx, arr) => arr.indexOf(i) === idx)
          .map((i) => (
            <text
              key={i}
              x={points[i].x}
              y={H - 6}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(255,255,255,0.3)"
            >
              {fmtDate(chartData[i].recordedAt)}
            </text>
          ))}

        {/* line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#10b981" />
            <circle cx={p.x} cy={p.y} r="2" fill="#000" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function BodyRecordCard({
  record,
  onDelete,
}: {
  record: BodyRecord;
  onDelete: (record: BodyRecord) => void;
}) {
  const date = new Date(record.recordedAt);
  const dateStr = `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;

  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-zinc-900/50 p-4">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-sm font-medium text-zinc-300">{dateStr}</span>
        <button
          type="button"
          onClick={() => onDelete(record)}
          aria-label="기록 삭제"
          className="rounded-lg border border-white/[0.06] px-2 py-1 text-[11px] text-zinc-600 transition-colors hover:border-red-500/30 hover:text-red-400"
        >
          삭제
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {record.weight != null && (
          <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2">
            <p className="text-[10px] text-zinc-600">체중</p>
            <p className="mt-0.5 text-base font-semibold text-zinc-100">
              {record.weight}
              <span className="ml-0.5 text-xs font-normal text-zinc-500">
                kg
              </span>
            </p>
          </div>
        )}
        {record.muscleMass != null && (
          <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2">
            <p className="text-[10px] text-zinc-600">골격근량</p>
            <p className="mt-0.5 text-base font-semibold text-emerald-400">
              {record.muscleMass}
              <span className="ml-0.5 text-xs font-normal text-zinc-500">
                kg
              </span>
            </p>
          </div>
        )}
        {record.bodyFatPercent != null && (
          <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2">
            <p className="text-[10px] text-zinc-600">체지방률</p>
            <p className="mt-0.5 text-base font-semibold text-zinc-100">
              {record.bodyFatPercent}
              <span className="ml-0.5 text-xs font-normal text-zinc-500">%</span>
            </p>
          </div>
        )}
        {record.bmi != null && (
          <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2">
            <p className="text-[10px] text-zinc-600">BMI</p>
            <p className="mt-0.5 text-base font-semibold text-zinc-100">
              {record.bmi}
            </p>
          </div>
        )}
      </div>

      {record.note && (
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">
          {record.note}
        </p>
      )}
    </div>
  );
}

export function BodyRecordSection({ memberId }: BodyRecordSectionProps) {
  const [records, setRecords] = useState<BodyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<BodyRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // form fields
  const [recordedAt, setRecordedAt] = useState("");
  const [weight, setWeight] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [bodyFatPercent, setBodyFatPercent] = useState("");
  const [bmi, setBmi] = useState("");
  const [note, setNote] = useState("");

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const data = await fetchBodyRecords(supabase, memberId);
      setRecords(
        data
          .slice()
          .sort(
            (a, b) =>
              new Date(b.recordedAt).getTime() -
              new Date(a.recordedAt).getTime(),
          ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "체성분 기록을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  function resetForm() {
    setRecordedAt("");
    setWeight("");
    setMuscleMass("");
    setBodyFatPercent("");
    setBmi("");
    setNote("");
    setShowForm(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!recordedAt) return;

    setErrorMessage(null);
    setIsSaving(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      const newRecord = await createBodyRecord(supabase, memberId, trainer.id, {
        recordedAt,
        weight: weight ? Number(weight) : undefined,
        muscleMass: muscleMass ? Number(muscleMass) : undefined,
        bodyFatPercent: bodyFatPercent ? Number(bodyFatPercent) : undefined,
        bmi: bmi ? Number(bmi) : undefined,
        note: note.trim() || undefined,
      });
      setRecords((prev) =>
        [newRecord, ...prev].sort(
          (a, b) =>
            new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
        ),
      );
      resetForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "기록 저장에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingRecord) return;
    setErrorMessage(null);
    setIsSaving(true);
    try {
      const supabase = createBrowserSupabaseClient();
      await deleteBodyRecord(supabase, deletingRecord.id);
      setRecords((prev) => prev.filter((r) => r.id !== deletingRecord.id));
      setDeletingRecord(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "기록 삭제에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const canSave = !!recordedAt && !isSaving;

  return (
    <section>
      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Body Composition
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-100">
            체성분 기록
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            체중, 골격근량, 체지방률을 기록하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
            {records.length}개
          </span>
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              showForm
                ? "bg-zinc-800 text-zinc-400"
                : "bg-emerald-500 text-black hover:bg-emerald-400"
            }`}
          >
            {showForm ? "취소" : "+ 기록 추가"}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="relative mb-6 overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-gradient-to-b from-zinc-900/90 to-black/80 p-1 shadow-[0_20px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
          <div className="rounded-[1.15rem] bg-black/20 p-4">
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">
                측정일 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
                required
                className="w-full rounded-xl border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">
                  체중 (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70.5"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">
                  골격근량 (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={muscleMass}
                  onChange={(e) => setMuscleMass(e.target.value)}
                  placeholder="32.0"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">
                  체지방률 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={bodyFatPercent}
                  onChange={(e) => setBodyFatPercent(e.target.value)}
                  placeholder="18.5"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">
                  BMI
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={bmi}
                  onChange={(e) => setBmi(e.target.value)}
                  placeholder="22.4"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-medium text-zinc-500">
                메모
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="측정 관련 특이사항을 남겨보세요"
                rows={2}
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
              />
            </div>

            <div className="flex justify-end border-t border-white/[0.06] pt-3">
              <button
                type="submit"
                disabled={!canSave}
                className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-10 text-center text-sm text-zinc-500">
          불러오는 중...
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-[1.35rem] border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
          <p className="text-sm font-medium text-zinc-300">
            첫 체성분 기록을 추가해보세요
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            체중, 골격근량, 체지방률을 함께 기록할 수 있습니다
          </p>
        </div>
      ) : (
        <>
          <WeightChart records={records} />
          <ul className="space-y-3">
            {records.map((record) => (
              <li key={record.id}>
                <BodyRecordCard record={record} onDelete={setDeletingRecord} />
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmModal
        isOpen={deletingRecord !== null}
        title="기록을 삭제할까요?"
        description="삭제한 체성분 기록은 복구할 수 없습니다."
        confirmLabel="삭제"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingRecord(null)}
      />
    </section>
  );
}
