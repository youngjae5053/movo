import type { SupabaseBrowserClient } from "@/lib/supabase";
import {
  mapMemberRow,
  mapMessageRow,
  mapScheduleRow,
  mapTrainerRow,
  mapWorkoutRow,
} from "@/lib/mappers";
import { attachSignedUrlsToRecords } from "@/lib/media-urls";
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

export type CreateMemberInput = Pick<
  Member,
  "name" | "age" | "phone" | "goal"
> & {
  email?: string;
  privacyConsent?: boolean;
  termsConsent?: boolean;
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
    .is("deleted_at", null)
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
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapMemberRow(data) : null;
}

export async function createMember(
  supabase: SupabaseBrowserClient,
  trainerId: string,
  input: CreateMemberInput,
) {
  const today = getTodayDateString();
  const now = new Date().toISOString();

  if (!input.privacyConsent || !input.termsConsent) {
    throw new Error("개인정보 및 이용약관 동의가 필요합니다.");
  }

  const { data, error } = await supabase
    .from("members")
    .insert({
      trainer_id: trainerId,
      name: input.name,
      email: input.email?.trim() || null,
      phone: input.phone,
      age: input.age,
      goal: input.goal,
      status: "active",
      joined_at: today,
      last_workout_at: today,
      privacy_consent_at: now,
      terms_consent_at: now,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapMemberRow(data);
}

export async function softDeleteMember(
  supabase: SupabaseBrowserClient,
  memberId: string,
) {
  const { error } = await supabase
    .from("members")
    .update({ deleted_at: new Date().toISOString(), status: "inactive" })
    .eq("id", memberId);

  if (error) {
    throw error;
  }
}

export async function fetchCurrentMemberProfile(supabase: SupabaseBrowserClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("auth_user_id", user.id)
    .is("deleted_at", null)
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
    .is("deleted_at", null)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const records = (data ?? []).map((row) => mapWorkoutRow(row));
  return attachSignedUrlsToRecords(supabase, records);
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

  const record = mapWorkoutRow(data);
  const [withUrls] = await attachSignedUrlsToRecords(supabase, [record]);
  return withUrls;
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
  const { error } = await supabase
    .from("workout_records")
    .update({ deleted_at: new Date().toISOString() })
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

export async function sendMemberMessage(
  supabase: SupabaseBrowserClient,
  memberId: string,
  content: string,
) {
  const member = await fetchCurrentMemberProfile(supabase);

  if (member.id !== memberId) {
    throw new Error("권한이 없습니다.");
  }

  const { data: memberRow } = await supabase
    .from("members")
    .select("trainer_id")
    .eq("id", memberId)
    .single();

  if (!memberRow) {
    throw new Error("회원 정보를 찾을 수 없습니다.");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      member_id: memberId,
      trainer_id: memberRow.trainer_id,
      sender: "member",
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
  reader: "trainer" | "member" = "trainer",
) {
  const senderToMark = reader === "trainer" ? "member" : "trainer";

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("member_id", memberId)
    .eq("sender", senderToMark)
    .is("read_at", null);

  if (error) {
    throw error;
  }
}

export async function fetchChatPreviews(supabase: SupabaseBrowserClient) {
  const { data, error } = await supabase.rpc("get_trainer_chat_previews");

  if (error) {
    throw error;
  }

  const members = await fetchMembers(supabase);
  const memberMap = new Map(members.map((member) => [member.id, member]));

  return (data ?? [])
    .map((row) => {
      const member = memberMap.get(row.member_id);
      if (!member) return null;

      return {
        member,
        preview: row.preview,
        time: row.sent_at ?? undefined,
        unreadCount: Number(row.unread_count ?? 0),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export async function fetchWeekSchedules(supabase: SupabaseBrowserClient) {
  const today = getTodayDateString();
  const weekEnd = addDaysToDateString(today, 6);

  const { data, error } = await supabase
    .from("schedules")
    .select("*, members(name)")
    .gte("schedule_date", today)
    .lte("schedule_date", weekEnd)
    .is("deleted_at", null)
    .is("cancelled_at", null)
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
    .eq("schedule_date", today)
    .is("deleted_at", null)
    .is("cancelled_at", null);

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
  const { data: scheduleId, error } = await supabase.rpc(
    "create_schedule_with_message",
    {
      p_member_id: memberId,
      p_trainer_id: trainerId,
      p_schedule_date: date,
      p_schedule_time: `${time}:00`,
      p_message_content: formatReservationChatMessage(date, time),
    },
  );

  if (error) {
    throw error;
  }

  const { data: schedule } = await supabase
    .from("schedules")
    .select("*")
    .eq("id", scheduleId)
    .single();

  const { data: member } = await supabase
    .from("members")
    .select("name")
    .eq("id", memberId)
    .single();

  if (!schedule) {
    throw new Error("예약을 생성하지 못했습니다.");
  }

  return mapScheduleRow(schedule, member?.name ?? "회원");
}

export async function cancelSchedule(
  supabase: SupabaseBrowserClient,
  scheduleId: string,
) {
  const { error } = await supabase
    .from("schedules")
    .update({ cancelled_at: new Date().toISOString(), status: "pending" })
    .eq("id", scheduleId);

  if (error) {
    throw error;
  }
}

export async function completeTrainerOnboarding(
  supabase: SupabaseBrowserClient,
  input: { name: string; centerName: string; phone?: string },
) {
  const trainer = await ensureTrainerProfile(supabase);

  const { data, error } = await supabase
    .from("trainers")
    .update({
      name: input.name.trim(),
      center_name: input.centerName.trim(),
      phone: input.phone?.trim() || null,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", trainer.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapTrainerRow(data);
}

export async function createMemberInvite(
  supabase: SupabaseBrowserClient,
  memberId: string,
  trainerId: string,
) {
  const { data, error } = await supabase
    .from("member_invites")
    .insert({
      member_id: memberId,
      trainer_id: trainerId,
    })
    .select("token, expires_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchMemberInviteByToken(
  supabase: SupabaseBrowserClient,
  token: string,
) {
  const { data, error } = await supabase.rpc("get_member_invite_by_token", {
    p_token: token,
  });

  if (error) {
    throw error;
  }

  return data?.[0] ?? null;
}

export async function redeemMemberInvite(
  supabase: SupabaseBrowserClient,
  token: string,
  password: string,
) {
  const invite = await fetchMemberInviteByToken(supabase, token);

  if (!invite) {
    throw new Error("유효하지 않거나 만료된 초대 링크입니다.");
  }

  const email =
    invite.member_email ??
    `${invite.member_phone.replace(/\D/g, "")}@member.movo.local`;

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: invite.member_name, role: "member" },
    },
  });

  if (signUpError || !authData.user) {
    throw signUpError ?? new Error("회원 가입에 실패했습니다.");
  }

  const { error: completeError } = await supabase.rpc("complete_member_invite", {
    p_token: token,
  });

  if (completeError) {
    throw completeError;
  }

  return { email };
}

export async function createDataRequest(
  supabase: SupabaseBrowserClient,
  input: {
    requestType: "export" | "deletion";
    requesterRole: "trainer" | "member";
    notes?: string;
  },
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  let trainerId: string | null = null;
  let memberId: string | null = null;

  if (input.requesterRole === "trainer") {
    const trainer = await ensureTrainerProfile(supabase);
    trainerId = trainer.id;
  } else {
    const member = await fetchCurrentMemberProfile(supabase);
    memberId = member.id;
    const { data: memberRow } = await supabase
      .from("members")
      .select("trainer_id")
      .eq("id", member.id)
      .single();
    trainerId = memberRow?.trainer_id ?? null;
  }

  const { error } = await supabase.from("data_requests").insert({
    requester_role: input.requesterRole,
    requester_auth_id: user.id,
    trainer_id: trainerId,
    member_id: memberId,
    request_type: input.requestType,
    notes: input.notes?.trim() || null,
  });

  if (error) {
    throw error;
  }
}

export async function fetchMemberWeekSchedules(supabase: SupabaseBrowserClient) {
  const member = await fetchCurrentMemberProfile(supabase);
  const today = getTodayDateString();
  const weekEnd = addDaysToDateString(today, 30);

  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("member_id", member.id)
    .gte("schedule_date", today)
    .lte("schedule_date", weekEnd)
    .is("deleted_at", null)
    .is("cancelled_at", null)
    .order("schedule_date", { ascending: true })
    .order("schedule_time", { ascending: true });

  if (error) {
    throw error;
  }

  const reservations = (data ?? []).map((row) =>
    mapScheduleRow(row, member.name),
  );

  return groupReservationsByDate(reservations);
}

export async function fetchMemberWorkoutRecords(supabase: SupabaseBrowserClient) {
  const member = await fetchCurrentMemberProfile(supabase);
  return fetchWorkoutRecords(supabase, member.id);
}
