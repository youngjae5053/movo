import { AppShell } from "@/components/AppShell";
import { MemberHomeSection } from "@/components/MemberHomeSection";

export default function MemberHomePage() {
  return (
    <AppShell title="Movo" showLogout>
      <MemberHomeSection />
    </AppShell>
  );
}
