import type { Metadata } from "next";
import EvidenceMedia from "@/components/EvidenceMedia";

export const metadata: Metadata = {
  title: "記録・証拠",
  description: "稲毛海浜公園多目的広場問題の写真・動画記録",
};

const pendingVideos = [
  {
    title: "多目的広場 現地記録（2026年8月）",
    desc: "駐車場として使用されている多目的広場の状況を記録した映像。",
    date: "2026年8月",
  },
];

const CONTENT_URL =
  process.env.NEXT_PUBLIC_CONTENT_URL ?? "https://ikpp.tink9.com/content.json";

export default function EvidencePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">記録・証拠</h1>
        <p className="text-gray-600 leading-relaxed">
          現地で撮影した写真・動画、および公式文書等の記録を掲載します。
          定期的に更新します。
        </p>
      </div>

      <EvidenceMedia pendingVideos={pendingVideos} contentUrl={CONTENT_URL} />

      {/* Documents */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">関連文書・公式情報</h2>
        <div className="space-y-3">
          {[
            {
              title: "千葉市とワールドパークの協定書",
              status: "調査中",
              note: "情報公開請求を検討中",
            },
            {
              title: "多目的広場の管理者変更に関する公文書",
              status: "調査中",
              note: "千葉市へ問い合わせ予定",
            },
            {
              title: "公園活性化事業の当初計画書",
              status: "調査中",
              note: "多目的広場の駐車場化が含まれていたかを確認中",
            },
            {
              title: "利用スケジュール変更の告知文書",
              status: "取得済み",
              note: "フェンスへの張り紙のコピー（スキャン追加予定）",
            },
          ].map((doc) => (
            <div
              key={doc.title}
              className="flex gap-4 items-start p-4 bg-white border border-gray-200 rounded-lg"
            >
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 mt-0.5 ${
                  doc.status === "取得済み"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {doc.status}
              </span>
              <div>
                <div className="font-medium text-gray-900 text-sm">{doc.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{doc.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>記録への協力をお願いします：</strong> 現地の写真・動画をお持ちの方、
        または関連する情報をお持ちの方は、<a href="/voices" className="underline">こちらのフォーム</a>からご連絡ください。
      </div>
    </div>
  );
}
