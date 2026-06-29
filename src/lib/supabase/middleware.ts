import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "../database.types";
import {
  getMemberHomePath,
  getTrainerHomePath,
  isMemberRoute,
  isPublicRoute,
  isTrainerRoute,
} from "../auth/routes";
import { resolveUserProfile } from "../auth/roles";

function missingEnvResponse() {
  return new NextResponse("Server configuration error", { status: 503 });
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;
  const isProduction = process.env.NODE_ENV === "production";

  if (!url || !anonKey) {
    if (isProduction) {
      return missingEnvResponse();
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPublicRoute(pathname)) {
    if (user && (pathname === "/login" || pathname === "/signup")) {
      const profile = await resolveUserProfile(supabase, user.id);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname =
        profile.role === "member"
          ? getMemberHomePath()
          : profile.needsOnboarding
            ? "/onboarding"
            : getTrainerHomePath();
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
  }

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const profile = await resolveUserProfile(supabase, user.id);

  if (profile.role === "unknown") {
    // 트레이너 레코드가 없는 경우 onboarding에서 생성 처리
    if (pathname === "/onboarding") return supabaseResponse;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/onboarding";
    return NextResponse.redirect(redirectUrl);
  }

  if (profile.role === "trainer" && profile.needsOnboarding && pathname !== "/onboarding") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/onboarding";
    return NextResponse.redirect(redirectUrl);
  }

  if (profile.role === "trainer" && isMemberRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getTrainerHomePath();
    return NextResponse.redirect(redirectUrl);
  }

  if (profile.role === "member" && isTrainerRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getMemberHomePath();
    return NextResponse.redirect(redirectUrl);
  }

  if (profile.role === "member" && pathname === "/onboarding") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getMemberHomePath();
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
