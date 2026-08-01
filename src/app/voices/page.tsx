import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用者の声",
  description: "稲毛海浜公園多目的広場の利用者・市民からの声",
};

export default function VoicesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">利用者の声</h1>
        <p className="text-gray-600 leading-relaxed">
          20年間利用してきた利用者だけでなく、一般市民からも広く声を集めています。
          公共施設の在り方について、皆さんの意見をお聞かせください。
        </p>
      </div>

      {/* Sample voices */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">寄せられた声</h2>
        <div className="space-y-4">
          {[
            {
              text: "毎週土曜日ここでサッカーをするのが20年以上続けてきた習慣でした。張り紙一枚で突然使えなくなったことに、本当に驚いています。",
              attr: "40代・長年の利用者",
            },
            {
              text: "公共の公園なのに、気づいたら有料施設だらけになっている。子どもたちが無料で遊べる場所が少なくなっている気がします。",
              attr: "30代・近隣住民",
            },
            {
              text: "W杯のキャンプ地だったあの芝生が駐車場になっているとは知らなかった。もっと多くの人に知ってほしい。",
              attr: "50代・千葉市民",
            },
          ].map((voice, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="text-gray-800 leading-relaxed mb-3 italic">&ldquo;{voice.text}&rdquo;</div>
              <div className="text-sm text-gray-500">— {voice.attr}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          ※掲載にあたり内容を一部編集しています。個人を特定できる情報は掲載しておりません。
        </p>
      </section>

      {/* Submission form */}
      <section className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">声を送る</h2>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          この問題についてお感じのことをお聞かせください。
          いただいた内容は（匿名で）サイトへの掲載や、行政・メディアへの情報提供に活用させていただく場合があります。
        </p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              あなたと稲毛海浜公園の関係
            </label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]">
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
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]"
              placeholder="example@email.com"
            />
          </div>
          <div className="text-xs text-gray-500">
            ※入力いただいた内容は、このサイトの管理者のみが確認します。
            第三者への無断提供はいたしません。
          </div>
          <button
            type="submit"
            className="bg-[#1a4d2e] text-white font-bold px-6 py-2 rounded hover:bg-green-800 transition-colors"
          >
            送信する
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-4">
          ※現在バックエンド未実装のため、送信機能は準備中です。
        </p>
      </section>
    </div>
  );
}
