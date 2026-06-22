import type { SupabaseBrowserClient } from "@/lib/supabase";
import type { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

export type UserRole = "trainer" | "member" | "unknown";

type SupabaseClient =
  | SupabaseBrowserClient
  | ReturnType<
      typeof createServerClient<Database>
    >;

export type UserProfile = {
  role: UserRole;
  trainerId?: string;
  memberId?: string;
  needsOnboarding: boolean;
};

export async function resolveUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile> {
  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, onboarding_completed_at")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (trainer) {
    return {
      role: "trainer",
      trainerId: trainer.id,
      needsOnboarding: !trainer.onboarding_completed_at,
    };
  }

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (member) {
    return {
      role: "member",
      memberId: member.id,
      needsOnboarding: false,
    };
  }

  return {
    role: "unknown",
    needsOnboarding: false,
  };
}

export function getPostLoginPath(profile: UserProfile): string {
  if (profile.role === "member") {
    return "/member";
  }

  if (profile.role === "trainer") {
    return profile.needsOnboarding ? "/onboarding" : "/";
  }

  return "/signup?complete=profile";
}
