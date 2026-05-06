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
        {/* Pulse ring */}
        <div className={cn(
          "absolute inset-0 rounded-full animate-ping opacity-10",
          zone.color.replace('text-', 'bg-')
        )} style={{ animationDuration: '3s' }} />
        <Icon className={cn("w-5 h-5 relative z-10", zone.color)} />
      </div>
      {/* Label */}
      <p className={cn("mt-1.5 text-[8px] font-black uppercase tracking-widest whitespace-nowrap", zone.color)}>
        {zone.label}
      </p>
    </div>
  );
}

// ── Center Emblem Display ─────────────────────────────────────────────────────
function CenterDisplay({ pilot, liveRaces }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        {/* Emblem */}
        <div className="relative flex items-center justify-center">
          {/* Outer ring */}
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border border-white/5 absolute" />
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border border-destructive/20 absolute" />
          {/* Inner glow circle */}
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-destructive/5 border border-destructive/30 flex items-center justify-center" style={{ boxShadow: '0 0 40px rgba(220,38,38,0.15)' }}>
            <Zap className="w-7 h-7 md:w-10 md:h-10 text-destructive opacity-80" />
          </div>
          {/* Live badge */}
          {liveRaces > 0 && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 bg-destructive text-white text-[8px] font-black uppercase tracking-widest rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {liveRaces} LIVE
            </div>
          )}
        </div>

        {/* Brand */}
        <div className="text-center">
          <p className="font-heading text-lg md:text-2xl font-black uppercase italic tracking-tight text-white/80 leading-none">
            SIM <span className="text-destructive">is</span> REAL
          </p>
          {pilot ? (
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mt-1">
              {pilot.username} · {pilot.category || 'START'}
            </p>
          ) : (
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mt-1">
              FULL PADDOCK PLATFORM
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Zone Detail Panel ─────────────────────────────────────────────────────────
function ZonePanel({ zone, onClose, races }) {
  if (!zone) return null;
  const Icon = zone.icon;
  const relevantRaces = zone.id === 'circuits'
    ? races.filter(r => r.status === 'live' || r.status === 'upcoming').slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={cn(
          "relative w-full max-w-sm bg-black border rounded-2xl overflow-hidden shadow-2xl",
          zone.border
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative h-40 overflow-hidden">
          <img src={zone.imgUrl} alt={zone.label} className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center", zone.bg, zone.border)}>
              <Icon className={cn("w-5 h-5", zone.color)} />
            </div>
            <div>
              <p className={cn("font-black text-sm uppercase italic tracking-widest", zone.color)}>{zone.label}</p>
              <p className="text-white/50 text-xs font-bold">{zone.sublabel}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-white/70 text-sm">{zone.description}</p>

          {relevantRaces.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Prossime Gare</p>
              {relevantRaces.map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/5">
                  <p className="text-sm font-bold text-white truncate flex-1">{r.title}</p>
                  <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded ml-2",
                    r.status === 'live' ? "bg-destructive text-white" : "bg-white/10 text-white/60"
                  )}>{r.status === 'live' ? '⬤ LIVE' : 'UPCOMING'}</span>
                </div>
              ))}
            </div>
          )}

          <Link
            to={zone.to}
            onClick={onClose}
            className={cn(
              "block w-full text-center py-3.5 font-black uppercase italic text-sm tracking-widest rounded-lg border transition-all",
              zone.bg, zone.border, zone.color,
              "hover:brightness-125"
            )}
          >
            ENTRA → {zone.label}
          </Link>
        </div>

        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs">✕</button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const SPLASH_KEY = 'srf_splash_seen';

export default function Home() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem(SPLASH_KEY));
  const [activeZone, setActiveZone] = useState(null);

  const { data: races = [] } = useQuery({ queryKey: ['races'], queryFn: () => base44.entities.Race.list('-date', 50) });
  const { data: pilots = [] } = useQuery({ queryKey: ['pilots'], queryFn: () => base44.entities.Pilot.list('-total_points', 50) });
  const { data: currentUser } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const myPilot = pilots.find(p => p.created_by === currentUser?.email);
  const liveCount = races.filter(r => r.status === 'live').length;

  const handleSplashDone = () => {
    sessionStorage.setItem(SPLASH_KEY, '1');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <IntroSplash onDone={handleSplashDone} />}

      {/* ── DESKTOP: Paddock Map ────────────────────────────────────────────── */}
      <div className="hidden md:block relative w-full overflow-hidden" style={{ height: 'calc(100vh - 0px)' }}>
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&q=80&w=2000"
            alt="Paddock"
            className="w-full h-full object-cover opacity-20 grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/50 to-background/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>

        {/* Zone nodes */}
        {ZONES.map(zone => (
          <ZoneNode key={zone.id} zone={zone} active={activeZone?.id === zone.id} onClick={setActiveZone} />
        ))}

        {/* Center emblem */}
        <CenterDisplay pilot={myPilot} liveRaces={liveCount} />

        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 pointer-events-none">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-destructive italic">SIM is REAL</p>
            <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Full Paddock Platform</p>
          </div>
          <div className="flex items-center gap-6">
            {liveCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-destructive">{liveCount} GARE LIVE</span>
              </div>
            )}
            <p className="text-[9px] font-black uppercase tracking-widest text-white/25">{pilots.length} PILOTI</p>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="absolute bottom-6 left-0 right-0 z-20 text-center pointer-events-none">
          <p className="text-[8px] uppercase tracking-[0.4em] text-white/10 font-bold">seleziona una zona</p>
        </div>
      </div>

      {/* ── MOBILE: Zone Grid ───────────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col min-h-screen bg-background">
        {/* Header */}
        <div className="relative overflow-hidden px-5 pt-6 pb-5 border-b border-border/50">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-black uppercase italic text-white leading-none">
                SIM <span className="text-destructive">is</span> REAL
              </h1>
              <p className="text-[8px] uppercase tracking-widest text-white/25 font-bold mt-0.5">FULL PADDOCK PLATFORM</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {liveCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-destructive">{liveCount} LIVE</span>
                </div>
              )}
              {myPilot && (
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">{myPilot.username}</p>
              )}
            </div>
          </div>
        </div>

        {/* Zone grid */}
        <div className="grid grid-cols-2 gap-3 p-4 flex-1">
          {ZONES.map(zone => {
            const Icon = zone.icon;
            return (
              <button
                key={zone.id}
                onClick={() => setActiveZone(zone)}
                className={cn(
                  "flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all",
                  zone.bg, zone.border
                )}
              >
                <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0", zone.bg, zone.border)}>
                  <Icon className={cn("w-4 h-4", zone.color)} />
                </div>
                <div>
                  <p className={cn("text-[9px] font-black uppercase tracking-widest", zone.color)}>{zone.label}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{zone.sublabel}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Profile quick access */}
        <div className="p-4 border-t border-border/50">
          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-secondary/30">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{myPilot ? myPilot.username : 'Il tuo Profilo'}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </Link>
        </div>
      </div>

      {/* Zone detail panel */}
      {activeZone && (
        <ZonePanel zone={activeZone} races={races} onClose={() => setActiveZone(null)} />
      )}
    </>
  );
}