import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
