import type { MemberStatus } from "@/lib/types";
import { getStatusLabel, getStatusStyle } from "@/lib/status";

type StatusBadgeProps = {
  status: MemberStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
