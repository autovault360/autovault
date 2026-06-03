import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CPA_PORTAL_ROLES = new Set([
  "super_admin",
  "owner",
  "manager",
  "cpa",
]);

async function getUserRole(
  supabase: ReturnType<typeof createServerClient>,
  authUserId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  return data?.role ?? null;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;
  const isAdminAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/forgot-password");
  const isCpaAuthPage = pathname === "/cpa/login";
  const isCpaRoute = pathname.startsWith("/cpa");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  let user = null;

  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    console.warn("updateSession: auth check failed", error);
    if (isDashboardRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (isCpaRoute && !isCpaAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/cpa/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  let role: string | null = null;
  if (user) {
    role = await getUserRole(supabase, user.id);
  }

  const canAccessCpa = role ? CPA_PORTAL_ROLES.has(role) : false;
  const isCpaOnly = role === "cpa";

  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!user && isCpaRoute && !isCpaAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/cpa/login";
    return NextResponse.redirect(url);
  }

  if (user && isAdminAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = isCpaOnly ? "/cpa/dashboard" : "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isCpaAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = canAccessCpa ? "/cpa/dashboard" : "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isCpaRoute && !isCpaAuthPage && !canAccessCpa) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isDashboardRoute && isCpaOnly) {
    const url = request.nextUrl.clone();
    url.pathname = "/cpa/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
