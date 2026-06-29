"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  createSessionPackage,
  deleteSessionPackage,
  ensureTrainerProfile,
  fetchRemainingSessionCount,
  fetchSessionPackages,
} from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { PaymentMethod, SessionPackage } from "@/lib/types";

type Props = {
  memberId: string;
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "카드",
  cash: "현금",
  transfer: "계좌이체",
};

export function SessionPackageSection({ memberId }: Props) {
  const [packages, setPackages] = useState<SessionPackage[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    totalSessions: "",
    price: "",
    paymentMethod: "" as PaymentMethod | "",
    paidAt: "",
    note: "",
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const [pkgs, rem] = await Promise.all([
        fetchSessionPackages(supabase, memberId),
        fetchRemainingSessionCount(supabase, memberId),
      ]);
      setPackages(pkgs);
      setRemaining(rem);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "패키지 정보를 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const total = Number(formData.totalSessions);
    if (!total || total < 1) {
      setErrorMessage("총 횟수를 올바르게 입력하세요.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      await createSessionPackage(supabase, memberId, trainer.id, {
        totalSessions: total,
        price: formData.price ? Number(formData.price) : undefined,
        paymentMethod: formData.paymentMethod || undefined,
        paidAt: formData.paidAt || undefined,
        note: formData.note || undefined,
      });
      setFormData({ totalSessions: "", price: "", paymentMethod: "", paidAt: "", note: "" });
      setShowForm(false);
      await load();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "패키지 추가에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingId) return;
    setErrorMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      await deleteSessionPackage(supabase, deletingId);
      await load();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "패키지 삭제에 실패했습니다.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">PT 회차 관리</h2>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/20"
        >
          {showForm ? "취소" : "+ 패키지 추가"}
        </button>
      </div>

      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      {/* 잔여 횟수 요약 */}
      <div className="mb-4 rounded-2xl border border-border bg-surface-elevated px-6 py-5 text-center">
        <p className="text-xs text-muted">전체 잔여 횟수</p>
        {isLoading ? (
          <p className="mt-1 text-4xl font-bold text-emerald-400">—</p>
        ) : (
          <p className="mt-1 text-4xl font-bold text-emerald-400">{remaining}<span className="ml-1 text-lg font-medium text-muted">회</span></p>
        )}
      </div>

      {/* 패키지 추가 폼 */}
      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="mb-4 rounded-2xl border border-border bg-surface-elevated p-4"
        >
          <p className="mb-3 text-sm font-medium">새 패키지 등록</p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted">총 횟수 *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.totalSessions}
                onChange={(e) => setFormData((prev) => ({ ...prev, totalSessions: e.target.value }))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
                placeholder="예: 20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">결제금액 (원)</label>
              <input
                type="number"
                min={0}
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
                placeholder="예: 500000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">결제방법</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value as PaymentMethod | "" }))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
              >
                <option value="">선택 안함</option>
                <option value="card">카드</option>
                <option value="cash">현금</option>
                <option value="transfer">계좌이체</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">결제일</label>
              <input
                type="date"
                value={formData.paidAt}
                onChange={(e) => setFormData((prev) => ({ ...prev, paidAt: e.target.value }))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">메모</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
                placeholder="선택사항"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {isSubmitting ? "저장 중..." : "패키지 등록"}
          </button>
        </form>
      ) : null}

      {/* 패키지 목록 */}
      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted">불러오는 중...</p>
      ) : packages.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-8 text-center">
          <p className="text-sm text-muted">등록된 패키지가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {packages.map((pkg) => {
            const usedSessions = pkg.totalSessions - pkg.remainingSessions;
            const progressPct = pkg.totalSessions > 0
              ? Math.round((usedSessions / pkg.totalSessions) * 100)
              : 0;

            return (
              <li key={pkg.id} className="rounded-2xl border border-border bg-surface-elevated px-4 py-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {pkg.remainingSessions}
                      <span className="ml-1 text-sm font-normal text-muted">/ {pkg.totalSessions}회 잔여</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted">등록일 {pkg.createdAt.slice(0, 10)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeletingId(pkg.id)}
                    className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs text-red-400 hover:border-red-500/30"
                  >
                    삭제
                  </button>
                </div>

                {/* 진행률 바 */}
                <div className="mb-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted">
                    <span>진행률</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  {pkg.price !== undefined ? (
                    <span>결제금액 <span className="text-foreground">{pkg.price.toLocaleString()}원</span></span>
                  ) : null}
                  {pkg.paymentMethod ? (
                    <span>결제방법 <span className="text-foreground">{PAYMENT_METHOD_LABELS[pkg.paymentMethod]}</span></span>
                  ) : null}
                  {pkg.paidAt ? (
                    <span>결제일 <span className="text-foreground">{pkg.paidAt.slice(0, 10)}</span></span>
                  ) : null}
                  {pkg.note ? (
                    <span>메모 <span className="text-foreground">{pkg.note}</span></span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmModal
        isOpen={deletingId !== null}
        title="패키지를 삭제할까요?"
        description="삭제된 패키지는 복구할 수 없습니다."
        confirmLabel="삭제하기"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingId(null)}
      />
    </section>
  );
}
