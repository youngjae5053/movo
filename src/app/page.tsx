import { AppShell } from "@/components/AppShell";
import { MemberListSection } from "@/components/MemberListSection";

export default function HomePage() {
  return (
    <AppShell showLogout>
      <MemberListSection />
    </AppShell>
  );
}
