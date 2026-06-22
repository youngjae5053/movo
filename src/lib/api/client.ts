import type { SupabaseBrowserClient } from "@/lib/supabase";
import {
  mapMemberRow,
  mapMessageRow,
  mapScheduleRow,
  mapTrainerRow,
  mapWorkoutRow,
} from "@/lib/mappers";
import {
  buildWorkoutMediaPath,
  getMediaTypeFromFile,
  WORKOUT_MEDIA_BUCKET,
} from "@/lib/storage";
import type { Member, Reservation, WorkoutRecord } from "@/lib/types";
import type { MoodValue } from "@/lib/workout";
import {
  addDaysToDateString,
  formatReservationChatMessage,
  getTodayDateString,
  groupReservationsByDate,
} from "@/lib/utils";

export type CreateWorkoutRecordInput = {
  content?: string;
  title?: string;
  duration?: number;
  bodyParts?: string[];
  mood?: MoodValue;
  files?: File[];
};

export type UpdateWorkoutRecordInput = {
  content?: string;
  title?: string;
  duration?: number;
  bodyParts?: string[];
  mood?: MoodValue;
};

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
    .select("*, workout_record_media(*)")
    .eq("member_id", memberId)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapWorkoutRow(row, supabase));
}

async function uploadWorkoutMediaFiles(
  supabase: SupabaseBrowserClient,
  trainerId: string,
  memberId: string,
  recordId: string,
  files: File[],
) {
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const storagePath = buildWorkoutMediaPath(
      trainerId,
      memberId,
      recordId,
      file.name,
    );

    const { error: uploadError } = await supabase.storage
      .from(WORKOUT_MEDIA_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { error: insertError } = await supabase
      .from("workout_record_media")
      .insert({
        workout_record_id: recordId,
        trainer_id: trainerId,
        storage_path: storagePath,
        media_type: getMediaTypeFromFile(file),
        file_name: file.name,
        mime_type: file.type || null,
        file_size: file.size,
        sort_order: index,
      });

    if (insertError) {
      throw insertError;
    }
  }
}

async function fetchWorkoutRecordById(
  supabase: SupabaseBrowserClient,
  recordId: string,
) {
  const { data, error } = await supabase
    .from("workout_records")
    .select("*, workout_record_media(*)")
    .eq("id", recordId)
    .single();

  if (error) {
    throw error;
  }

  return mapWorkoutRow(data, supabase);
}

function buildMoodNote(mood?: MoodValue) {
  if (!mood) return undefined;

  const labels: Record<MoodValue, string> = {
    great: "컨디션 최고",
    good: "컨디션 좋음",
    normal: "컨디션 보통",
    tired: "피곤함",
  };

  return labels[mood];
}

export async function createWorkoutRecord(
  supabase: SupabaseBrowserClient,
  memberId: string,
  trainerId: string,
  input: CreateWorkoutRecordInput,
): Promise<WorkoutRecord> {
  const today = getTodayDateString();
  const trimmedContent = input.content?.trim();
  const hasFiles = Boolean(input.files && input.files.length > 0);

  if (!trimmedContent && !hasFiles) {
    throw new Error("내용 또는 사진/영상을 추가해 주세요.");
  }

  const { data, error } = await supabase
    .from("workout_records")
    .insert({
      member_id: memberId,
      trainer_id: trainerId,
      record_date: today,
      content: trimmedContent || (hasFiles ? "(사진/영상 첨부)" : null),
      title: input.title?.trim() || null,
      duration: input.duration ?? null,
      exercises: input.bodyParts?.length ? input.bodyParts : null,
      note: buildMoodNote(input.mood) ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  try {
    if (input.files?.length) {
      await uploadWorkoutMediaFiles(
        supabase,
        trainerId,
        memberId,
        data.id,
        input.files,
      );
    }
  } catch (uploadError) {
    await supabase.from("workout_records").delete().eq("id", data.id);
    throw uploadError;
  }

  await supabase
    .from("members")
    .update({ last_workout_at: today })
    .eq("id", memberId);

  return fetchWorkoutRecordById(supabase, data.id);
}

export async function updateWorkoutRecord(
  supabase: SupabaseBrowserClient,
  recordId: string,
  input: UpdateWorkoutRecordInput,
) {
  const trimmedContent = input.content?.trim();

  const { error } = await supabase
    .from("workout_records")
    .update({
      content: trimmedContent || null,
      title: input.title?.trim() || null,
      duration: input.duration ?? null,
      exercises: input.bodyParts?.length ? input.bodyParts : null,
      note: buildMoodNote(input.mood) ?? null,
    })
    .eq("id", recordId);

  if (error) {
    throw error;
  }

  return fetchWorkoutRecordById(supabase, recordId);
}

export async function deleteWorkoutRecord(
  supabase: SupabaseBrowserClient,
  recordId: string,
) {
  const { data: media, error: mediaError } = await supabase
    .from("workout_record_media")
    .select("storage_path")
    .eq("workout_record_id", recordId);

  if (mediaError) {
    throw mediaError;
  }

  if (media?.length) {
    const { error: storageError } = await supabase.storage
      .from(WORKOUT_MEDIA_BUCKET)
      .remove(media.map((item) => item.storage_path));

    if (storageError) {
      throw storageError;
    }
  }

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
