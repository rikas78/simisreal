import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Flag, Trophy, Users, Building2, Star, Tv, ChevronRight, Zap, Settings, Vote, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Intro Splash ──────────────────────────────────────────────────────────────
function IntroSplash({ onDone }) {
  const [phase, setPhase] = useState(0); // 0=black, 1=logo, 2=claim, 3=fade

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2800);
    const t4 = setTimeout(() => onDone(), 3800);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black transition-opacity duration-700",
        phase === 3 ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      onClick={onDone}
    >
      {/* Bg texture */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 grayscale" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Logo */}
        <div className={cn("transition-all duration-700", phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-16 bg-destructive" />
            <div>
              <h1 className="font-heading text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">
                SIM <span className="text-destructive">is</span> REAL
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 mt-1">Full Paddock Platform</p>
            </div>
          </div>
        </div>

        {/* Claim */}
        <div className={cn("transition-all duration-700 delay-300", phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
          <p className="text-xl md:text-3xl font-black uppercase italic tracking-wide text-white/90 max-w-lg leading-tight">
            La tua carriera nel<br /><span className="text-destructive">motorsport professionale</span><br />inizia qui.
          </p>
        </div>

        <div className={cn("transition-all duration-500 delay-500", phase >= 2 ? "opacity-100" : "opacity-0")}>
          <p className="text-[10px] uppercase tracking-widest text-white/25 font-bold">clicca per entrare</p>
        </div>
      </div>
    </div>
  );
}

// ── Zone definitions ──────────────────────────────────────────────────────────
// Positions: 8 zones arranged in a circle around the center
// Desktop uses % positions, mobile uses a grid layout instead
const ZONES = [
  {
    id: 'circuits',
    label: 'CIRCUIT HUB',
    sublabel: 'Gare & Circuiti',
    to: '/races',
    icon: Flag,
    color: 'text-red-400',
    border: 'border-red-500/40 hover:border-red-400',
    bg: 'bg-red-500/10 hover:bg-red-500/15',
    // top center
    pos: { top: '6%', left: '50%' },
    imgUrl: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&q=60&w=300',
    description: 'Gare in programma, live e completate'
  },
  {
    id: 'standings',
    label: 'RACE CONTROL',
    sublabel: 'Classifiche',
    to: '/standings',
    icon: Trophy,
    color: 'text-yellow-400',
    border: 'border-yellow-500/40 hover:border-yellow-400',
    bg: 'bg-yellow-500/10 hover:bg-yellow-500/15',
    // top right
    pos: { top: '22%', right: '8%' },
    imgUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=60&w=300',
    description: 'World Ranking e punti campionato'
  },
  {
    id: 'teams',
    label: 'TEAM GARAGE',
    sublabel: 'Scuderie',
    to: '/teams',
    icon: Building2,
    color: 'text-cyan-400',
    border: 'border-cyan-500/40 hover:border-cyan-400',
    bg: 'bg-cyan-500/10 hover:bg-cyan-500/15',
    // bottom right
    pos: { bottom: '22%', right: '8%' },
    imgUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=60&w=300',
    description: 'Box, team manager, ingaggi'
  },
  {
    id: 'pilots',
    label: 'DRIVERS LOUNGE',
    sublabel: 'Piloti',
    to: '/pilots',
    icon: Users,
    color: 'text-green-400',
    border: 'border-green-500/40 hover:border-green-400',
    bg: 'bg-green-500/10 hover:bg-green-500/15',
    // bottom center
    pos: { bottom: '6%', left: '50%' },
    imgUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=60&w=300',
    description: 'Tutti i piloti della piattaforma'
  },
  {
    id: 'expo',
    label: 'SIM EXPO',
    sublabel: 'Hardware & Setup',
    to: '/setup',
    icon: Settings,
    color: 'text-orange-400',
    border: 'border-orange-500/40 hover:border-orange-400',
    bg: 'bg-orange-500/10 hover:bg-orange-500/15',
    // bottom left
    pos: { bottom: '22%', left: '8%' },
    imgUrl: 'https://images.unsplash.com/photo-1593642634443-44adaa06623a?auto=format&fit=crop&q=60&w=300',
    description: 'Fanatec, Logitech, setup vetture'
  },
  {
    id: 'academy',
    label: 'ACADEMY',
    sublabel: 'Carriera',
    to: '/career',
    icon: Star,
    color: 'text-purple-400',
    border: 'border-purple-500/40 hover:border-purple-400',
    bg: 'bg-purple-500/10 hover:bg-purple-500/15',
    // top left
    pos: { top: '22%', left: '8%' },
    imgUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=60&w=300',
    description: 'Cresci, scala le categorie, diventa PRO'
  },
  {
    id: 'media',
    label: 'MEDIA CENTER',
    sublabel: 'Streaming',
    to: '/streamwall',
    icon: Tv,
    color: 'text-pink-400',
    border: 'border-pink-500/40 hover:border-pink-400',
    bg: 'bg-pink-500/10 hover:bg-pink-500/15',
    // mid right
    pos: { top: '50%', right: '4%' },
    imgUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=60&w=300',
    description: 'Live, replay, broadcast'
  },
  {
    id: 'governance',
    label: 'GOVERNANCE',
    sublabel: 'Regolamenti',
    to: '/governance',
    icon: Vote,
    color: 'text-blue-400',
    border: 'border-blue-500/40 hover:border-blue-400',
    bg: 'bg-blue-500/10 hover:bg-blue-500/15',
    // mid left
    pos: { top: '50%', left: '4%' },
    imgUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=60&w=300',
    description: 'Votazioni, mozioni, regole'
  },
];

// ── Zone Card (popup on hover/click) ─────────────────────────────────────────
function ZoneNode({ zone, active, onClick }) {
  const Icon = zone.icon;
  // Build style from pos object (top/bottom/left/right)
  const style = {};
  if (zone.pos.top !== undefined) style.top = zone.pos.top;
  if (zone.pos.bottom !== undefined) style.bottom = zone.pos.bottom;
  if (zone.pos.left !== undefined) style.left = zone.pos.left;
  if (zone.pos.right !== undefined) style.right = zone.pos.right;
  // Center horizontally if left:50%
  const isHCenter = zone.pos.left === '50%';
  const isVCenter = zone.pos.top === '50%';

  return (
    <div
      className={cn(
        "absolute cursor-pointer group z-20 flex flex-col items-center",
        isHCenter && "-translate-x-1/2",
        isVCenter && "-translate-y-1/2",
      )}
      style={style}
      onClick={() => onClick(zone)}
    >
      {/* Node */}
      <div className={cn(
        "relative w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300",
        zone.bg, zone.border,
        active ? "scale-110" : "group-hover:scale-105"
      )}>
 