"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BottomNav, isTabRoute } from "@/components/BottomNav";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const showBottomNav = isTabRoute(pathname);

  return (
    <>
      <div className={showBottomNav ? "pb-16" : undefined}>{children}</div>
      {showBottomNav ? <BottomNav /> : null}
    </>
  );
}
