import type { Member, Trainer } from "./types";

export const trainer: Trainer = {
  name: "김민준",
  email: "trainer@movo.app",
};

export const members: Member[] = [
  {
    id: "1",
    name: "이서연",
    email: "seoyeon@email.com",
    phone: "010-1234-5678",
    age: 28,
    goal: "체지방 감량",
    status: "active",
    joinedAt: "2025-09-12",
    lastWorkoutAt: "2026-06-10",
    workoutRecords: [
      {
        id: "w1",
        date: "2026-06-10",
        title: "상체 + 유산소",
        duration: 55,
        exercises: ["벤치프레스", "랫풀다운", "사이드 레터럴 레이즈", "러닝 20분"],
        note: "벤치프레스 중량 2.5kg 증량",
      },
      {
        id: "w2",
        date: "2026-06-07",
        title: "하체",
        duration: 60,
        exercises: ["스쿼트", "루마니안 데드리프트", "레그프레스", "카프 레이즈"],
      },
      {
        id: "w3",
        date: "2026-06-03",
        title: "풀 데이",
        duration: 50,
        exercises: ["데드리프트", "시티드 로우", "페이스풀", "바이셉 컬"],
      },
    ],
  },
  {
    id: "2",
    name: "박지호",
    email: "jiho@email.com",
    phone: "010-2345-6789",
    age: 32,
    goal: "근력 향상",
    status: "active",
    joinedAt: "2025-11-03",
    lastWorkoutAt: "2026-06-11",
    workoutRecords: [
      {
        id: "w4",
        date: "2026-06-11",
        title: "푸시 데이",
        duration: 65,
        exercises: ["오버헤드 프레스", "인클라인 덤벨 프레스", "딥스", "케이블 플라이"],
        note: "오버헤드 프레스 폼 개선 필요",
      },
      {
        id: "w5",
        date: "2026-06-08",
        title: "풀 데이",
        duration: 60,
        exercises: ["풀업", "바벨 로우", "리어 델트", "해머 컬"],
      },
    ],
  },
  {
    id: "3",
    name: "최유나",
    email: "yuna@email.com",
    phone: "010-3456-7890",
    age: 25,
    goal: "체력 증진",
    status: "paused",
    joinedAt: "2026-01-20",
    lastWorkoutAt: "2026-05-28",
    workoutRecords: [
      {
        id: "w6",
        date: "2026-05-28",
        title: "서킷 트레이닝",
        duration: 45,
        exercises: ["버피", "케틀벨 스윙", "배틀로프", "플랭크"],
        note: "여행으로 2주 휴식 예정",
      },
    ],
  },
  {
    id: "4",
    name: "정현우",
    email: "hyunwoo@email.com",
    phone: "010-4567-8901",
    age: 35,
    goal: "재활 + 코어 강화",
    status: "active",
    joinedAt: "2026-02-14",
    lastWorkoutAt: "2026-06-09",
    workoutRecords: [
      {
        id: "w7",
        date: "2026-06-09",
        title: "코어 & 안정화",
        duration: 40,
        exercises: ["데드버그", "팔로프 프레스", "버드독", "사이드 플랭크"],
      },
      {
        id: "w8",
        date: "2026-06-05",
        title: "저강도 전신",
        duration: 45,
        exercises: ["고블릿 스쿼트", "밴드 풀", "힙 쓰러스트", "워밍업 걷기"],
      },
    ],
  },
  {
    id: "5",
    name: "한소희",
    email: "sohee@email.com",
    phone: "010-5678-9012",
    age: 29,
    goal: "바디 리컴포지션",
    status: "inactive",
    joinedAt: "2025-07-08",
    lastWorkoutAt: "2026-04-15",
    workoutRecords: [
      {
        id: "w9",
        date: "2026-04-15",
        title: "전신 서킷",
        duration: 50,
        exercises: ["스쿼트", "푸시업", "TRX 로우", "마운틴 클라이머"],
        note: "회원 요청으로 일시 중단",
      },
    ],
  },
];

export function getMemberById(id: string): Member | undefined {
  return members.find((member) => member.id === id);
}
