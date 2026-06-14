"use client";

import { AppShell } from "@/components/AppShell";
import { ChatRoom } from "@/components/ChatRoom";
import type { Member } from "@/lib/types";

type MemberChatViewProps = {
  initialMember: Member;
};

export function MemberChatView({ initialMember }: MemberChatViewProps) {
  return (
    <AppShell
      title={initialMember.name}
      showBackButton
      backFallback={`/members/${initialMember.id}`}
      mainClassName="!p-0 flex flex-col"
    >
      <ChatRoom
        key={initialMember.id}
        memberId={initialMember.id}
        memberName={initialMember.name}
      />
    </AppShell>
  );
}
