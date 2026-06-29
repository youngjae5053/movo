"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataRequestSection } from "@/components/DataRequestSection";
import {
  ensureTrainerProfile,
  exportMembersCSV,
  updateTrainerProfile,
} from "@/lib/api/client";
import type { TrainerProfile } from "@/lib/types";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type SettingsSectionProps = {
  role: "trainer" | "member";
};

export function SettingsSection({ role }: SettingsSectionProps) {
  const router = useRouter();
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [name, setName] = useState("");
  const [centerName, setCenterName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(role === "trainer");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const loadTrainer = useCallback(async () => {
    if (role !== "trainer") return;
    setIsLoadingProfile(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const profile = await ensureTrainerProfile(supabase);
      setTrainer(profile);
      setName(profile.name);
      setCenterName(profile.centerName ?? "");
      setPhone(profile.phone ?? "");
    } finally {
      setIsLoadingProfile(false);
    }
  }, [role]);

  useEffect(() => { loadTrainer(); }, [loadTrainer]);

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleExportCSV() {
    setIsExporting(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const csv = await exportMembersCSV(supabase);
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const a = document.createElement("a");
      a.href = url;
      a.download = `members_export_${today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleSaveProfile(event: FormEvent) {
    event.preventDefault();
    if (role !== "trainer") return;
    setProfileMessage(null);
    setIsSavingProfile(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const updated = await updateTrainerProfile(supabase, {
        name,
        centerName: centerName || undefined,
        phone: phone || undefined,
      });
      setTrainer(updated);
      setProfileMessage({ type: "ok", text: "프로필이 저장되었습니다." });
    } catch (error) {
      setProfileMessage({
        type: "err",
        text: error instanceof Error ? error.message : "프로필 저장에 실패했습니다.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <div className="space-y-4">
      {role === "trainer" ? (
        <>
          {/* 프로필 카드 */}
          <section className="rounded-2xl border border-border bg-surface-elevated p-5">
            <h2 className="mb-4 text-base font-semibold">트레이너 프로필</h2>
            {isLoadingProfile ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-surface" />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-muted">이름</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-muted">센터명</span>
                  <input value={centerName} onChange={(e) => setCenterName(e.target.value)} placeholder="예: Movo PT Studio" className={inputCls} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-muted">연락처</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputCls} />
                </label>
                {trainer?.email ? (
                  <p className="rounded-xl border border-border bg-surface px-4 py-3 text-xs text-muted">
                    이메일: <span className="text-zinc-300">{trainer.email}</span>
                  </p>
                ) : null}
                {profileMessage ? (
                  <p className={`text-sm ${profileMessage.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>
                    {profileMessage.text}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:opacity-60"
                >
                  {isSavingProfile ? "저장 중..." : "프로필 저장"}
                </button>
              </form>
            )}
          </section>

          {/* 빠른 메뉴 */}
          <section className="rounded-2xl border border-border bg-surface-elevated">
            <Link
              href="/revenue"
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/5 rounded-t-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">수입 현황</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
            <div className="border-t border-border/50" />
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-white/5 rounded-b-2xl disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">{isExporting ? "내보내는 중..." : "회원 데이터 CSV 내보내기"}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </section>
        </>
      ) : null}

      {/* 계정 */}
      <section className="rounded-2xl border border-border bg-surface-elevated">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-5 py-4 transition-colors hover:bg-white/5 rounded-2xl"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <span className="text-sm font-medium text-red-400">로그아웃</span>
        </button>
      </section>

      <DataRequestSection role={role} />

      <p className="text-center text-xs text-zinc-700 pb-2">Movo v1.0 · 트레이너 전용</p>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20";
