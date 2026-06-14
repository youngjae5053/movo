export type MemberStatus = "active" | "inactive" | "paused";

export type WorkoutRecord = {
  id: string;
  date: string;
  content?: string;
  title?: string;
  duration?: number;
  exercises?: string[];
  note?: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  goal: string;
  status: MemberStatus;
  joinedAt: string;
  lastWorkoutAt: string;
  workoutRecords: WorkoutRecord[];
};

export type Trainer = {
  name: string;
  email: string;
};

export type ChatSender = "trainer" | "member";

export type ChatMessage = {
  id: string;
  sender: ChatSender;
  content: string;
  sentAt: string;
};

export type ReservationStatus = "confirmed" | "pending";

export type Reservation = {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  time: string;
  status: ReservationStatus;
};
