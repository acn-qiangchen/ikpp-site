import Link from "next/link";
import { timelineEvents, issues } from "@/lib/data";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#1a4d2e] text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-block bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded mb-4 uppercase tracking-wide">
              公共施設問題 / 千葉市美浜区
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              あなたの知らないところで、<br />
              公共の芝生が<span className="text-amber-400">駐車場</span>になっていた。
            </h1>
            <p className="text-green-100 text-lg md:text-xl leading-relaxed mb-8">
              2002年FIFAワールドカップのキャンプ地として知られる稲毛海浜公園の天然芝多目的広場が、
              市民への十分な説明なく、プール利用者向けの臨時駐車場へ転用されています。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/timeline"
                className="bg-white text-[#1a4d2e] font-bold px-6 py-3 rounded hover:bg-green-100 transition-colors"
              >
                経緯を見る →
              </Link>
              <Link
                href="/action"
                className="bg-amber-500 text-black font-bold px-6 py-3 rounded hover:bg-amber-400 transition-colors"
              >
                この問題をシェアする
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key facts */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-4 gap-4 text-center">
            {[
              { num: "20年以上", label: "市民がサッカーを続けてきた歴史" },
              { num: "2002年", label: "FIFA W杯アイルランド代表キャンプ地" },
              { num: "土日全日", label: "2026年8月の利用不可スケジュール" },
              { num: "説明ゼロ", label: "利用者への正式な事前説明" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-[#1a4d2e] mb-1">{item.num}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What happened */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">何が起きているのか</h2>
        <p className="text-gray-500 mb-8">時系列の主要な出来事</p>
        <div className="space-y-4">
          {timelineEvents.slice(-4).map((event, i) => (
            <div key={i} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="shrink-0 w-28 text-sm font-medium text-[#1a4d2e]">{event.date}</div>
              <div>
                <div className="font-bold text-gray-900 mb-1">{event.title}</div>
                <div className="text-sm text-gray-600 leading-relaxed">{event.description}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/timeline" className="text-[#1a4d2e] font-bold hover:underline">
            全ての時系列を見る →
          </Link>
        </div>
      </section>

      {/* Key issues */}
      <section className="bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">私たちが問う5つの疑問</h2>
          <p className="text-gray-500 mb-8">感情論ではなく、事実と論理に基づいた問いかけ</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                <div className="text-amber-500 font-bold text-lg mb-1">#{issue.id}</div>
                <div className="font-bold text-gray-900 mb-2">{issue.title}</div>
                <div className="text-sm text-gray-600 leading-relaxed">{issue.description}</div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/facts" className="text-[#1a4d2e] font-bold hover:underline">
              問題点の詳細を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-14 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          この問題を知っている人を増やしてください
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          公共施設の在り方は、一部の人だけの問題ではありません。
          SNSでシェアすること、周囲に伝えることが、変化への第一歩です。
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/action"
            className="bg-[#1a4d2e] text-white font-bold px-8 py-3 rounded hover:bg-green-800 transition-colors"
          >
            アクションページへ
          </Link>
          <Link
            href="/voices"
            className="border-2 border-[#1a4d2e] text-[#1a4d2e] font-bold px-8 py-3 rounded hover:bg-green-50 transition-colors"
          >
            声を送る
          </Link>
        </div>
      </section>
    </div>
  );
}
