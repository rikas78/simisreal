import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, TrendingUp, Flag, Shield, Users, Star, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const CATEGORY_COLORS = {
  START: 'text-muted-foreground bg-muted/30',
  ROOKIE: 'text-blue-400 bg-blue-400/10',
  AMATEUR: 'text-cyan-400 bg-cyan-400/10',
  'SEMI-PRO': 'text-accent bg-accent/10',
  PRO: 'text-green-400 bg-green-400/10',
  K: 'text-purple-400 bg-purple-400/10',
};

const SIM_COLORS = {
  GT7: 'text-red-400', 'Assetto Corsa': 'text-orange-400',
  iRacing: 'text-blue-400', MotoGP: 'text-yellow-400'
};

function TrendIcon({ value }) {
  if (value > 0) return <ChevronUp className="w-4 h-4 text-green-400" />;
  if (value < 0) return <ChevronDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

const posColors = ['text-yellow-400', 'text-slate-300', 'text-orange-400'];

export default function WorldRanking() {
  const [simFilter, setSimFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('total_points');

  const { data: pilots = [], isLoading } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list('-total_points', 200),
  });
  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list('-date', 50),
  });
  const { data: results = [] } = useQuery({
    queryKey: ['race-results-all'],
    queryFn: () => base44.entities.RaceResult.list('-created_date', 500),
  });
  const { data: currentUser } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const myPilot = pilots.find(p => p.created_by === currentUser?.email);

  const ranked = useMemo(() => {
    let list = [...pilots];
    if (simFilter !== 'all') list = list.filter(p => p.main_simulator === simFilter);
    if (catFilter !== 'all') list = list.filter(p => p.category === catFilter);
    list.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
    return list.map((p, i) => {
      const pResults = results.filter(r => r.pilot_id === p.id);
      const recentRaces = pResults.slice(0, 5).map(r => r.position);
      return { ...p, rank: i + 1, recentRaces };
    });
  }, [pilots, simFilter, catFilter, sortBy, results]);

  const completedRaces = races.filter(r => r.status === 'completed').length;
  const totalPrizePool = results.reduce((s, r) => s + (r.total_points || 0), 0);

  const simulators = ['all', 'GT7', 'Assetto Corsa', 'iRacing', 'MotoGP'];
  const categories = ['all', 'START', 'ROOKIE', 'AMATEUR', 'SEMI-PRO', 'PRO', 'K'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <Trophy className="w-7 h-7 text-accent" /> World Ranking
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Classifiche ufficiali SIM is REAL — Stagione Corrente</p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Piloti Totali', value: pilots.length, icon: Users, color: 'text-primary' },
          { label: 'Gare Disputate', value: completedRaces, icon: Flag, color: 'text-red-400' },
          { label: 'Punti Assegnati', value: totalPrizePool, icon: Star, color: 'text-accent' },
          { label: 'Piloti PRO', value: pilots.filter(p => p.category === 'PRO' || p.category === 'K').length, icon: Shield, color: 'text-purple-400' },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="racing-card bg-card p-4 text-center">
              <Icon className={cn("w-5 h-5 mx-auto mb-1", k.color)} />
              <p className={cn("font-heading text-2xl font-black", k.color)}>{k.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* TOP 3 PODIUM */}
      {ranked.length >= 3 && (
        <div className="racing-card bg-card p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-destructive italic mb-5">🏆 Podio Stagionale</p>
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2 pb-2">
              <div className="w-12 h-12 rounded-full bg-slate-400/10 border-2 border-slate-400/30 flex items-center justify-center">
                <span className="font-black text-slate-300">{ranked[1]?.username?.[0]}</span>
              </div>
              <p className="font-heading text-xs font-black text-slate-300 italic">{ranked[1]?.username}</p>
              <p className="text-[9px] text-muted-foreground">{ranked[1]?.total_points || 0} pts</p>
              <div className="w-16 h-12 bg-slate-400/20 border border-slate-400/30 flex items-center justify-center">
                <span className="font-heading text-xl text-slate-300 font-black">2</span>
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-yellow-400/10 border-2 border-yellow-400/50 flex items-center justify-center">
                <span className="font-black text-yellow-400 text-lg">{ranked[0]?.username?.[0]}</span>
              </div>
              <p className="font-heading text-sm font-black text-yellow-400 italic">{ranked[0]?.username}</p>
              <p className="text-[9px] text-muted-foreground">{ranked[0]?.total_points || 0} pts</p>
              <div className="w-16 h-16 bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center">
                <span className="font-heading text-2xl text-yellow-400 font-black">1</span>
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center gap-2 pb-1">
              <div className="w-11 h-11 rounded-full bg-orange-400/10 border-2 border-orange-400/30 flex items-center justify-center">
                <span className="font-black text-orange-400 text-sm">{ranked[2]?.username?.[0]}</span>
              </div>
              <p className="font-heading text-xs font-black text-orange-400 italic">{ranked[2]?.username}</p>
              <p className="text-[9px] text-muted-foreground">{ranked[2]?.total_points || 0} pts</p>
              <div className="w-16 h-10 bg-orange-400/20 border border-orange-400/30 flex items-center justify-center">
                <span className="font-heading text-lg text-orange-400 font-black">3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold self-center">Sim:</span>
          {simulators.map(s => (
            <button key={s} onClick={() => setSimFilter(s)}
              className={cn("px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded border transition-colors",
                simFilter === s ? "bg-primary/10 text-primary border-primary/30" : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}>
              {s === 'all' ? 'Tutti' : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold self-center">Cat:</span>
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={cn("px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded border transition-colors",
                catFilter === c ? "bg-primary/10 text-primary border-primary/30" : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}>
              {c === 'all' ? 'Tutte' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking Table */}
      <div className="racing-card bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[
                  { label: 'Pos', key: null },
                  { label: 'Pilota', key: null },
                  { label: 'Punti', key: 'total_points' },
                  { label: 'Vittorie', key: 'wins' },
                  { label: 'Podi', key: 'podiums' },
                  { label: 'SR', key: 'safety_rating' },
                  { label: 'Recenti', key: null },
                ].map(h => (
                  <th key={h.label}
                    className={cn("text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-4 py-3",
                      h.key && "cursor-pointer hover:text-foreground transition-colors"
                    )}
                    onClick={() => h.key && setSortBy(h.key)}
                  >
                    {h.label}{h.key === sortBy && ' ↑'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((pilot, idx) => (
                <tr key={pilot.id} className={cn(
                  "border-b border-border/40 hover:bg-secondary/10 transition-colors",
                  myPilot?.id === pilot.id && "bg-primary/5"
                )}>
                  <td className="px-4 py-3">
                    <span className={cn("font-heading text-lg font-black", idx < 3 ? posColors[idx] : 'text-muted-foreground')}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-black text-foreground">{pilot.username?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          {pilot.username}
                          {myPilot?.id === pilot.id && <span className="text-[8px] text-primary font-black">(TU)</span>}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded uppercase", CATEGORY_COLORS[pilot.category] || 'text-muted-foreground')}>{pilot.category}</span>
                          <span className={cn("text-[9px] font-bold", SIM_COLORS[pilot.main_simulator])}>{pilot.main_simulator}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-heading text-base text-primary font-black">{pilot.total_points || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-yellow-400">{pilot.wins || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-foreground">{pilot.podiums || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("font-black text-sm px-2 py-0.5 rounded",
                      pilot.safety_rating === 'S' || pilot.safety_rating === 'A' ? "text-green-400 bg-green-400/10" :
                      pilot.safety_rating === 'B' ? "text-primary bg-primary/10" :
                      "text-destructive bg-destructive/10"
                    )}>{pilot.safety_rating || 'S'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {pilot.recentRaces.slice(0, 5).map((pos, i) => (
                        <span key={i} className={cn("text-[9px] w-5 h-5 flex items-center justify-center rounded font-black",
                          pos === 1 ? "bg-yellow-400/20 text-yellow-400" :
                          pos <= 3 ? "bg-orange-400/20 text-orange-400" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {pos}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}