"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataRequestSection } from "@/components/DataRequestSection";
import {
  ensureTrainerProfile,
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
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

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

  useEffect(() => {
    loadTrainer();
  }, [loadTrainer]);

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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
      setProfileMessage("프로필이 저장되었습니다.");
    } catch (error) {
      setProfileMessage(
        error instanceof Error ? error.message : "프로필 저장에 실패했습니다.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <div className="space-y-6">
      {role === "trainer" ? (
        <section className="rounded-2xl border border-border bg-surface-elevated p-5">
          <h2 className="text-lg font-semibold">트레이너 프로필</h2>
          {isLoadingProfile ? (
            <p className="mt-4 text-sm text-muted">불러오는 중...</p>
          ) : (
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
              <label className="block space-y-1.5">
                <span className="text-xs text-muted">이름</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className={inputClassName}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-muted">센터명</span>
                <input
                  value={centerName}
                  onChange={(event) => setCenterName(event.target.value)}
                  className={inputClassName}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-muted">연락처</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClassName}
                />
              </label>
              {trainer?.email ? (
                <p className="text-xs text-muted">이메일: {trainer.email}</p>
              ) : null}
              {profileMessage ? (
                <p className="text-sm text-emerald-400">{profileMessage}</p>
              ) : null}
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-60"
              >
                {isSavingProfile ? "저장 중..." : "프로필 저장"}
              </button>
            </form>
          )}
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-surface-elevated p-5">
        <h2 className="text-lg font-semibold">계정</h2>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 w-full rounded-xl border border-border py-3 text-sm font-medium text-red-400"
        >
          로그아웃
        </button>
      </section>

      <DataRequestSection role={role} />
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20";
