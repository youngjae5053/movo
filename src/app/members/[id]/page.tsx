import { notFound } from "next/navigation";
import { MemberDetailView } from "@/components/MemberDetailView";
import { mapMemberRow } from "@/lib/mappers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MemberDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberDetailPage({
  params,
}: MemberDetailPageProps) {
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

  return <MemberDetailView initialMember={mapMemberRow(member)} />;
}
