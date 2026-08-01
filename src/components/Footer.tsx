import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-white font-bold mb-2 text-sm">このサイトについて</h3>
            <p className="text-xs leading-relaxed">
              稲毛海浜公園の多目的広場問題を、感情論ではなく事実に基づいて記録・発信するサイトです。
              公共施設の在り方について、広く市民に知ってもらうことを目的としています。
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2 text-sm">ページ一覧</h3>
            <ul className="text-xs space-y-1">
              <li><Link href="/timeline" className="hover:text-white">時系列</Link></li>
              <li><Link href="/facts" className="hover:text-white">問題点</Link></li>
              <li><Link href="/evidence" className="hover:text-white">記録・証拠</Link></li>
              <li><Link href="/voices" className="hover:text-white">利用者の声</Link></li>
              <li><Link href="/updates" className="hover:text-white">最新情報</Link></li>
              <li><Link href="/action" className="hover:text-white">アクション</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2 text-sm">免責事項</h3>
            <p className="text-xs leading-relaxed">
              掲載情報は現地確認・担当者への聞き取りに基づいています。
              事実確認中の内容については明記しています。
              誤りがある場合はご指摘ください。
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-4 text-xs text-center">
          © 2026 稲毛海浜公園多目的広場問題を記録する
        </div>
      </div>
    </footer>
  );
}
