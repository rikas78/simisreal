import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tv, ExternalLink, Zap, Radio, Maximize2, Minimize2, Grid2x2, Grid3x3, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

// Fallback loop videos when no live races
// YouTube loop requires playlist=VIDEO_ID
const YT1 = 'WsYE68wgfpc';
const YT2 = 'yJn3bj-LgPc';
const FALLBACK_VIDEOS = [
  `https://www.youtube.com/embed/${YT1}?autoplay=1&mute=1&loop=1&playlist=${YT1}&controls=0&modestbranding=1&rel=0`,
  `https://www.youtube.com/embed/${YT2}?autoplay=1&mute=1&loop=1&playlist=${YT2}&controls=0&modestbranding=1&rel=0`,
  `https://www.youtube.com/embed/${YT1}?autoplay=1&mute=1&loop=1&playlist=${YT1}&controls=0&modestbranding=1&rel=0&start=180`,
  `https://www.youtube.com/embed/${YT2}?autoplay=1&mute=1&loop=1&playlist=${YT2}&controls=0&modestbranding=1&rel=0&start=120`,
  `https://www.youtube.com/embed/${YT1}?autoplay=1&mute=1&loop=1&playlist=${YT1}&controls=0&modestbranding=1&rel=0&start=360`,
  `https://www.youtube.com/embed/${YT2}?autoplay=1&mute=1&loop=1&playlist=${YT2}&controls=0&modestbranding=1&rel=0&start=240`,
];

const FALLBACK_LABELS = [
  'SIM is REAL — Highlights 1',
  'SIM is REAL — Highlights 2',
  'SIM is REAL — Replay 1',
  'SIM is REAL — Replay 2',
  'SIM is REAL — Best Moments 1',
  'SIM is REAL — Best Moments 2',
];

function extractEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    const id = ytMatch[1];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1&modestbranding=1&rel=0`;
  }
  const twMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
  if (twMatch) return `https://player.twitch.tv/?channel=${twMatch[1]}&parent=${window.location.hostname}&muted=true&autoplay=true`;
  return null;
}

const LAYOUTS = [
  { key: '2x2', label: '2×2', icon: Grid2x2, cols: 'grid-cols-2', count: 4 },
  { key: '3x2', label: '3×2', icon: Grid3x3, cols: 'grid-cols-3', count: 6 },
  { key: '4x2', label: '4×2', icon: LayoutGrid, cols: 'grid-cols-4', count: 8 },
];

function SlotCard({ embed, label, isLive, commentator, streamUrl, isFocus, onFocus, isMuted, onToggleMute }) {
  return (
    <div
      className={cn(
        'relative bg-black rounded overflow-hidden border transition-all duration-200 cursor-pointer group',
        isFocus ? 'border-primary shadow-lg shadow-primary/30' : 'border-border hover:border-primary/50'
      )}
      onClick={onFocus}
    >
      {embed ? (
        <iframe
          src={embed}
          className="w-full h-full absolute inset-0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <Radio className="w-6 h-6 opacity-20 mb-2" />
          <span className="text-[10px] opacity-40">Nessun segnale</span>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <p className="text-[10px] font-semibold text-white truncate">{label}</p>
        {commentator && <p className="text-[9px] text-primary">🎙 {commentator}</p>}
      </div>

      {/* Live badge */}
      {isLive && (
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-destructive px-1.5 py-0.5 rounded text-[9px] font-bold text-white pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-white live-pulse" />LIVE
        </div>
      )}

      {/* Focus indicator */}
      {isFocus && (
        <div className="absolute top-1.5 right-1.5 bg-primary/80 rounded px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground pointer-events-none">
          ▶ FOCUS
        </div>
      )}

      {streamUrl && (
        <a
          href={streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="absolute top-1.5 right-1.5 bg-black/60 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="w-3 h-3 text-white" />
        </a>
      )}
    </div>
  );
}

export default function Streamwall() {
  const [layout, setLayout] = useState(LAYOUTS[1]); // default 3×2
  const [focusSlot, setFocusSlot] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef(null);

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list('-date', 100),
    refetchInterval: 20000,
  });

  const liveRaces = races.filter(r => r.stream_shared && r.stream_url && r.status !== 'cancelled');

  // Build slots: real races first, fill rest with fallback
  const slots = Array.from({ length: layout.count }, (_, i) => {
    if (i < liveRaces.length) {
 