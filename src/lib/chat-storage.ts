import type { ChatMessage, Reservation } from "./types";
import { formatReservationChatMessage } from "./utils";
import { getChatMessagesByMemberId } from "./chat-data";

const STORAGE_KEY = "movo-chat-messages";
const READ_KEY = "movo-chat-read";
export const CHAT_UPDATED_EVENT = "movo-chat-updated";

function readAllAddedMessages(): Record<string, ChatMessage[]> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {};
    }

    return JSON.parse(stored) as Record<string, ChatMessage[]>;
  } catch {
    return {};
  }
}

export function getAddedChatMessages(memberId: string): ChatMessage[] {
  return readAllAddedMessages()[memberId] ?? [];
}

export function appendChatMessage(
  memberId: string,
  message: ChatMessage,
): void {
  const all = readAllAddedMessages();
  const messages = all[memberId] ?? [];
  all[memberId] = [...messages, message];
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(CHAT_UPDATED_EVENT));
}

export function getAllChatMessages(memberId: string): ChatMessage[] {
  const seed = getChatMessagesByMemberId(memberId);
  const added = getAddedChatMessages(memberId);
  return [...seed, ...added].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  );
}

export function getLatestChatMessage(
  memberId: string,
): ChatMessage | undefined {
  return getAllChatMessages(memberId).at(-1);
}

function readLastReadMap(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = sessionStorage.getItem(READ_KEY);
    if (!stored) {
      return {};
    }

    return JSON.parse(stored) as Record<string, string>;
  } catch {
    return {};
  }
}

export function markChatAsRead(memberId: string): void {
  const map = readLastReadMap();
  map[memberId] = new Date().toISOString();
  sessionStorage.setItem(READ_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event(CHAT_UPDATED_EVENT));
}

export function getUnreadCount(memberId: string): number {
  const lastReadAt = readLastReadMap()[memberId];
  const messages = getAllChatMessages(memberId);

  return messages.filter(
    (message) =>
      message.sender === "member" &&
      (!lastReadAt || new Date(message.sentAt) > new Date(lastReadAt)),
  ).length;
}

export function appendReservationChatMessage(reservation: Reservation): void {
  const message: ChatMessage = {
    id: `chat-res-${reservation.id}`,
    sender: "trainer",
    content: formatReservationChatMessage(reservation.date, reservation.time),
    sentAt: new Date().toISOString(),
  };

  appendChatMessage(reservation.memberId, message);
}
