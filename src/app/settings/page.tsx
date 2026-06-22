import { AppShell } from "@/components/AppShell";
import { SettingsSection } from "@/components/SettingsSection";

export default function SettingsPage() {
  return (
    <AppShell title="설정" showBackButton backFallback="/">
      <SettingsSection role="trainer" />
    </AppShell>
  );
}
