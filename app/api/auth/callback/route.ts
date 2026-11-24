import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const loginUrl = process.env.MAYOR_LOGIN_URL;
  const code = request.nextUrl.searchParams.get("code") || "";

  if (!loginUrl || code.length < 32 || code.length > 128) {
    return NextResponse.redirect(new URL(loginUrl || "/", request.url));
  }

  try {
    const exchangeResponse = await fetch(new URL("/api/auth/exchange", loginUrl), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const result = (await exchangeResponse.json()) as { token?: string };
    if (!exchangeResponse.ok || !result.token) {
      return NextResponse.redirect(new URL("/", loginUrl));
    }

    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("mayor_session", result.token, {
      httpOnly: true,
      maxAge: 8 * 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    console.error("Unable to complete the Mayor's Dashboard login handoff", error);
    return NextResponse.redirect(new URL("/", loginUrl));
  }
}
