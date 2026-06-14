import type { Database } from "./database.types";
import type {
  ChatMessage,
  Member,
  Reservation,
  WorkoutRecord,
} from "./types";

type MemberRow = Database["public"]["Tables"]["members"]["Row"];
type WorkoutRow = Database["public"]["Tables"]["workout_records"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ScheduleRow = Database["public"]["Tables"]["schedules"]["Row"];
type TrainerRow = Database["public"]["Tables"]["trainers"]["Row"];

export function mapTrainerRow(row: TrainerRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
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
    workoutRecords,
  };
}

export function mapWorkoutRow(row: WorkoutRow): WorkoutRecord {
  return {
    id: row.id,
    date: row.record_date,
    content: row.content ?? undefined,
    title: row.title ?? undefined,
    duration: row.duration ?? undefined,
    exercises: row.exercises ?? undefined,
    note: row.note ?? undefined,
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
  };
}
