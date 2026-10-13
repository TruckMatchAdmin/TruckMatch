import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        role: session.role,
        name: session.name,
      },
    });
  } catch (err: any) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
