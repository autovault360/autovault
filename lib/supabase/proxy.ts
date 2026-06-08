import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CPA_PORTAL_ROLES = new Set([
  "super_admin",
  "owner",
  "manager",
  "cpa",
]);

const SALES_REP_PORTAL_ROLES = new Set([
  "sales_rep",
]);

const WHOLESALE_DEALER_PORTAL_ROLES = new Set([
  "wholesale_dealer",
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
  const isSalesRepAuthPage = pathname === "/sales-rep/login";
  const isSalesRepRoute = pathname.startsWith("/sales-rep");
  const isDealerAuthPage = pathname === "/dealer/login";
  const isDealerRoute = pathname.startsWith("/dealer");

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
    if (isSalesRepRoute && !isSalesRepAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/sales-rep/login";
      return NextResponse.redirect(url);
    }
    if (isDealerRoute && !isDealerAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/dealer/login";
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
  const isSalesRep = role === "sales_rep";
  const isWholesaleDealer = role === "wholesale_dealer";

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

  if (!user && isSalesRepRoute && !isSalesRepAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/sales-rep/login";
    return NextResponse.redirect(url);
  }

  if (!user && isDealerRoute && !isDealerAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dealer/login";
    return NextResponse.redirect(url);
  }

  if (user && isAdminAuthPage) {
    const url = request.nextUrl.clone();
    if (isCpaOnly) url.pathname = "/cpa/dashboard";
    else if (isSalesRep) url.pathname = "/sales-rep/dashboard";
    else if (isWholesaleDealer) url.pathname = "/dealer/dashboard";
    else url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isCpaAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = canAccessCpa ? "/cpa/dashboard" : "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isSalesRepAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = isSalesRep ? "/sales-rep/dashboard" : "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isDealerAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = isWholesaleDealer ? "/dealer/dashboard" : "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isCpaRoute && !isCpaAuthPage && !canAccessCpa) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isSalesRepRoute && !isSalesRepAuthPage && !isSalesRep) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isDealerRoute && !isDealerAuthPage && !isWholesaleDealer) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isDashboardRoute && isCpaOnly) {
    const url = request.nextUrl.clone();
    url.pathname = "/cpa/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isDashboardRoute && isSalesRep) {
    const url = request.nextUrl.clone();
    url.pathname = "/sales-rep/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isDashboardRoute && isWholesaleDealer) {
    const url = request.nextUrl.clone();
    url.pathname = "/dealer/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
