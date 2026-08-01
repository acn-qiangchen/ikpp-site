import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl font-black text-[#1a4d2e] mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">ページが見つかりません</h1>
      <p className="text-gray-600 mb-8">
        URLが変更されたか、ページが削除された可能性があります。
      </p>
      <Link
        href="/"
        className="bg-[#1a4d2e] text-white font-bold px-6 py-3 rounded hover:bg-green-800 transition-colors"
      >
        トップページへ戻る
      </Link>
    </div>
  );
}
