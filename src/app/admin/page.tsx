"use client";

import { useEffect, useRef, useState } from "react";

interface Photo {
  url: string;
  title: string;
  date: string;
}

interface Video {
  id: string;
  title: string;
  desc: string;
  date: string;
}

interface Content {
  photos: Photo[];
  videos: Video[];
}

const EMPTY_CONTENT: Content = { photos: [], videos: [] };

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [content, setContent] = useState<Content>(EMPTY_CONTENT);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Video form state
  const [videoForm, setVideoForm] = useState({ id: "", title: "", desc: "", date: "" });

  useEffect(() => {
    fetch("/api/admin/verify", { method: "POST" })
      .then((r) => {
        setAuthed(r.ok);
        if (r.ok) loadContent();
      })
      .catch(() => setAuthed(false));
  }, []);

  async function loadContent() {
    const r = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read" }),
    });
    if (r.ok) setContent(await r.json());
  }

  async function saveContent(next: Content) {
    const r = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "write", content: next }),
    });
    if (!r.ok) throw new Error("Save failed");
    setContent(next);
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const r = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      setAuthed(true);
      loadContent();
    } else {
      setLoginError("パスワードが正しくありません");
    }
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("アップロード中...");
    try {
      const urlRes = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { url, key } = await urlRes.json();

      const putRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("S3 upload failed");

      const siteBase = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ikpp.tink9.com").replace(/\/$/, "");
      const title = file.name.replace(/\.[^.]+$/, "");
      const date = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long" });
      const next: Content = {
        ...content,
        photos: [...content.photos, { url: `${siteBase}/${key}`, title, date }],
      };
      await saveContent(next);
      setStatus("アップロード完了");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setStatus(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function addVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!videoForm.id || !videoForm.title) return;
    setStatus("保存中...");
    try {
      const next: Content = {
        ...content,
        videos: [...content.videos, { ...videoForm }],
      };
      await saveContent(next);
      setVideoForm({ id: "", title: "", desc: "", date: "" });
      setStatus("保存完了");
    } catch (err) {
      setStatus(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function deletePhoto(index: number) {
    const next: Content = {
      ...content,
      photos: content.photos.filter((_, i) => i !== index),
    };
    await saveContent(next);
  }

  async function deleteVideo(index: number) {
    const next: Content = {
      ...content,
      videos: content.videos.filter((_, i) => i !== index),
    };
    await saveContent(next);
  }

  if (authed === null) {
    return <div className="p-8 text-gray-500">確認中...</div>;
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20">
        <h1 className="text-2xl font-bold mb-6">管理者ログイン</h1>
        <form onSubmit={login} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="w-full border border-gray-300 rounded px-3 py-2"
            autoFocus
          />
          {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded px-4 py-2 font-medium hover:bg-blue-700"
          >
            ログイン
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <h1 className="text-2xl font-bold">管理画面 — 証拠コンテンツ</h1>

      {status && (
        <div className="bg-blue-50 border border-blue-200 rounded px-4 py-2 text-sm text-blue-800">
          {status}
        </div>
      )}

      {/* Photo upload */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold">写真アップロード</h2>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={uploadPhoto}
          className="block"
        />

        {content.photos.length > 0 && (
          <ul className="space-y-2">
            {content.photos.map((p, i) => (
              <li key={i} className="flex items-center gap-3 bg-gray-50 rounded p-2 text-sm">
                <img src={p.url} alt={p.title} className="w-16 h-10 object-cover rounded" />
                <span className="flex-1">{p.title} ({p.date})</span>
                <button
                  onClick={() => deletePhoto(i)}
                  className="text-red-600 hover:underline text-xs"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* YouTube videos */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold">YouTube動画追加</h2>
        <form onSubmit={addVideo} className="space-y-3">
          <input
            type="text"
            value={videoForm.id}
            onChange={(e) => setVideoForm({ ...videoForm, id: e.target.value })}
            placeholder="動画ID（watch?v= 以降）"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={videoForm.title}
            onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
            placeholder="タイトル"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={videoForm.desc}
            onChange={(e) => setVideoForm({ ...videoForm, desc: e.target.value })}
            placeholder="説明"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={videoForm.date}
            onChange={(e) => setVideoForm({ ...videoForm, date: e.target.value })}
            placeholder="日付（例: 2026年8月）"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-green-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-green-700"
          >
            追加
          </button>
        </form>

        {content.videos.length > 0 && (
          <ul className="space-y-2">
            {content.videos.map((v, i) => (
              <li key={i} className="flex items-center gap-3 bg-gray-50 rounded p-2 text-sm">
                <span className="flex-1">{v.title} ({v.date}) — {v.id}</span>
                <button
                  onClick={() => deleteVideo(i)}
                  className="text-red-600 hover:underline text-xs"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
