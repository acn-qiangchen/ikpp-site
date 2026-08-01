import type { Metadata } from "next";
import { timelineEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "時系列",
  description: "稲毛海浜公園多目的広場問題の時系列記録",
};

const categoryColors: Record<string, string> = {
  history: "bg-blue-100 text-blue-800",
  change: "bg-yellow-100 text-yellow-800",
  discovery: "bg-red-100 text-red-800",
  action: "bg-green-100 text-green-800",
};

const categoryLabels: Record<string, string> = {
  history: "歴史",
  change: "変化",
  discovery: "発見",
  action: "対応",
};

export default function TimelinePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">時系列</h1>
        <p className="text-gray-600 leading-relaxed">
          稲毛海浜公園の多目的広場に何が起きたか。確認できた事実を時系列で記録します。
          事実確認中の内容は注記しています。
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <span key={key} className={`text-xs font-medium px-2 py-1 rounded ${categoryColors[key]}`}>
            {label}
          </span>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-8">
          {timelineEvents.map((event, i) => (
            <div key={i} className="relative pl-12">
              <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-[#1a4d2e] border-2 border-white ring-2 ring-[#1a4d2e]" />
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-[#1a4d2e]">{event.date}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${categoryColors[event.category]}`}>
                    {categoryLabels[event.category]}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>注記：</strong> このページの情報は現地確認・担当者への聞き取りに基づいています。
        今後の調査・情報公開請求等により内容を随時更新します。
        事実確認が取れていない項目については明記します。
      </div>
    </div>
  );
}
