import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";

    if (!isValidAdminPassword(password)) {
      return NextResponse.json({ error: "Geçersiz şifre" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE_NAME, "true", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error("Admin giriş hatası:", error);
    return NextResponse.json({ error: "Giriş başarısız" }, { status: 500 });
  }
}