"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/member", label: "홈" },
  { href: "/member/workouts", label: "기록" },
  { href: "/member/schedule", label: "예약" },
  { href: "/member/chat", label: "채팅" },
  { href: "/member/settings", label: "설정" },
];

export function MemberBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/member"
              ? pathname === "/member"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 py-2.5 text-center text-[11px] font-medium ${
                isActive ? "text-emerald-400" : "text-zinc-500"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export const MEMBER_TAB_ROUTES = [
  "/member",
  "/member/workouts",
  "/member/schedule",
  "/member/chat",
  "/member/settings",
];

export function isMemberTabRoute(pathname: string): boolean {
  return MEMBER_TAB_ROUTES.includes(pathname);
}
