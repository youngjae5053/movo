import type { MemberStatus } from "./types";

const statusLabels: Record<MemberStatus, string> = {
  active: "활동 중",
  inactive: "비활성",
  paused: "일시 중지",
};

const statusStyles: Record<MemberStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  inactive: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  paused: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export function getStatusLabel(status: MemberStatus): string {
  return statusLabels[status];
}

export function getStatusStyle(status: MemberStatus): string {
  return statusStyles[status];
}
