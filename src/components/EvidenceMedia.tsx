"use client";

import { useEffect, useState } from "react";
import type { Photo, Video } from "@/lib/content-types";

interface PendingVideo {
  title: string;
  desc: string;
  date: string;
}

interface Props {
  pendingVideos: PendingVideo[];
  contentUrl: string;
}

export default function EvidenceMedia({ pendingVideos, contentUrl }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(contentUrl)
      .then((r) => (r.ok ? r.json() : { photos: [], videos: [] }))
      .then((data) => {
        setPhotos(data.photos ?? []);
        setVideos(data.videos ?? []);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [contentUrl]);

  const publishedVideos = videos.filter((v) => v.id !== "");

  return (
    <>
      {/* YouTube Videos */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">動画記録</h2>

        {!loaded && (
          <div className="text-sm text-gray-400 mb-4">読み込み中...</div>
        )}

        {publishedVideos.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {publishedVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm"
              >
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-900 text-sm mb-1">{video.title}</div>
                  <div className="text-xs text-gray-500 mb-1">{video.date}</div>
                  <div className="text-xs text-gray-600">{video.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loaded && pendingVideos.length > 0 && publishedVideos.length === 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {pendingVideos.map((video) => (
              <div
                key={video.title}
                className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-400 p-4">
                    <div className="text-4xl mb-2">▶</div>
                    <div className="text-sm">動画追加予定</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-900 text-sm mb-1">{video.title}</div>
                  <div className="text-xs text-gray-500 mb-1">{video.date}</div>
                  <div className="text-xs text-gray-600">{video.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Photos */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">現地写真</h2>

        {photos.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm"
              >
                <div className="aspect-video">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-900 text-sm mb-1">{photo.title}</div>
                  <div className="text-xs text-gray-500">{photo.date}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "多目的広場（駐車場化前）", desc: "天然芝のサッカー場として利用されていた頃の状態。（写真追加予定）" },
              { title: "多目的広場（2026年8月 駐車場化後）", desc: "プール利用者向け臨時駐車場として使用されている状態。（写真追加予定）" },
              { title: "フェンスへの張り紙", desc: "利用者への通知として掲示されたもの。説明会等は行われていない。（写真追加予定）" },
              { title: "利用スケジュール掲示", desc: "土日がほぼ全日利用不可となったスケジュール掲示。（写真追加予定）" },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-400 p-4">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-sm">写真追加予定</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-bold text-gray-900 text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-gray-600">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
