export const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
] as const;

export const TRAINER_ROUTES_PREFIX = [
  "/",
  "/schedule",
  "/chats",
  "/members",
  "/settings",
  "/onboarding",
] as const;

export const MEMBER_ROUTES_PREFIX = ["/member"] as const;

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number])) {
    return true;
  }

  return pathname.startsWith("/invite/");
}

export function isTrainerRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return TRAINER_ROUTES_PREFIX.some(
    (route) => route !== "/" && pathname.startsWith(route),
  );
}

export function isMemberRoute(pathname: string): boolean {
  return pathname === "/member" || pathname.startsWith("/member/");
}

export function getTrainerHomePath() {
  return "/";
}

export function getMemberHomePath() {
  return "/member";
}
