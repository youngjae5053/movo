export type MemberStatus = "active" | "inactive" | "paused";

export type WorkoutMediaType = "image" | "video";

export type WorkoutMedia = {
  id: string;
  url: string;
  storagePath: string;
  type: WorkoutMediaType;
  fileName?: string;
};

export type WorkoutRecord = {
  id: string;
  date: string;
  createdAt?: string;
  content?: string;
  title?: string;
  duration?: number;
  exercises?: string[];
  note?: string;
  media?: WorkoutMedia[];
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
  authUserId?: string;
  privacyConsentAt?: string;
  termsConsentAt?: string;
};

export type TrainerProfile = {
  id: string;
  name: string;
  email: string;
  centerName?: string;
  phone?: string;
  onboardingCompletedAt?: string;
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
