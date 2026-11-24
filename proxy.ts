import { NextRequest, NextResponse } from "next/server";

const developmentLoginUrl = "http://localhost:4187";

export async function proxy(request: NextRequest) {
  const loginUrl = process.env.MAYOR_LOGIN_URL || (process.env.NODE_ENV === "development" ? developmentLoginUrl : "");

  // Production is left unchanged until its separately deployed login origin is
  // explicitly configured. Local development is protected by default.
  if (!loginUrl) return NextResponse.next();

  try {
    const sessionResponse = await fetch(new URL("/api/auth/session", loginUrl), {
      cache: "no-store",
      headers: { cookie: request.headers.get("cookie") || "" },
    });
    if (sessionResponse.ok) return NextResponse.next();
  } catch (error) {
    console.error("Unable to validate the Mayor's Dashboard session", error);
  }

  return NextResponse.redirect(new URL("/", loginUrl));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)"],
};
