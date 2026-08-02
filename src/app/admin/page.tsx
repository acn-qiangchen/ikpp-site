"use client";

import { useEffect, useRef, useState } from "react";
import type { Content, Photo, Video } from "@/lib/content-types";
import { moveItem } from "@/lib/utils";

const EMPTY_CONTENT: Content = { photos: [], videos: [] };

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [content, setContent] = useState<Content>(EMPTY_CONTENT);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editingVideo, setEditingVideo] = useState<number | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<number | null>(null);
  const [videoDraft, setVideoDraft] = useState<Video>({ id: "", title: "", desc: "", date: "" });
  const [photoDraft, setPhotoDraft] = useState<Photo>({ url: "", title: "", date: "" });

  // Add video form
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [videoForm, setVideoForm] = useState<Video>({ id: "", title: "", desc: "", date: "" });

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
    setStatus("保存中...");
    const r = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "write", content: next }),
    });
    if (!r.ok) throw new Error("Save failed");
    setContent(next);
    setStatus("保存完了");
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
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setStatus(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function addVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!videoForm.id || !videoForm.title) return;
    try {
      const next: Content = { ...content, videos: [...content.videos, { ...videoForm }] };
      await saveContent(next);
      setVideoForm({ id: "", title: "", desc: "", date: "" });
      setShowAddVideo(false);
    } catch (err) {
      setStatus(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function deleteVideo(index: number) {
    try {
      await saveContent({ ...content, videos: content.videos.filter((_, i) => i !== index) });
    } catch (err) {
      setStatus(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function deletePhoto(index: number) {
    try {
      await saveContent({ ...content, photos: content.photos.filter((_, i) => i !== index) });
    } catch (err) {
      setStatus(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function saveVideoEdit(index: number) {
    try {
      const videos = content.videos.map((v, i) => (i === index ? videoDraft : v));
      await saveContent({ ...content, videos });
      setEditingVideo(null);
    } catch (err) {
      setStatus(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function savePhotoEdit(index: number) {
    try {
      const photos = content.photos.map((p, i) => (i === index ? photoDraft : p));
      await saveContent({ ...content, photos });
      setEditingPhoto(null);
    } catch (err) {
      setStatus(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function reorderVideo(index: number, dir: "up" | "down") {
    try {
      await saveContent({ ...content, videos: moveItem(content.videos, index, dir) });
    } catch (err) {
      setStatus(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function reorderPhoto(index: number, dir: "up" | "down") {
    try {
      await saveContent({ ...content, photos: moveItem(content.photos, index, dir) });
    } catch (err) {
      setStatus(`エラー: ${err instanceof Error ? err.message : String(err)}`);
    }
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
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">管理画面 — 証拠コンテンツ</h1>
        {status && (
          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-2 text-sm text-blue-800">
            {status}
          </div>
        )}
      </div>

      {/* ── 動画記録 ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">動画記録</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {content.videos.map((video, i) =>
            editingVideo === i ? (
              /* edit state */
              <div key={i} className="bg-white rounded-lg border border-blue-300 shadow-sm p-4 space-y-2">
                <input
                  value={videoDraft.id}
                  onChange={(e) => setVideoDraft({ ...videoDraft, id: e.target.value })}
                  placeholder="YouTube ID"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
                <input
                  value={videoDraft.title}
                  onChange={(e) => setVideoDraft({ ...videoDraft, title: e.target.value })}
                  placeholder="タイトル"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
                <input
                  value={videoDraft.date}
                  onChange={(e) => setVideoDraft({ ...videoDraft, date: e.target.value })}
                  placeholder="日付"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
                <textarea
                  value={videoDraft.desc}
                  onChange={(e) => setVideoDraft({ ...videoDraft, desc: e.target.value })}
                  placeholder="説明"
                  rows={2}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm resize-none"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => saveVideoEdit(i)}
                    className="bg-blue-600 text-white rounded px-3 py-1 text-xs font-medium hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingVideo(null)}
                    className="border border-gray-300 rounded px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              /* normal state */
              <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-900 text-sm mb-1">{video.title}</div>
                  <div className="text-xs text-gray-500 mb-1">{video.date}</div>
                  <div className="text-xs text-gray-600">{video.desc}</div>
                  <div className="flex gap-1 mt-3">
                    <button
                      onClick={() => reorderVideo(i, "up")}
                      disabled={i === 0}
                      className="border border-gray-300 rounded px-2 py-0.5 text-xs hover:bg-gray-50 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => reorderVideo(i, "down")}
                      disabled={i === content.videos.length - 1}
                      className="border border-gray-300 rounded px-2 py-0.5 text-xs hover:bg-gray-50 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => { setVideoDraft({ ...video }); setEditingVideo(i); }}
                      className="border border-gray-300 rounded px-2 py-0.5 text-xs hover:bg-gray-50"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => deleteVideo(i)}
                      className="border border-red-300 text-red-600 rounded px-2 py-0.5 text-xs hover:bg-red-50"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Add video */}
        {!showAddVideo ? (
          <button
            onClick={() => setShowAddVideo(true)}
            className="border border-dashed border-gray-400 rounded-lg w-full py-3 text-sm text-gray-500 hover:bg-gray-50"
          >
            + 動画を追加
          </button>
        ) : (
          <form onSubmit={addVideo} className="border border-gray-200 rounded-lg p-4 space-y-2 bg-gray-50">
            <input
              type="text"
              value={videoForm.id}
              onChange={(e) => setVideoForm({ ...videoForm, id: e.target.value })}
              placeholder="YouTube ID（watch?v= 以降）"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
            <input
              type="text"
              value={videoForm.title}
              onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
              placeholder="タイトル"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
            <input
              type="text"
              value={videoForm.date}
              onChange={(e) => setVideoForm({ ...videoForm, date: e.target.value })}
              placeholder="日付（例: 2026年8月）"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
            <input
              type="text"
              value={videoForm.desc}
              onChange={(e) => setVideoForm({ ...videoForm, desc: e.target.value })}
              placeholder="説明"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white rounded px-4 py-1.5 text-sm font-medium hover:bg-green-700"
              >
                追加
              </button>
              <button
                type="button"
                onClick={() => { setShowAddVideo(false); setVideoForm({ id: "", title: "", desc: "", date: "" }); }}
                className="border border-gray-300 rounded px-4 py-1.5 text-sm hover:bg-gray-100"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ── 現地写真 ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">現地写真</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {content.photos.map((photo, i) =>
            editingPhoto === i ? (
              /* edit state */
              <div key={i} className="bg-white rounded-lg border border-blue-300 shadow-sm p-4 space-y-2">
                <input
                  value={photoDraft.title}
                  onChange={(e) => setPhotoDraft({ ...photoDraft, title: e.target.value })}
                  placeholder="タイトル"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
                <input
                  value={photoDraft.date}
                  onChange={(e) => setPhotoDraft({ ...photoDraft, date: e.target.value })}
                  placeholder="日付"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => savePhotoEdit(i)}
                    className="bg-blue-600 text-white rounded px-3 py-1 text-xs font-medium hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingPhoto(null)}
                    className="border border-gray-300 rounded px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              /* normal state */
              <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <div className="aspect-video">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-900 text-sm mb-1">{photo.title}</div>
                  <div className="text-xs text-gray-500">{photo.date}</div>
                  <div className="flex gap-1 mt-3">
                    <button
                      onClick={() => reorderPhoto(i, "up")}
                      disabled={i === 0}
                      className="border border-gray-300 rounded px-2 py-0.5 text-xs hover:bg-gray-50 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => reorderPhoto(i, "down")}
                      disabled={i === content.photos.length - 1}
                      className="border border-gray-300 rounded px-2 py-0.5 text-xs hover:bg-gray-50 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => { setPhotoDraft({ ...photo }); setEditingPhoto(i); }}
                      className="border border-gray-300 rounded px-2 py-0.5 text-xs hover:bg-gray-50"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => deletePhoto(i)}
                      className="border border-red-300 text-red-600 rounded px-2 py-0.5 text-xs hover:bg-red-50"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Photo upload */}
        <div className="border border-dashed border-gray-400 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-2">写真をアップロード</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={uploadPhoto}
            className="block text-sm"
          />
        </div>
      </section>
    </div>
  );
}
