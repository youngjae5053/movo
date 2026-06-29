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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "inactive">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "name" | "lastWorkout">("newest");

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
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredMembers = members
    .filter((member) => {
      if (statusFilter !== "all" && member.status !== statusFilter) return false;
      if (!normalizedQuery) return true;
      return (
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.phone.includes(normalizedQuery) ||
        member.email.toLowerCase().includes(normalizedQuery) ||
        member.goal.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "name") {
        return a.name.localeCompare(b.name, "ko");
      }
      if (sortOrder === "lastWorkout") {
        return b.lastWorkoutAt.localeCompare(a.lastWorkoutAt);
      }
      // newest: default server order (already sorted by created_at desc), preserve index
      return 0;
    });

  async function handleAddMember(
    data: Pick<Member, "name" | "age" | "phone" | "goal" | "email"> & {
      privacyConsent: boolean;
      termsConsent: boolean;
    },
  ) {
    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      const newMember = await createMember(supabase, trainer.id, {
        name: data.name,
        age: data.age,
        phone: data.phone,
        goal: data.goal,
        email: data.email || undefined,
        privacyConsent: data.privacyConsent,
        termsConsent: data.termsConsent,
      });
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
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-zinc-300">회원 목록</h2>
          {members.length > 0 ? (
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="이름, 연락처 검색"
              className="w-44 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-emerald-500/40 sm:w-52"
            />
          ) : null}
        </div>

        {members.length > 0 ? (
          <div className="mb-4 space-y-2">
            {/* Status filter */}
            <div className="flex gap-1.5 flex-wrap">
              {(
                [
                  { value: "all", label: "전체" },
                  { value: "active", label: "활성" },
                  { value: "paused", label: "휴식" },
                  { value: "inactive", label: "비활성" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={[
                    "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                    statusFilter === value
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                      : "border-border text-zinc-500 hover:text-zinc-300",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-600">정렬</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-zinc-300 outline-none focus:border-emerald-500/40"
              >
                <option value="newest">최신 등록순</option>
                <option value="name">이름순</option>
                <option value="lastWorkout">마지막 운동일순</option>
              </select>
            </div>
          </div>
        ) : null}
        {members.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-10 text-center text-sm text-muted">
            등록된 회원이 없습니다. + 버튼으로 추가해 보세요.
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-10 text-center text-sm text-muted">
            검색 결과가 없습니다.
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredMembers.map((member) => (
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
