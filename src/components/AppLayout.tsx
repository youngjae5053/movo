"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BottomNav, isTabRoute } from "@/components/BottomNav";
import { MemberBottomNav, isMemberTabRoute } from "@/components/MemberBottomNav";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const showTrainerNav = isTabRoute(pathname);
  const showMemberNav = isMemberTabRoute(pathname);

  return (
    <>
      <div className={showTrainerNav || showMemberNav ? "pb-16" : undefined}>
        {children}
      </div>
      {showTrainerNav ? <BottomNav /> : null}
      {showMemberNav ? <MemberBottomNav /> : null}
    </>
  );
}
