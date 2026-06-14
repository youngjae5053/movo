import { AppShell } from "@/components/AppShell";
import { ChatListSection } from "@/components/ChatListSection";

export default function ChatsPage() {
  return (
    <AppShell title="채팅">
      <ChatListSection />
    </AppShell>
  );
}
