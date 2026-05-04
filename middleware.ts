import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}
/*
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

 
  const publicRoutes = ["/", "/login", "/register"];

  if (publicRoutes.includes(pathname)) {
   
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
    return NextResponse.next();
  }

 
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};*/