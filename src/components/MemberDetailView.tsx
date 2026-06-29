"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { BodyRecordSection } from "@/components/BodyRecordSection";
import { BookSessionModal } from "@/components/BookSessionModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { EditMemberModal } from "@/components/EditMemberModal";
import { MemberInviteButton } from "@/components/MemberInviteButton";
import { SessionPackageSection } from "@/components/SessionPackageSection";
import { StatusBadge } from "@/components/StatusBadge";
import { WorkoutRecordSection } from "@/components/WorkoutRecordSection";
import {
  createScheduleWithMessage,
  ensureTrainerProfile,
  softDeleteMember,
  updateMember,
} from "@/lib/api/client";
import type { Member } from "@/lib/types";
import { formatDate, getInitials } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type Tab = "profile" | "sessions" | "body" | "workouts";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "프로필" },
  { id: "sessions", label: "PT회차" },
  { id: "body", label: "체성분" },
  { id: "workouts", label: "운동기록" },
];

type MemberDetailViewProps = {
  initialMember: Member;
};

export function MemberDetailView({ initialMember }: MemberDetailViewProps) {
  const router = useRouter();
  const [member, setMember] = useState(initialMember);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleBookSession(data: { date: string; time: string }) {
    setErrorMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const trainer = await ensureTrainerProfile(supabase);
      await createScheduleWithMessage(supabase, member.id, trainer.id, data.date, data.time);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "예약 생성에 실패했습니다.");
      throw error;
    }
  }

  async function handleSaveEdit(data: Pick<Member, "name" | "age" | "phone" | "goal" | "status">) {
    setErrorMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const updatedMember = await updateMember(supabase, member.id, data);
      setMember((prev) => ({ ...prev, ...updatedMember }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "회원 정보 수정에 실패했습니다.");
    }
  }

  async function handleDeleteMember() {
    setErrorMessage(null);
    setIsDeleting(true);
    try {
      const supabase = createBrowserSupabaseClient();
      await softDeleteMember(supabase, member.id);
      router.push("/members");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "회원 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  }

  return (
    <AppShell title={member.name} showBackButton backFallback="/members">
      {errorMessage ? <AuthErrorBanner message={errorMessage} /> : null}

      {/* 회원 헤더 카드 */}
      <section className="mb-4 rounded-2xl border border-border bg-surface-elevated p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xl font-bold text-emerald-400">
            {getInitials(member.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{member.name}</h2>
              <StatusBadge status={member.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted">{member.goal}</p>
          </div>
        </div>
        {/* 빠른 액션 */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setIsBookingOpen(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            예약 추가
          </button>
          <Link
            href={`/members/${member.id}/chat`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            채팅
          </Link>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
          >
            수정
          </button>
        </div>
      </section>

      {/* 탭 네비게이션 */}
      <div className="mb-5 flex gap-0.5 rounded-xl border border-border bg-surface-elevated p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              "flex-1 rounded-lg py-2 text-xs font-semibold transition-colors",
              activeTab === tab.id
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "profile" && (
        <ProfileTab member={member} onDelete={() => setIsDeleteOpen(true)} />
      )}
      {activeTab === "sessions" && (
        <SessionPackageSection memberId={member.id} />
      )}
      {activeTab === "body" && (
        <BodyRecordSection memberId={member.id} />
      )}
      {activeTab === "workouts" && (
        <WorkoutRecordSection memberId={member.id} />
      )}

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
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="회원을 삭제할까요?"
        description="삭제된 회원은 목록에서 숨겨지며, 관련 데이터는 보관됩니다."
        confirmLabel={isDeleting ? "삭제 중..." : "삭제"}
        onConfirm={handleDeleteMember}
        onClose={() => setIsDeleteOpen(false)}
      />
    </AppShell>
  );
}

function ProfileTab({ member, onDelete }: { member: Member; onDelete: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface-elevated p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider">기본 정보</h3>
        <dl className="space-y-3">
          <InfoRow label="나이" value={`${member.age}세`} />
          <InfoRow label="등록일" value={formatDate(member.joinedAt)} />
          <InfoRow label="마지막 운동" value={formatDate(member.lastWorkoutAt)} />
          <InfoRow label="연락처" value={member.phone} />
          {member.email && <InfoRow label="이메일" value={member.email} />}
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-surface-elevated p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider">회원 앱 연동</h3>
        <MemberInviteButton memberId={member.id} />
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="w-full rounded-xl border border-red-500/20 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
      >
        회원 삭제
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-muted shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-right break-all">{value}</dd>
    </div>
  );
}
