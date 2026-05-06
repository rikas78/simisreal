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
  `https://www.youtubimport React, { useState, useEffect, useRef } from 'react';
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
      const r = liveRaces[i];
      return {
        embed: extractEmbedUrl(r.stream_url),
        label: r.title,
        isLive: r.status === 'live',
        commentator: r.commentator,
        streamUrl: r.stream_url,
        isFallback: false,
      };
    }
    return {
      embed: FALLBACK_VIDEOS[i % FALLBACK_VIDEOS.length],
      label: FALLBACK_LABELS[i % FALLBACK_LABELS.length],
      isLive: false,
      commentator: null,
      streamUrl: null,
      isFallback: true,
    };
  });

  const toggleFullscreen = () => {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const liveCount = liveRaces.filter(r => r.status === 'live').length;

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <Tv className="w-7 h-7 text-primary" />
            Streamwall
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {liveCount > 0
              ? <><span className="text-destructive font-semibold">{liveCount} LIVE</span> · {liveRaces.length} stream attivi</>
              : <span className="text-muted-foreground">Nessuna gara live — canale SIM is REAL in loop</span>
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout switcher */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            {LAYOUTS.map(l => {
              const Icon = l.icon;
              return (
                <button
                  key={l.key}
                  onClick={() => setLayout(l)}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all',
                    layout.key === l.key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {l.label}
                </button>
              );
            })}
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            title="Fullscreen"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Wall */}
      <div className={cn('grid gap-2', layout.cols)} style={{ height: 'calc(100vh - 180px)' }}>
        {slots.map((slot, i) => (
          <SlotCard
            key={i}import React, { useState, useEffect, useRef } from 'react';
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
      const r = liveRaces[i];
      return {
        embed: extractEmbedUrl(r.stream_url),
        label: r.title,
        isLive: r.status === 'live',
        commentator: r.commentator,
        streamUrl: r.stream_url,
        isFallback: false,
      };
    }
    return {
      embed: FALLBACK_VIDEOS[i % FALLBACK_VIDEOS.length],
      label: FALLBACK_LABELS[i % FALLBACK_LABELS.length],
      isLive: false,
      commentator: null,
      streamUrl: null,
      isFallback: true,
    };
  });

  const toggleFullscreen = () => {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const liveCount = liveRaces.filter(r => r.status === 'live').length;

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <Tv className="w-7 h-7 text-primary" />
            Streamwall
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {liveCount > 0
              ? <><span className="text-destructive font-semibold">{liveCount} LIVE</span> · {liveRaces.length} stream attivi</>
              : <span className="text-muted-foreground">Nessuna gara live — canale SIM is REAL in loop</span>
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout switcher */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            {LAYOUTS.map(l => {
              const Icon = l.icon;
              return (
                <button
                  key={l.key}
                  onClick={() => setLayout(l)}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all',
                    layout.key === l.key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {l.label}
                </button>
              );
            })}
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
            title="Fullscreen"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Wall */}
      <div className={cn('grid gap-2', layout.cols)} style={{ height: 'calc(100vh - 180px)' }}>
        {slots.map((slot, i) => (
          <SlotCard
            keimport React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Search, Users, Trophy, Plus, ChevronRight, Crown, Flag, Check, X, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import CreateTeamModal from '@/components/teams/CreateTeamModal';
import TeamManagerDashboard from '@/components/teams/TeamManagerDashboard';
import TeamStats from '@/components/teams/TeamStats';

const categoryColors = {
  START: 'text-muted-foreground', ROOKIE: 'text-blue-400', AMATEUR: 'text-cyan-400',
  'SEMI-PRO': 'text-accent', PRO: 'text-green-400', K: 'text-purple-400',
};

export default function Teams() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [requestingTeam, setRequestingTeam] = useState(null);

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-total_points', 100),
  });
  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list('-total_points', 200),
  });
  const { data: teamRequests = [] } = useQuery({
    queryKey: ['team-requests'],
    queryFn: () => base44.entities.TeamRequest.list('-created_date', 100),
  });
  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list(),
  });

  const myPilot = pilots.find(p => p.created_by === me?.email);
  const myTeam = teams.find(t => t.id === myPilot?.team_id);
  const isManager = myTeam?.manager_id === myPilot?.id;

  const sendRequestMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-requests'] });
      setRequestingTeam(null);
      setRequestMsg('');
      toast.success('Richiesta inviata!');
    },
  });

  const handleSendRequest = (team) => {
    if (!myPilot) return toast.error('Crea prima il tuo profilo pilota');
    const alreadySent = teamRequests.find(r => r.team_id === team.id && r.pilot_id === myPilot.id && r.status === 'pending');
    if (alreadySent) return toast.error('Hai già una richiesta in attesa');
    sendRequestMutation.mutate({
      team_id: team.id,
      team_name: team.name,
      pilot_id: myPilot.id,
      pilot_username: myPilot.username,
      message: requestMsg,
    });
  };

  // Build standings with pilots per team
  const teamStandings = useMemo(() => {
    return [...teams]
      .map(team => {
        const members = pilots.filter(p => p.team_id === team.id);
        const totalPts = members.reduce((s, p) => s + (p.total_points || 0), 0);
        return { ...team, members, computedPoints: totalPts };
      })
      .sort((a, b) => b.computedPoints - a.computedPoints);
  }, [teams, pilots]);

  const filtered = teamStandings.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.tag?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground">Scuderie</h1>
          <p className="text-muted-foreground text-sm mt-1">{teams.length} scuderie registrate</p>
        </div>
        {!myPilot?.team_id && (
          <Button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />Fonda Scuderia
          </Button>
        )}
      </div>

      <Tabs defaultValue={isManager ? 'dashboard' : 'standings'}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="standings">Classifica</TabsTrigger>
          <TabsTrigger value="stats">📊 Statistiche</TabsTrigger>
          <TabsTrigger value="teams">Tutte le Scuderie</TabsTrigger>
          {isManager && <TabsTrigger value="dashboard">Dashboard Manager</TabsTrigger>}
        </TabsList>

        {/* STANDINGS TAB */}
        <TabsContent value="standings" className="mt-5">
          <div className="racing-card bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Pos','Scuderia','Manager','Piloti','Punti Totali'].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamStandings.map((team, idx) => (
                    <tr key={team.id} className={cn(
                      "border-b border-border/40 hover:bg-secondary/10 transition-colors",
                      myTeam?.id === team.id && "bg-primary/5 border-primary/20"
                    )}>
                      <td className="px-4 py-3">
                        <span className={cn("font-heading text-sm",
                          idx === 0 ? "text-accent" : idx === 1 ? "text-muted-foreground" : idx === 2 ? "text-orange-400" : "text-muted-foreground"
                        )}>{idx + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="font-heading text-xs text-primary">{team.tag}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{team.name}</p>
                            {myTeam?.id === team.id && <span className="text-[10px] text-primary">(la tua scuderia)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{team.manager_username || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {team.members.slice(0,4).map(m => (
                            <span key={m.id} className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-foreground">{m.username}</span>
                          ))}
                          {team.members.length > 4 && <span className="text-[10px] text-muted-foreground">+{team.members.length - 4}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-heading text-base text-primary">{team.computedPoints}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TEAMS LIST TAB */}
        <TabsContent value="teams" className="mt-5">
          <div className="relative max-w-md mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca scuderia..." className="pl-10 bg-card border-border" />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="racing-card bg-card h-48 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(team => (
                <div key={team.id} className="racing-card bg-card p-5 hover:glow-primary transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="font-heading text-sm text-primary">{team.tag}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-base text-foreground truncate">{team.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Crown className="w-3 h-3" />{team.manager_username || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {team.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{team.description}</p>}
                  <div className="flex gap-2 flex-wrap mb-3">
                    {team.members.slice(0, 3).map(m => (
                      <span key={m.id} className="text-[10px] px-2 py-0.5 bg-secondary rounded-full text-foreground">{m.username}</span>
                    ))}
                    {team.members.length > 3 && <span className="text-[10px] text-muted-foreground self-center">+{team.members.length - 3}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50 mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm">{team.member_count || team.members.length || 1}</span>
                      <span className="text-xs text-muted-foreground">membri</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-accent" />
                      <span className="text-sm font-heading text-primary">{team.computedPoints}</span>
                      <span className="text-xs text-muted-foreground">pts</span>
                    </div>
                  </div>
                  {/* Request to join */}
                  {myPilot && !myPilot.team_id && myTeam?.id !== team.id && (
                    requestingTeam?.id === team.id ? (
                      <div className="space-y-2">
                        <Input
                          value={requestMsg}
                          onChange={e => setRequestMsg(e.target.value)}
                          placeholder="Messaggio di presentazione..."
                          className="text-xs bg-background border-border h-8"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSendRequest(team)} disabled={sendRequestMutation.isPending} className="bg-primary text-primary-foreground flex-1 h-7 text-xs">
                            <Send className="w-3 h-3 mr-1" />Invia
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRequestingTeam(null)} className="h-7 text-xs">Annulla</Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setRequestingTeam(team)} className="w-full h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                        Richiedi Accesso
                      </Button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* STATS TAB */}
        <TabsContent value="stats" className="mt-5">
          <TeamStats teamStandings={teamStandings} />
        </TabsContent>

        {/* MANAGER DASHBOARD */}
        {isManager && (
          <TabsContent value="dashboard" className="mt-5">
            <TeamManagerDashboard team={myTeam} pilots={pilots} teamRequests={teamRequests} races={races} myPilot={myPilot} />
          </TabsContent>
        )}
      </Tabs>

      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} myPilot={myPilot} />}
    </div>
  );
}y={i}
            {...slot}
            isFocus={focusSlot === i}
            onFocus={() => setFocusSlot(focusSlot === i ? null : i)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-destructive live-pulse" />LIVE
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted" />Replay / Archivio
        </span>
        <span>Clicca uno slot per il focus · Icona ↗ per aprire in nuova finestra</span>
      </div>
    </div>
  );
}
            {...slot}
            isFocus={focusSlot === i}
            onFocus={() => setFocusSlot(focusSlot === i ? null : i)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-destructive live-pulse" />LIVE
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted" />Replay / Archivio
        </span>
        <span>Clicca uno slot per il focus · Icona ↗ per aprire in nuova finestra</span>
      </div>
    </div>
  );
}e.com/embed/${YT2}?autoplay=1&mute=1&loop=1&playlist=${YT2}&controls=0&modestbranding=1&rel=0&start=240`,
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
 