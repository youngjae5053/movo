import type { SupabaseBrowserClient } from "@/lib/supabase";
import {
  mapMemberRow,
  mapMessageRow,
  mapScheduleRow,
  mapTrainerRow,
  mapWorkoutRow,
} from "@/lib/mappers";
import type { Member, Reservation } from "@/lib/types";
import {
  addDaysToDateString,
  formatReservationChatMessage,
  getTodayDateString,
  groupReservationsByDate,
} from "@/lib/utils";

export async function ensureTrainerProfile(supabase: SupabaseBrowserClient) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data: existing, error: fetchError } = await supabase
    .from("trainers")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (existing) {
    return mapTrainerRow(existing);
  }

  const { data: created, error: insertError } = await supabase
    .from("trainers")
    .insert({
      auth_user_id: user.id,
      name:
        (user.user_metadata?.name as string | undefined) ??
        user.email?.split("@")[0] ??
        "트레이너",
      email: user.email ?? "",
    })
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  return mapTrainerRow(created);
}

export async function fetchMembers(supabase: SupabaseBrowserClient) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapMemberRow(row));
}

export async function fetchMemberById(
  supabase: SupabaseBrowserClient,
  memberId: string,
) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapMemberRow(data) : null;
}

export async function createMember(
  supabase: SupabaseBrowserClient,
  trainerId: string,
  input: Pick<Member, "name" | "age" | "phone" | "goal">,
) {
  const today = getTodayDateString();

  const { data, error } = await supabase
    .from("members")
    .insert({
      trainer_id: trainerId,
      name: input.name,
      email: `${input.name.replace(/\s/g, "").toLowerCase()}@email.com`,
      phone: input.phone,
      age: input.age,
      goal: input.goal,
      status: "active",
      joined_at: today,
      last_workout_at: today,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapMemberRow(data);
}

export async function updateMember(
  supabase: SupabaseBrowserClient,
  memberId: string,
  input: Pick<Member, "name" | "age" | "phone" | "goal" | "status">,
) {
  const { data, error } = await supabase
    .from("members")
    .update({
      name: input.name,
      age: input.age,
      phone: input.phone,
      goal: input.goal,
      status: input.status,
    })
    .eq("id", memberId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapMemberRow(data);
}

export async function fetchWorkoutRecords(
  supabase: SupabaseBrowserClient,
  memberId: string,
) {
  const { data, error } = await supabase
    .from("workout_records")
    .select("*")
    .eq("member_id", memberId)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapWorkoutRow);
}

export async function createWorkoutRecord(
  supabase: SupabaseBrowserClient,
  memberId: string,
  trainerId: string,
  content: string,
) {
  const today = getTodayDateString();

  const { data, error } = await supabase
    .from("workout_records")
    .insert({
      member_id: memberId,
      trainer_id: trainerId,
      record_date: today,
      content,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await supabase
    .from("members")
    .update({ last_workout_at: today })
    .eq("id", memberId);

  return mapWorkoutRow(data);
}

export async function updateWorkoutRecord(
  supabase: SupabaseBrowserClient,
  recordId: string,
  content: string,
) {
  const { data, error } = await supabase
    .from("workout_records")
    .update({
      content,
      title: null,
      duration: null,
      exercises: null,
      note: null,
    })
    .eq("id", recordId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapWorkoutRow(data);
}

export async function deleteWorkoutRecord(
  supabase: SupabaseBrowserClient,
  recordId: string,
) {
  const { error } = await supabase
    .from("workout_records")
    .delete()
    .eq("id", recordId);

  if (error) {
    throw error;
  }
}

export async function fetchMessages(
  supabase: SupabaseBrowserClient,
  memberId: string,
) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("member_id", memberId)
    .order("sent_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapMessageRow);
}

export async function sendTrainerMessage(
  supabase: SupabaseBrowserClient,
  memberId: string,
  trainerId: string,
  content: string,
) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      member_id: memberId,
      trainer_id: trainerId,
      sender: "trainer",
      content,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapMessageRow(data);
}

export async function markMessagesAsRead(
  supabase: SupabaseBrowserClient,
  memberId: string,
) {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("member_id", memberId)
    .eq("sender", "member")
    .is("read_at", null);

  if (error) {
    throw error;
  }
}

export async function fetchChatPreviews(supabase: SupabaseBrowserClient) {
  const members = await fetchMembers(supabase);

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .order("sent_at", { ascending: false });

  if (error) {
    throw error;
  }

  const latestByMember = new Map<string, ReturnType<typeof mapMessageRow>>();
  const unreadByMember = new Map<string, number>();

  for (const row of messages ?? []) {
    if (!latestByMember.has(row.member_id)) {
      latestByMember.set(row.member_id, mapMessageRow(row));
    }
  }

  for (const member of members) {
    const { count, error: unreadError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("member_id", member.id)
      .eq("sender", "member")
      .is("read_at", null);

    if (unreadError) {
      throw unreadError;
    }

    unreadByMember.set(member.id, count ?? 0);
  }

  return members
    .map((member) => {
      const latest = latestByMember.get(member.id);
      return {
        member,
        preview: latest?.content ?? "대화를 시작해보세요",
        time: latest?.sentAt,
        unreadCount: unreadByMember.get(member.id) ?? 0,
      };
    })
    .sort((a, b) => {
      if (a.unreadCount !== b.unreadCount) {
        return b.unreadCount - a.unreadCount;
      }
      if (!a.time && !b.time) {
        return a.member.name.localeCompare(b.member.name, "ko");
      }
      if (!a.time) return 1;
      if (!b.time) return -1;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
}

export async function fetchWeekSchedules(supabase: SupabaseBrowserClient) {
  const today = getTodayDateString();
  const weekEnd = addDaysToDateString(today, 6);

  const { data, error } = await supabase
    .from("schedules")
    .select("*, members(name)")
    .gte("schedule_date", today)
    .lte("schedule_date", weekEnd)
    .order("schedule_date", { ascending: true })
    .order("schedule_time", { ascending: true });

  if (error) {
    throw error;
  }

  const reservations = (data ?? []).map((row) =>
    mapScheduleRow(
      row,
      (row.members as { name: string } | null)?.name ?? "회원",
    ),
  );

  return groupReservationsByDate(reservations);
}

export async function fetchTodayScheduleCount(
  supabase: SupabaseBrowserClient,
) {
  const today = getTodayDateString();

  const { count, error } = await supabase
    .from("schedules")
    .select("*", { count: "exact", head: true })
    .eq("schedule_date", today);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function createScheduleWithMessage(
  supabase: SupabaseBrowserClient,
  memberId: string,
  trainerId: string,
  date: string,
  time: string,
) {
  const { data: schedule, error: scheduleError } = await supabase
    .from("schedules")
    .insert({
      member_id: memberId,
      trainer_id: trainerId,
      schedule_date: date,
      schedule_time: `${time}:00`,
      status: "confirmed",
    })
    .select("*")
    .single();

  if (scheduleError) {
    throw scheduleError;
  }

  const { error: messageError } = await supabase.from("messages").insert({
    member_id: memberId,
    trainer_id: trainerId,
    sender: "trainer",
    content: formatReservationChatMessage(date, time),
  });

  if (messageError) {
    throw messageError;
  }

  const { data: member } = await supabase
    .from("members")
    .select("name")
    .eq("id", memberId)
    .single();

  return mapScheduleRow(schedule, member?.name ?? "회원");
}
