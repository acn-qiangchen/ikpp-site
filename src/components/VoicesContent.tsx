"use client";

import { useEffect, useState } from "react";
import type { PublishedVoice } from "@/lib/content-types";

const CONTENT_URL =
  process.env.NEXT_PUBLIC_CONTENT_URL ?? "https://ikpp.tink9.com/content.json";
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export default function VoicesContent() {
  const [published, setPublished] = useState<PublishedVoice[]>([]);
  const [relationship, setRelationship] = useState("");
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(CONTENT_URL)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: { voices?: PublishedVoice[] }) => setPublished(data.voices ?? []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!comment.trim()) {
      setError("コメントを入力してください。");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/voices/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relationship, comment, email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "送信に失敗しました。");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Published voices */}
      {published.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">寄せられた声</h2>
          <div className="space-y-4">
            {published.map((voice) => (
              <div
                key={voice.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
              >
                <div className="text-gray-800 leading-relaxed mb-3 italic">
                  &ldquo;{voice.comment}&rdquo;
                </div>
                <div className="text-sm text-gray-500">— {voice.attr}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            ※掲載にあたり内容を一部編集しています。個人を特定できる情報は掲載しておりません。
          </p>
        </section>
      )}

      {/* Submission form */}
      <section className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">声を送る</h2>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          この問題についてお感じのことをお聞かせください。
          いただいた内容は（匿名で）サイトへの掲載や、行政・メディアへの情報提供に活用させていただく場合があります。
        </p>

        {submitted ? (
          <div className="bg-white border border-green-300 rounded-lg p-5 text-center">
            <div className="text-green-700 font-bold text-lg mb-1">送信しました。ありがとうございます。</div>
            <div className="text-sm text-gray-500">いただいた声は管理者が確認のうえ掲載いたします。</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                あなたと稲毛海浜公園の関係
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]"
              >
                <option value="">選択してください</option>
                <option>多目的広場の利用者（サッカー・スポーツ）</option>
                <option>その他の公園利用者</option>
                <option>近隣住民</option>
                <option>千葉市民（利用経験なし）</option>
                <option>その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                コメント <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] h-28 resize-none"
                placeholder="この問題についてお感じのことをご自由にお書きください。"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス（任意・返信が必要な場合のみ）
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]"
                placeholder="example@email.com"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="text-xs text-gray-500">
              ※入力いただいた内容は、このサイトの管理者のみが確認します。
              第三者への無断提供はいたしません。
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1a4d2e] text-white font-bold px-6 py-2 rounded hover:bg-green-800 transition-colors disabled:opacity-50"
            >
              {submitting ? "送信中..." : "送信する"}
            </button>
          </form>
        )}
      </section>
    </>
  );
}
