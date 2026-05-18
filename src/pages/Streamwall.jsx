import React from 'react';

const YT1 = 'yJn3bj-LgPc';
const YT2 = 'yJn3bj-LgPc';

const FALLBACK_VIDEOS = [
  `https://www.youtube.com/embed/${YT1}?autoplay=1&mute=1&loop=1&playlist=${YT1}&controls=0&modestbranding=1&rel=0`,
  `https://www.youtube.com/embed/${YT2}?autoplay=1&mute=1&loop=1&playlist=${YT2}&controls=0&modestbranding=1&rel=0`
];

export default function Streamwall() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Streamwall</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FALLBACK_VIDEOS.map((url, i) => (
          <iframe
            key={i}
            className="w-full aspect-video rounded-lg"
            src={url}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ))}
      </div>
    </div>
  );
}