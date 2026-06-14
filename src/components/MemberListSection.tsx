"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AddMemberModal } from "@/components/AddMemberModal";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { MemberCard } from "@/components/MemberCard";
import {
  createMember,
  ensureTrainerProfile,
  fetchMembers,
  fetchTodayScheduleCount,
} from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Member } from "@/lib/types";

export function MemberListSection() {
  const [members, setMembers] = useState<Member[]>([]);
  const [trainerName, setTrainerName] = useState("트레이너");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todayReservationCount, setTodayReservationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      const [memberList, todayCount] = await Promise.all([
        fetchMembers(supabase),
        fetchTodayScheduleCount(supabase),
      ]);

      setTrainerName(trainer.name);
      setMembers(memberList);
      setTodayReservationCount(todayCount);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "데이터를 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = members.filter((member) => member.status === "active").length;

  async function handleAddMember(
    data: Pick<Member, "name" | "age" | "phone" | "goal">,
  ) {
    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      const newMember = await createMember(supabase, trainer.id, data);
      setMembers((prev) => [newMember, ...prev]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "회원 추가에 실패했습니다.",
      );
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
        <p className="text-sm text-muted">안녕하세요, {trainerName} 트레이너</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          담당 회원 {members.length}명
        </h1>
        <p className="mt-2 text-sm text-muted">
          활동 중 {activeCount}명 · 오늘도 좋은 수업 되세요
        </p>
        <Link
          href="/schedule"
          className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 transition-colors hover:bg-emerald-500/15"
        >
          <div>
            <p className="text-sm font-medium text-emerald-400">오늘 예약</p>
            <p className="mt-0.5 text-xs text-muted">
              {todayReservationCount}건의 수업이 예정되어 있습니다
            </p>
          </div>
          <span className="text-2xl font-bold text-emerald-400">
            {todayReservationCount}
          </span>
        </Link>
      </section>

      <section className="mb-5 grid grid-cols-3 gap-2">
        <StatCard label="전체" value={members.length} />
        <StatCard label="활동 중" value={activeCount} highlight />
        <StatCard
          label="주의"
          value={members.filter((member) => member.status !== "active").length}
        />
      </section>

      <section className="pb-8">
        <h2 className="mb-3 text-sm font-medium text-zinc-300">회원 목록</h2>
        {members.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-10 text-center text-sm text-muted">
            등록된 회원이 없습니다. + 버튼으로 추가해 보세요.
          </div>
        ) : (
          <ul className="space-y-3">
            {members.map((member) => (
              <li key={member.id}>
                <MemberCard member={member} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 mx-auto max-w-lg px-4">
        <div className="flex justify-end pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label="새 회원 추가"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-light text-black shadow-lg shadow-emerald-500/20 transition-transform hover:bg-emerald-400 active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddMember}
      />
    </>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated px-3 py-3 text-center">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 text-xl font-bold ${highlight ? "text-emerald-400" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}
