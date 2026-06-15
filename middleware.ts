import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/login",
    "/forgot-password",
    "/cpa/:path*",
    "/cpa/login",
    "/sales-rep/:path*",
    "/sales-rep/login",
    "/dealer/:path*",
    "/dealer/login",
  ],
};
