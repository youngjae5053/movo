import { AppShell } from "@/components/AppShell";
import { SettingsSection } from "@/components/SettingsSection";

export default function MemberSettingsPage() {
  return (
    <AppShell title="설정">
      <SettingsSection role="member" />
    </AppShell>
  );
}
