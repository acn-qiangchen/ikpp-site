import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.ADMIN_AWS_REGION ?? "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.ADMIN_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ADMIN_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, contentType } = await req.json();
  if (!filename || !contentType) {
    return NextResponse.json({ error: "filename and contentType required" }, { status: 400 });
  }

  const key = `media/${filename}`;
  const command = new PutObjectCommand({
    Bucket: process.env.ADMIN_S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  const siteUrl = (process.env.ADMIN_SITE_URL ?? "https://ikpp.tink9.com").replace(/\/$/, "");
  const publicUrl = `${siteUrl}/${key}`;
  return NextResponse.json({ url, key, publicUrl });
}
