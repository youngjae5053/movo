import { AppShell } from "@/components/AppShell";
import { TrainerDashboard } from "@/components/TrainerDashboard";

export default function HomePage() {
  return (
    <AppShell showLogout>
      <TrainerDashboard />
    </AppShell>
  );
}
