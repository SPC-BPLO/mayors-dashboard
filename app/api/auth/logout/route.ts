import { NextResponse } from "next/server";

export async function POST() {
  const loginUrl = process.env.MAYOR_LOGIN_URL
    || (process.env.NODE_ENV === "development" ? "http://localhost:4187" : "https://mayors-dashboard-login.vercel.app");
  const response = NextResponse.redirect(new URL("/logout", loginUrl), 303);
  response.cookies.set("mayor_session", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
