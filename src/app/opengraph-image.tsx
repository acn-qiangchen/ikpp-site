import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "稲毛海浜公園 多目的広場問題を記録する";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a4d2e",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Tag */}
        <div
          style={{
            display: "flex",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              background: "#d97706",
              color: "#000",
              fontSize: 20,
              fontWeight: 700,
              padding: "6px 16px",
              borderRadius: 6,
            }}
          >
            公共施設問題 / 千葉市美浜区
          </div>
        </div>

        {/* Main headline */}
        <div
          style={{
            color: "#ffffff",
            fontSize: 56,
            fontWeight: 900,
            lineHeight: 1.3,
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>あなたの知らないところで、</span>
          <div style={{ display: "flex" }}>
            <span>公共の芝生が</span>
            <span style={{ color: "#fbbf24" }}>駐車場</span>
            <span>になっていた。</span>
          </div>
        </div>

        {/* Sub */}
        <div
          style={{
            color: "#86efac",
            fontSize: 26,
            marginBottom: 40,
            display: "flex",
          }}
        >
          稲毛海浜公園 多目的広場問題を記録する
        </div>

        {/* Facts row */}
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { num: "20年以上", label: "の市民利用" },
            { num: "2002年", label: "FIFA W杯キャンプ地" },
            { num: "説明ゼロ", label: "で駐車場化" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "16px 24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ color: "#fbbf24", fontSize: 30, fontWeight: 800 }}>
                {item.num}
              </span>
              <span style={{ color: "#d1fae5", fontSize: 18 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
