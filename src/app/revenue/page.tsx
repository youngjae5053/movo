import { AppShell } from "@/components/AppShell";
import { RevenueSection } from "@/components/RevenueSection";

export default function RevenuePage() {
  return (
    <AppShell title="수입 현황" showBackButton backFallback="/">
      <RevenueSection />
    </AppShell>
  );
}
