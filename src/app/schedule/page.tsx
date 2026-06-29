"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BookSessionModal } from "@/components/BookSessionModal";
import { ScheduleCalendarView } from "@/components/ScheduleCalendarView";
import { ScheduleListSection } from "@/components/ScheduleListSection";
import {
  createScheduleWithMessage,
  ensureTrainerProfile,
  fetchMembers,
} from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Member } from "@/lib/types";

type Tab = "list" | "calendar";

export default function SchedulePage() {
  const [tab, setTab] = useState<Tab>("list");
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const listRef = useRef<{ reload: () => void } | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    fetchMembers(supabase).then(setMembers).catch(() => {});
  }, []);

  function handleOpenNewBooking() {
    setSelectedMember(null);
    setMemberSearch("");
    setShowMemberPicker(true);
  }

  function handleSelectMember(member: Member) {
    setSelectedMember(member);
    setShowMemberPicker(false);
    setIsNewBookingOpen(true);
  }

  async function handleBook(data: { date: string; time: string }) {
    if (!selectedMember) return;
    setBookingError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      await createScheduleWithMessage(supabase, selectedMember.id, trainer.id, data.date, data.time);
      setIsNewBookingOpen(false);
      setSelectedMember(null);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : "예약 생성에 실패했습니다.");
      throw error;
    }
  }

  const filteredMembers = members.filter((m) =>
    m.name.includes(memberSearch) || m.phone.includes(memberSearch)
  );

  return (
    <AppShell title="예약">
      {/* 탭 토글 */}
      <div className="mb-5 flex gap-1 rounded-xl bg-[#111318] p-1 ring-1 ring-white/[0.06]">
        <button
          type="button"
          onClick={() => setTab("list")}
          className={[
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all",
            tab === "list" ? "bg-emerald-500/20 text-emerald-400 shadow-[inset_0_1px_0_rgba(52,211,153,0.1)]" : "text-zinc-600 hover:text-zinc-400",
          ].join(" ")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          리스트
        </button>
        <button
          type="button"
          onClick={() => setTab("calendar")}
          className={[
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all",
            tab === "calendar" ? "bg-emerald-500/20 text-emerald-400 shadow-[inset_0_1px_0_rgba(52,211,153,0.1)]" : "text-zinc-600 hover:text-zinc-400",
          ].join(" ")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          캘린더
        </button>
      </div>

      {tab === "list" ? <ScheduleListSection /> : <ScheduleCalendarView />}

      {/* 플로팅 새 예약 버튼 */}
      <button
        type="button"
        onClick={handleOpenNewBooking}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4),0_8px_24px_rgba(0,0,0,0.5)] transition-all hover:scale-105 hover:bg-emerald-400 active:scale-95"
        aria-label="새 예약 추가"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* 회원 선택 바텀시트 */}
      {showMemberPicker && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMemberPicker(false)} />
          <div className="relative z-10 mx-auto w-full max-w-lg rounded-t-3xl border-t border-border bg-background p-4 pb-[env(safe-area-inset-bottom)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">회원 선택</h2>
              <button
                type="button"
                onClick={() => setShowMemberPicker(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:text-foreground"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="이름 또는 연락처 검색"
              className="mb-3 w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-emerald-500/50"
              autoFocus
            />
            <div className="max-h-72 overflow-y-auto space-y-1">
              {filteredMembers.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">회원이 없습니다.</p>
              ) : (
                filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMember(m)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-elevated"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-400">
                      {m.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted">{m.phone}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 예약 날짜/시간 선택 모달 */}
      <BookSessionModal
        isOpen={isNewBookingOpen}
        memberName={selectedMember?.name ?? ""}
        onClose={() => { setIsNewBookingOpen(false); setSelectedMember(null); }}
        onBook={handleBook}
      />
    </AppShell>
  );
}
