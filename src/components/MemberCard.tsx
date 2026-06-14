import Link from "next/link";
import type { Member } from "@/lib/types";
import { formatShortDate, getDaysSince, getInitials } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

type MemberCardProps = {
  member: Member;
};

export function MemberCard({ member }: MemberCardProps) {
  const daysSince = getDaysSince(member.lastWorkoutAt);

  return (
    <Link
      href={`/members/${member.id}`}
      className="group block rounded-2xl border border-border bg-surface-elevated p-4 transition-all active:scale-[0.98] hover:border-emerald-500/30"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-lg font-semibold text-emerald-400">
          {getInitials(member.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold text-foreground group-hover:text-emerald-400 transition-colors">
                {member.name}
              </h2>
              <p className="mt-0.5 text-sm text-muted">{member.goal}</p>
            </div>
            <StatusBadge status={member.status} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted">
            <span>마지막 운동 · {formatShortDate(member.lastWorkoutAt)}</span>
            <span
              className={
                daysSince <= 3 ? "text-emerald-400" : "text-muted"
              }
            >
              {daysSince === 0 ? "오늘" : `${daysSince}일 전`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
