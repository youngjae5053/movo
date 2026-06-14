import type { Member } from "./types";

const STORAGE_KEY = "movo-added-members";
const OVERRIDES_KEY = "movo-member-overrides";

export const MEMBERS_UPDATED_EVENT = "movo-members-updated";

export function getAddedMembers(): Member[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as Member[];
  } catch {
    return [];
  }
}

export function saveAddedMember(member: Member): void {
  const existing = getAddedMembers();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, member]));
  window.dispatchEvent(new Event(MEMBERS_UPDATED_EVENT));
}

export function updateAddedMember(member: Member): void {
  const existing = getAddedMembers();
  const updated = existing.map((item) =>
    item.id === member.id ? member : item,
  );
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getStoredMemberById(id: string): Member | undefined {
  return getAddedMembers().find((member) => member.id === id);
}

function getMemberOverridesMap(): Record<string, Member> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = sessionStorage.getItem(OVERRIDES_KEY);
    if (!stored) {
      return {};
    }

    return JSON.parse(stored) as Record<string, Member>;
  } catch {
    return {};
  }
}

export function applyMemberOverride(member: Member): Member {
  return getMemberOverridesMap()[member.id] ?? member;
}

export function saveMemberOverride(member: Member): void {
  const overrides = getMemberOverridesMap();
  overrides[member.id] = member;
  sessionStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));

  if (member.id.startsWith("local-")) {
    updateAddedMember(member);
  }

  window.dispatchEvent(new Event(MEMBERS_UPDATED_EVENT));
}

export function resolveMember(
  id: string,
  serverMember?: Member | null,
): Member | undefined {
  const override = getMemberOverridesMap()[id];
  if (override) {
    return override;
  }

  if (serverMember) {
    return serverMember;
  }

  return getStoredMemberById(id);
}
