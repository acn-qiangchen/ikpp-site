import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "最新情報",
  description: "稲毛海浜公園多目的広場問題の最新情報・アップデート",
};

const updates = [
  {
    date: "2026年8月1日",
    title: "サイトを公開しました",
    body: "稲毛海浜公園の多目的広場問題を記録・発信するサイトを公開しました。今後、現地記録・市への問い合わせ結果・利用者の声などを随時追加していきます。",
    tag: "お知らせ",
  },
  {
    date: "2026年8月（調査中）",
    title: "千葉市への問い合わせを予定",
    body: "多目的広場の管理者変更の経緯、および当初の活性化計画における駐車場化の位置づけについて、千葉市へ正式に問い合わせる予定です。結果は随時掲載します。",
    tag: "予定",
  },
  {
    date: "2026年8月（調査中）",
    title: "情報公開請求を検討中",
    body: "千葉市とワールドパークの協定書、管理委託に関する文書等の開示請求を検討しています。",
    tag: "予定",
  },
];

const tagColors: Record<string, string> = {
  お知らせ: "bg-green-100 text-green-800",
  予定: "bg-blue-100 text-blue-800",
  対応結果: "bg-purple-100 text-purple-800",
  緊急: "bg-red-100 text-red-800",
};

export default function UpdatesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">最新情報</h1>
        <p className="text-gray-600 leading-relaxed">
          調査の進捗・千葉市への問い合わせ結果・現地の状況変化などを随時更新します。
        </p>
      </div>

      <div className="space-y-6">
        {updates.map((update, i) => (
          <article key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <time className="text-sm text-gray-500">{update.date}</time>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${tagColors[update.tag] ?? "bg-gray-100 text-gray-800"}`}>
                  {update.tag}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{update.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{update.body}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
        更新情報をいち早く受け取りたい方は、
        <a href="/action" className="text-[#1a4d2e] font-bold hover:underline">SNSアカウント</a>
        のフォローをお願いします。
      </div>
    </div>
  );
}
