import type { Metadata } from "next";
import { issues } from "@/lib/data";

export const metadata: Metadata = {
  title: "問題点",
  description: "稲毛海浜公園多目的広場問題における5つの疑問点",
};

export default function FactsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">問題点</h1>
        <p className="text-gray-600 leading-relaxed max-w-2xl">
          感情論ではなく、事実と論理に基づいた問いかけです。
          民間活用そのものへの反対ではなく、「進め方」と「透明性」の問題を問いかけています。
        </p>
      </div>

      {/* Premise */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-10">
        <h2 className="font-bold text-green-900 mb-2">私たちの立場</h2>
        <p className="text-sm text-green-800 leading-relaxed">
          株式会社ワールドパークによる公園活性化事業によって来園者が増え、公園の魅力が向上したことは評価しています。
          民間活用そのものを否定しているわけではありません。しかし、公共施設として長年利用されてきた場所を、
          十分な説明もなく徐々に商業利用へ転換していく進め方には、強い疑問を感じています。
        </p>
      </div>

      {/* Issues */}
      <div className="space-y-8">
        {issues.map((issue) => (
          <div key={issue.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#1a4d2e] px-5 py-3 flex items-center gap-3">
              <span className="bg-amber-400 text-black font-bold text-sm w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                {issue.id}
              </span>
              <h3 className="text-white font-bold">{issue.title}</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-800 font-medium mb-3">{issue.description}</p>
              <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{issue.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional context */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">駐車場不足への対応案と選択の経緯</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          運営会社担当者との面談で確認した内容によると、以下の案も検討されたとのことです。
        </p>
        <div className="space-y-3">
          {[
            {
              label: "案1：周辺駐車場との提携",
              reason: "→ 十分な台数の確保が困難なため断念",
              result: "見送り",
            },
            {
              label: "案2：千葉市地方卸売市場との提携",
              reason: "→ 来年度建替え予定のため長期利用不可として断念",
              result: "見送り",
            },
            {
              label: "案3：別の芝生エリアの駐車場化",
              reason: "→ 歩行者動線との交差など安全面から見送り",
              result: "見送り",
            },
            {
              label: "案4：多目的広場の駐車場化",
              reason: "→ 現在実施中",
              result: "実施",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex gap-3 p-4 rounded-lg border ${
                item.result === "実施"
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 self-start mt-0.5 ${
                  item.result === "実施"
                    ? "bg-red-500 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {item.result}
              </span>
              <div>
                <div className="font-medium text-gray-900 text-sm">{item.label}</div>
                <div className="text-sm text-gray-600">{item.reason}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          ※上記は運営会社担当者からの説明に基づきます。公式文書等による裏付けは確認中です。
        </p>
      </div>
    </div>
  );
}
