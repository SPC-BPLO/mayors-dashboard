import { NextRequest, NextResponse } from "next/server";

const developmentLoginUrl = "http://localhost:4187";
const productionLoginUrl = "https://mayors-dashboard-login.vercel.app";

export async function proxy(request: NextRequest) {
  const loginUrl =
    process.env.MAYOR_LOGIN_URL ||
    (process.env.NODE_ENV === "development" ? developmentLoginUrl : productionLoginUrl);

  if (
    request.nextUrl.pathname === "/api/auth/callback" ||
    request.nextUrl.pathname === "/api/auth/lock"
  ) {
    return NextResponse.next();
  }

  try {
    const sessionResponse = await fetch(new URL("/api/auth/session", loginUrl), {
      cache: "no-store",
      headers: { cookie: request.headers.get("cookie") || "" },
    });
    if (sessionResponse.ok) {
      const response = NextResponse.next();
      response.headers.set("Cache-Control", "private, no-store, no-cache, max-age=0, must-revalidate");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      return response;
    }
  } catch (error) {
    console.error("Unable to validate the Mayor's Dashboard session", error);
  }

  return NextResponse.redirect(new URL("/", loginUrl));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)"],
};
