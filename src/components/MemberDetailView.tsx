"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { BookSessionModal } from "@/components/BookSessionModal";
import { EditMemberModal } from "@/components/EditMemberModal";
import { StatusBadge } from "@/components/StatusBadge";
import { WorkoutRecordSection } from "@/components/WorkoutRecordSection";
import {
  createScheduleWithMessage,
  ensureTrainerProfile,
  updateMember,
} from "@/lib/api/client";
import type { Member } from "@/lib/types";
import { formatDate, getInitials } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type MemberDetailViewProps = {
  initialMember: Member;
};

export function MemberDetailView({ initialMember }: MemberDetailViewProps) {
  const [member, setMember] = useState(initialMember);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleBookSession(data: { date: string; time: string }) {
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      await createScheduleWithMessage(
        supabase,
        member.id,
        trainer.id,
        data.date,
        data.time,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "예약 생성에 실패했습니다.",
      );
    }
  }

  async function handleSaveEdit(
    data: Pick<Member, "name" | "age" | "phone" | "goal" | "status">,
  ) {
    setErrorMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const updatedMember = await updateMember(supabase, member.id, data);
      setMember((prev) => ({ ...prev, ...updatedMember }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "회원 정보 수정에 실패했습니다.",
      );
    }
  }

  return (
    <AppShell
      title={member.name}
      showBackButton
      backFallback="/"
    >
      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      <section className="mb-6 rounded-2xl border border-border bg-surface-elevated p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-2xl font-bold text-emerald-400">
            {getInitials(member.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold">{member.name}</h2>
                <p className="mt-1 text-sm text-muted">{member.goal}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <StatusBadge status={member.status} />
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4" />
                      <path d="M8 2v4" />
                      <path d="M3 10h18" />
                    </svg>
                    예약
                  </button>
                  <Link
                    href={`/members/${member.id}/chat`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    채팅
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3">
          <InfoItem label="나이" value={`${member.age}세`} />
          <InfoItem label="등록일" value={formatDate(member.joinedAt)} />
          <InfoItem label="이메일" value={member.email} full />
          <InfoItem label="연락처" value={member.phone} full />
        </dl>
      </section>

      <WorkoutRecordSection memberId={member.id} />

      <BookSessionModal
        isOpen={isBookingOpen}
        memberName={member.name}
        onClose={() => setIsBookingOpen(false)}
        onBook={handleBookSession}
      />

      <EditMemberModal
        isOpen={isEditOpen}
        member={member}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
      />
    </AppShell>
  );
}

function InfoItem({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : undefined}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-all">{value}</dd>
    </div>
  );
}
