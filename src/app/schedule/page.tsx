import { AppShell } from "@/components/AppShell";
import { ScheduleListSection } from "@/components/ScheduleListSection";

export default function SchedulePage() {
  return (
    <AppShell title="예약">
      <ScheduleListSection />
    </AppShell>
  );
}
