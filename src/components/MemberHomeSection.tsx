"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchCurrentMemberProfile, fetchMemberWeekSchedules } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Member } from "@/lib/types";

export function MemberHomeSection() {
  const [member, setMember] = useState<Member | null>(null);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const profile = await fetchCurrentMemberProfile(supabase);
      const schedules = await fetchMemberWeekSchedules(supabase);
      setMember(profile);
      setUpcomingCount(
        schedules.reduce((sum, group) => sum + group.items.length, 0),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading || !member) {
    return <div className="py-20 text-center text-sm text-muted">불러오는 중...</div>;
  }

  return (
    <>
      <section className="mb-6">
        <p className="text-sm text-muted">안녕하세요</p>
        <h1 className="mt-1 text-2xl font-bold">{member.name}님</h1>
        <p className="mt-2 text-sm text-muted">{member.goal}</p>
      </section>

      <div className="grid gap-3">
        <Link
          href="/member/schedule"
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4"
        >
          <p className="text-sm font-medium text-emerald-400">다가오는 예약</p>
          <p className="mt-1 text-2xl font-bold text-emerald-300">{upcomingCount}건</p>
        </Link>
        <Link
          href="/member/workouts"
          className="rounded-2xl border border-border bg-surface-elevated px-4 py-4"
        >
          <p className="text-sm font-medium">운동 기록</p>
          <p className="mt-1 text-sm text-muted">트레이너와 함께 남긴 기록 보기</p>
        </Link>
        <Link
          href="/member/chat"
          className="rounded-2xl border border-border bg-surface-elevated px-4 py-4"
        >
          <p className="text-sm font-medium">트레이너와 채팅</p>
          <p className="mt-1 text-sm text-muted">질문이나 일정 조율을 남겨보세요</p>
        </Link>
      </div>
    </>
  );
}
