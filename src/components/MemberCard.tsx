import Link from "next/link";
import type { Member } from "@/lib/types";
import { formatShortDate, getDaysSince, getInitials } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

type MemberCardProps = {
  member: Member;
};

export function MemberCard({ member }: MemberCardProps) {
  const daysSince = getDaysSince(member.lastWorkoutAt);
  const isRecent = daysSince <= 3;

  return (
    <Link
      href={`/members/${member.id}`}
      className="group block rounded-2xl bg-[#111318] p-4 ring-1 ring-white/[0.06] transition-all active:scale-[0.98] hover:bg-[#14161d] hover:ring-emerald-500/20"
    >
      <div className="flex items-start gap-3.5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold transition-all ${isRecent ? "bg-gradient-to-br from-emerald-500/25 to-emerald-700/10 text-emerald-300 ring-1 ring-emerald-500/20" : "bg-white/[0.05] text-zinc-400 ring-1 ring-white/[0.08]"}`}>
          {getInitials(member.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold text-zinc-100 transition-colors group-hover:text-white">
                {member.name}
              </h2>
              <p className="mt-0.5 text-sm text-zinc-600">{member.goal}</p>
            </div>
            <StatusBadge status={member.status} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-zinc-600">마지막 운동 · {formatShortDate(member.lastWorkoutAt)}</span>
            <span className={`text-xs font-medium ${isRecent ? "text-emerald-400" : "text-zinc-600"}`}>
              {daysSince === 0 ? "오늘" : `${daysSince}일 전`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
