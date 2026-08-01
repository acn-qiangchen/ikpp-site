import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/data";

export const metadata: Metadata = {
  title: "アクション",
  description: "稲毛海浜公園多目的広場問題 — あなたができること",
};

const shareText = encodeURIComponent(
  `2002年W杯キャンプ地だった稲毛海浜公園の天然芝が、市民への説明なく駐車場に転用されています。\n${SITE_NAME}\n`
);

export default function ActionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">あなたができること</h1>
        <p className="text-gray-600 leading-relaxed">
          この問題を広く知ってもらうことが、最初の一歩です。
          千葉市民でなくても、公共施設の問題として関心を持つすべての方に届けてください。
        </p>
      </div>

      {/* Share */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">1. SNSでシェアする</h2>
        <p className="text-gray-600 text-sm mb-4">
          このサイトをSNSでシェアすることが、最も手軽で効果的な行動です。
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=https%3A%2F%2Fikpp.example.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white font-bold px-5 py-2.5 rounded flex items-center gap-2 hover:bg-gray-800 transition-colors text-sm"
          >
            𝕏 (Twitter) でシェア
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fikpp.example.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm"
          >
            Facebook でシェア
          </a>
          <a
            href={`https://line.me/R/msg/text/?${shareText}https%3A%2F%2Fikpp.example.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white font-bold px-5 py-2.5 rounded flex items-center gap-2 hover:bg-green-600 transition-colors text-sm"
          >
            LINE でシェア
          </a>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">シェア用テキスト（コピーしてご利用ください）</div>
          <p className="text-sm text-gray-800 leading-relaxed">
            2002年W杯キャンプ地だった稲毛海浜公園の天然芝が、市民への説明なく駐車場に転用されています。
            公共施設の在り方について考えてほしい。 #稲毛海浜公園 #千葉市
          </p>
        </div>
      </section>

      {/* Contact Chiba city */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">2. 千葉市へ意見を伝える</h2>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          千葉市民の方は、市への意見・問い合わせフォームからこの問題について声を届けることができます。
          「公共施設の在り方として適切か」という観点で、行政に問いかけることが重要です。
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="font-bold text-amber-900 mb-2 text-sm">千葉市への連絡先（参考）</div>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• 千葉市 市民の声 受付窓口</li>
            <li>• 千葉市 緑政局 公園緑地部</li>
            <li>• 担当の市議会議員への相談</li>
          </ul>
          <div className="text-xs text-amber-700 mt-2">
            ※具体的なURL・連絡先は調査中です。確認次第更新します。
          </div>
        </div>
      </section>

      {/* Information */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">3. 情報・写真を提供する</h2>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          現地の写真・動画、関連情報、または証言をお持ちの方は、ぜひ提供をお願いします。
          客観的な記録を積み重ねることが、この問題を事実に基づいて伝える力になります。
        </p>
        <a
          href="/voices"
          className="inline-block bg-[#1a4d2e] text-white font-bold px-6 py-2.5 rounded hover:bg-green-800 transition-colors text-sm"
        >
          声・情報を送る →
        </a>
      </section>

      {/* Media */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">4. メディア・記者の方へ</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          この問題を取材・報道いただけるメディアの方を歓迎します。
          現地の状況確認、利用者へのインタビューのご支援が可能です。
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
          提供できる情報：時系列記録 / 現地写真 / 運営会社との面談記録 / 利用者の証言
          <br />
          <span className="text-xs text-gray-500 mt-1 block">
            連絡先：準備中（voices フォームからご連絡ください）
          </span>
        </div>
      </section>

      {/* Summary CTA */}
      <div className="bg-[#1a4d2e] text-white rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold mb-2">まずはシェアから</h3>
        <p className="text-green-100 text-sm mb-4">
          難しいことは後回しでいい。まずこのページを誰か一人に送ることから始めてください。
        </p>
        <p className="text-xs text-green-300">
          {SITE_DESCRIPTION}
        </p>
      </div>
    </div>
  );
}
