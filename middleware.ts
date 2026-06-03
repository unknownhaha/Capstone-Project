import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";

import { isPublicApiPath } from "@/lib/api-public-paths";



const PUBLIC_PAGE_EXACT = ["/login", "/register", "/verify", "/forgot-password"] as const;



function isPublicPagePath(pathname: string): boolean {

  if (PUBLIC_PAGE_EXACT.includes(pathname as (typeof PUBLIC_PAGE_EXACT)[number])) {

    return true;

  }

  if (pathname.startsWith("/join/")) {

    return true;

  }

  return false;

}



export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (pathname.startsWith("/api/")) {
    if (isPublicApiPath(pathname)) {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }



  if (isPublicPagePath(pathname)) {

    if (token && pathname === "/login") {

      return NextResponse.redirect(new URL("/profile", request.url));

    }

    return NextResponse.next();

  }



  if (!token) {

    const loginUrl = new URL("/login", request.url);

    const callback = pathname + request.nextUrl.search;

    if (callback && callback !== "/login") {

      loginUrl.searchParams.set("callbackUrl", callback);

    }

    return NextResponse.redirect(loginUrl);

  }



  return NextResponse.next();

}



export const config = {

  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],

};


