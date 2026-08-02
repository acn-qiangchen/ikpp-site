import type { Metadata } from "next";
import VoicesContent from "@/components/VoicesContent";

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

      <VoicesContent />
    </div>
  );
}
