import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { VoiceSubmission } from "@/lib/content-types";

const s3 = new S3Client({
  region: process.env.ADMIN_AWS_REGION ?? "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.ADMIN_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ADMIN_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.ADMIN_S3_BUCKET!;
const ALLOWED_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ikpp.tink9.com").replace(/\/$/, "");

function cors() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() });
}

export async function POST(req: NextRequest) {
  const { relationship, comment, email } = await req.json();

  if (!comment?.trim()) {
    return NextResponse.json(
      { error: "コメントは必須です" },
      { status: 400, headers: cors() }
    );
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = Math.random().toString(36).slice(2, 8);
  const id = `${ts}-${rand}`;

  const submission: VoiceSubmission = {
    id,
    relationship: relationship ?? "",
    comment: comment.trim(),
    email: email?.trim() ?? "",
    submittedAt: new Date().toISOString(),
  };

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `voices/${id}.json`,
      Body: JSON.stringify(submission),
      ContentType: "application/json",
    })
  );

  return NextResponse.json({ ok: true }, { headers: cors() });
}
