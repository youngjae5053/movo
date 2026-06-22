"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatRoom } from "@/components/ChatRoom";
import { fetchCurrentMemberProfile } from "@/lib/api/client";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function MemberChatSection() {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState("회원");

  const load = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const member = await fetchCurrentMemberProfile(supabase);
    setMemberId(member.id);
    setMemberName(member.name);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!memberId) {
    return <div className="py-20 text-center text-sm text-muted">불러오는 중...</div>;
  }

  return (
    <ChatRoom
      memberId={memberId}
      memberName={memberName}
      mode="member"
    />
  );
}
