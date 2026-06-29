import type { Database } from "./database.types";
import type {
  BodyRecord,
  ChatMessage,
  Member,
  Reservation,
  SessionPackage,
  WorkoutMedia,
  WorkoutRecord,
  WorkoutTemplate,
} from "./types";

type MemberRow = Database["public"]["Tables"]["members"]["Row"];
type WorkoutRow = Database["public"]["Tables"]["workout_records"]["Row"];
type WorkoutMediaRow = Database["public"]["Tables"]["workout_record_media"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ScheduleRow = Database["public"]["Tables"]["schedules"]["Row"];
type TrainerRow = Database["public"]["Tables"]["trainers"]["Row"];
type SessionPackageRow = Database["public"]["Tables"]["session_packages"]["Row"];
type BodyRecordRow = Database["public"]["Tables"]["body_records"]["Row"];
type WorkoutTemplateRow = Database["public"]["Tables"]["workout_templates"]["Row"];

type WorkoutRowWithMedia = WorkoutRow & {
  workout_record_media?: WorkoutMediaRow[] | null;
};

export function mapTrainerRow(row: TrainerRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    centerName: row.center_name ?? undefined,
    phone: row.phone ?? undefined,
    onboardingCompletedAt: row.onboarding_completed_at ?? undefined,
  };
}

export function mapMemberRow(
  row: MemberRow,
  workoutRecords: WorkoutRecord[] = [],
): Member {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone,
    age: row.age,
    goal: row.goal,
    status: row.status,
    joinedAt: row.joined_at,
    lastWorkoutAt: row.last_workout_at ?? row.joined_at,
    authUserId: row.auth_user_id ?? undefined,
    privacyConsentAt: row.privacy_consent_at ?? undefined,
    termsConsentAt: row.terms_consent_at ?? undefined,
    workoutRecords,
  };
}

export function mapWorkoutMediaRow(row: WorkoutMediaRow): WorkoutMedia {
  return {
    id: row.id,
    url: "",
    storagePath: row.storage_path,
    type: row.media_type,
    fileName: row.file_name ?? undefined,
  };
}

export function mapWorkoutRow(row: WorkoutRowWithMedia): WorkoutRecord {
  const media = (row.workout_record_media ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => mapWorkoutMediaRow(item));

  return {
    id: row.id,
    date: row.record_date,
    createdAt: row.created_at,
    content: row.content ?? undefined,
    title: row.title ?? undefined,
    duration: row.duration ?? undefined,
    exercises: row.exercises ?? undefined,
    note: row.note ?? undefined,
    media: media.length > 0 ? media : undefined,
  };
}

export function mapMessageRow(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    sender: row.sender,
    content: row.content,
    sentAt: row.sent_at,
  };
}

export function normalizeScheduleTime(time: string): string {
  return time.slice(0, 5);
}

export function mapScheduleRow(
  row: ScheduleRow,
  memberName: string,
): Reservation {
  return {
    id: row.id,
    memberId: row.member_id,
    memberName,
    date: row.schedule_date,
    time: normalizeScheduleTime(row.schedule_time),
    status: row.status,
    attendedAt: row.attended_at ?? undefined,
  };
}

export function mapSessionPackageRow(row: SessionPackageRow): SessionPackage {
  return {
    id: row.id,
    memberId: row.member_id,
    trainerId: row.trainer_id,
    totalSessions: row.total_sessions,
    remainingSessions: row.remaining_sessions,
    price: row.price ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
    paidAt: row.paid_at ?? undefined,
    note: row.note ?? undefined,
    startedAt: row.started_at,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapBodyRecordRow(row: BodyRecordRow): BodyRecord {
  return {
    id: row.id,
    memberId: row.member_id,
    recordedAt: row.recorded_at,
    weight: row.weight ?? undefined,
    muscleMass: row.muscle_mass ?? undefined,
    bodyFatPercent: row.body_fat_percent ?? undefined,
    bmi: row.bmi ?? undefined,
    note: row.note ?? undefined,
  };
}

export function mapWorkoutTemplateRow(row: WorkoutTemplateRow): WorkoutTemplate {
  return {
    id: row.id,
    name: row.name,
    bodyParts: row.body_parts ?? undefined,
    duration: row.duration ?? undefined,
    content: row.content ?? undefined,
    sortOrder: row.sort_order,
  };
}
