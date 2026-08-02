import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import type { Content, PublishedVoice, VoiceSubmission } from "@/lib/content-types";

const s3 = new S3Client({
  region: process.env.ADMIN_AWS_REGION ?? "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.ADMIN_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ADMIN_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.ADMIN_S3_BUCKET!;
const CONTENT_KEY = "content.json";
const EMPTY: Content = { photos: [], videos: [], voices: [] };

async function readContent(): Promise<Content> {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CONTENT_KEY }));
    const data = JSON.parse(await res.Body!.transformToString());
    return { ...EMPTY, ...data };
  } catch {
    return EMPTY;
  }
}

async function writeContent(content: Content) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: CONTENT_KEY,
      Body: JSON.stringify(content),
      ContentType: "application/json",
    })
  );
}

function auth(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  return session && session === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;

  if (action === "list") {
    const list = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: "voices/" })
    );
    const keys = (list.Contents ?? []).map((o) => o.Key!).filter((k) => k.endsWith(".json"));
    const submissions: VoiceSubmission[] = await Promise.all(
      keys.map(async (key) => {
        const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
        return JSON.parse(await res.Body!.transformToString());
      })
    );
    submissions.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    return NextResponse.json(submissions);
  }

  if (action === "delete") {
    const { id } = body as { id: string };
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: `voices/${id}.json` }));
    return NextResponse.json({ ok: true });
  }

  if (action === "publish") {
    const { id, attr } = body as { id: string; attr: string };

    const res = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: `voices/${id}.json` })
    );
    const submission: VoiceSubmission = JSON.parse(await res.Body!.transformToString());

    const content = await readContent();
    const voice: PublishedVoice = {
      id: submission.id,
      comment: submission.comment,
      attr: attr?.trim() || submission.relationship,
      publishedAt: new Date().toISOString(),
    };
    await writeContent({ ...content, voices: [...(content.voices ?? []), voice] });
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: `voices/${id}.json` }));

    return NextResponse.json({ ok: true });
  }

  if (action === "unpublish") {
    const { id } = body as { id: string };
    const content = await readContent();
    await writeContent({ ...content, voices: (content.voices ?? []).filter((v) => v.id !== id) });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
