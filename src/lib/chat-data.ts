import type { ChatMessage } from "./types";

const chatMessagesByMemberId: Record<string, ChatMessage[]> = {
  "1": [
    {
      id: "c1-1",
      sender: "member",
      content: "트레이너님, 내일 하체 데이인데 무릎이 좀 불편해요.",
      sentAt: "2026-06-12T09:12:00",
    },
    {
      id: "c1-2",
      sender: "trainer",
      content:
        "알겠습니다. 내일은 스쿼트 대신 레그프레스랑 Hip thrust 위주로 진행해볼게요.",
      sentAt: "2026-06-12T09:18:00",
    },
    {
      id: "c1-3",
      sender: "member",
      content: "네, 감사합니다! 그럼 평소처럼 7시에 갈게요.",
      sentAt: "2026-06-12T09:20:00",
    },
    {
      id: "c1-4",
      sender: "trainer",
      content:
        "오늘 벤치프레스 폼 많이 좋아졌어요. 다음 주에 2.5kg 더 올려봅시다 💪",
      sentAt: "2026-06-12T18:42:00",
    },
  ],
  "2": [
    {
      id: "c2-1",
      sender: "trainer",
      content: "지호님, 이번 주 푸시 데이 루틴 공유드릴게요. 확인 부탁드려요.",
      sentAt: "2026-06-11T08:30:00",
    },
    {
      id: "c2-2",
      sender: "member",
      content: "확인했습니다! 오버헤드 프레스는 가볍게 시작하면 될까요?",
      sentAt: "2026-06-11T08:45:00",
    },
    {
      id: "c2-3",
      sender: "trainer",
      content:
        "네, 워밍업 세트 2개 먼저 하고 본 세트 들어가세요. 어깨 풀어주는 스트레칭도 꼭!",
      sentAt: "2026-06-11T08:52:00",
    },
    {
      id: "c2-4",
      sender: "member",
      content: "오늘 수업 잘 마쳤습니다. 다음엔 딥스도 도전해볼게요.",
      sentAt: "2026-06-11T19:10:00",
    },
  ],
  "3": [
    {
      id: "c3-1",
      sender: "member",
      content: "트레이너님, 여행 다녀와서 2주 정도 쉬었는데 다시 시작해도 될까요?",
      sentAt: "2026-06-10T10:05:00",
    },
    {
      id: "c3-2",
      sender: "trainer",
      content:
        "물론이죠! 무리하지 않게 가벼운 서킷부터 다시 시작해봐요. 컨디션 체크하면서 진행합시다.",
      sentAt: "2026-06-10T10:15:00",
    },
    {
      id: "c3-3",
      sender: "member",
      content: "네, 이번 주 목요일부터 가능해요!",
      sentAt: "2026-06-10T10:18:00",
    },
  ],
  "4": [
    {
      id: "c4-1",
      sender: "trainer",
      content: "현우님, 오늘 코어 운동 후 허리 불편함 없으셨나요?",
      sentAt: "2026-06-09T17:30:00",
    },
    {
      id: "c4-2",
      sender: "member",
      content: "네, 훨씬 나아졌어요. 데드버그가 특히 도움 되는 것 같아요.",
      sentAt: "2026-06-09T17:45:00",
    },
    {
      id: "c4-3",
      sender: "trainer",
      content:
        "좋습니다. 다음 세션엔 사이드 플랭크 시간 조금 늘려볼게요. 집에서도 가볍게 해보세요.",
      sentAt: "2026-06-09T17:50:00",
    },
  ],
  "5": [
    {
      id: "c5-1",
      sender: "member",
      content: "트레이너님, 개인 사정으로 잠시 운동을 쉬려고 해요.",
      sentAt: "2026-04-10T14:00:00",
    },
    {
      id: "c5-2",
      sender: "trainer",
      content:
        "알겠습니다. 재개하실 때 편하게 연락 주세요. 그때 맞춰서 루틴 다시 짜드릴게요.",
      sentAt: "2026-04-10T14:08:00",
    },
    {
      id: "c5-3",
      sender: "member",
      content: "감사합니다. 몸 관리 잘 하고 돌아올게요!",
      sentAt: "2026-04-10T14:12:00",
    },
  ],
};

export function getChatMessagesByMemberId(memberId: string): ChatMessage[] {
  return chatMessagesByMemberId[memberId] ?? [];
}
