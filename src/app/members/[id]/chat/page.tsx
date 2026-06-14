import { notFound } from "next/navigation";
import { MemberChatView } from "@/components/MemberChatView";
import { mapMemberRow } from "@/lib/mappers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MemberChatPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberChatPage({ params }: MemberChatPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: member, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !member) {
    notFound();
  }

  return <MemberChatView initialMember={mapMemberRow(member)} />;
}
