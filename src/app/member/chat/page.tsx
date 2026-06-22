import { AppShell } from "@/components/AppShell";
import { MemberChatSection } from "@/components/MemberChatSection";

export default function MemberChatPage() {
  return (
    <AppShell title="채팅" mainClassName="!p-0 flex flex-col">
      <MemberChatSection />
    </AppShell>
  );
}
