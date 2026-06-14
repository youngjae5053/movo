import type { ReservationStatus } from "@/lib/types";

const statusLabels: Record<ReservationStatus, string> = {
  confirmed: "확정",
  pending: "대기",
};

const statusStyles: Record<ReservationStatus, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

type ReservationStatusBadgeProps = {
  status: ReservationStatus;
};

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
