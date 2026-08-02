import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.ADMIN_AWS_REGION ?? "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.ADMIN_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ADMIN_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.ADMIN_S3_BUCKET!;
const KEY = "content.json";
const EMPTY = { photos: [], videos: [] };

async function readContent() {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: KEY }));
    const body = await res.Body!.transformToString();
    return JSON.parse(body);
  } catch {
    return EMPTY;
  }
}

// GET is used only by admin page — POST-only to avoid static export conflicts.
// Evidence page reads content.json directly from CloudFront, not this route.
export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // { action: "read" } → return current content without writing
  if (body.action === "read") {
    return NextResponse.json(await readContent());
  }

  // { action: "write", content: {...} } → save to S3
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: KEY,
      Body: JSON.stringify(body.content),
      ContentType: "application/json",
    })
  );
  return NextResponse.json({ ok: true });
}
