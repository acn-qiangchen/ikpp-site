import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
