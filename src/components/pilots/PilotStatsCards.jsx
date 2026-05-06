import React, { useMemo } from 'react';
import { Trophy, Target, TrendingUp, Euro, Percent, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PilotStatsCards({ pilot, results }) {
  const stats = useMemo(() => {
    if (!results.length) return null;
    const positions = results.map(r => r.position).filter(Boolean);
    const avgPos = positions.length ? (positions.reduce((s, p) => s + p, 0) / positions.length).toFixed(1) : '—';
    const avgPts = results.length ? (results.reduce((s, r) => s + (r.total_points || 0), 0) / results.length).toFixed(1) : '—';
    const winRate = results.length ? Math.round((pilot.wins || 0) / results.length * 100) : 0;
    const podiumRate = results.length ? Math.round((pilot.podiums || 0) / results.length * 100) : 0;
    return { avgPos, avgPts, winRate, podiumRate };
  }, [results, pilot]);

  const cards = [
    { label: 'Punti Totali',    value: pilot.total_points || 0,     icon: Trophy,    color: 'text-primary',    sub: `${pilot.speed_points || 0} vel. · ${pilot.sportsmanship_points || 0} sport.` },
    { label: 'Vittorie',        value: pilot.wins || 0,             icon: Award,     color: 'text-accent',     sub: `${pilot.podiums || 0} podi totali` },
    { label: 'Gare Completate', value: pilot.races_completed || 0,  icon: Target,    color: 'text-foreground', sub: stats ? `Pos. media: ${stats.avgPos}` : '—' },
    { label: 'Win Rate',        value: stats ? `${stats.winRate}%` : '—', icon: Percent, color: 'text-green-400', sub: stats ? `Podio: ${stats.podiumRate}%` : '' },
    { label: 'Guadagni',        value: `€${(pilot.earnings || 0).toLocaleString('it')}`, icon: Euro, color: 'text-accent', sub: 'premio totale' },
    { label: 'Pt Medi/Gara',    value: stats?.avgPts || '—',        icon: TrendingUp, color: 'text-primary',   sub: 'media punti per gara' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map(card => (
        <div key={card.label} className="racing-card-sm bg-card p-4 text-center">
          <card.icon className={cn("w-4 h-4 mx-auto mb-2", card.color)} />
          <p className={cn("font-heading text-lg", card.color)}>{card.value}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">{card.label}</p>
          {card.sub && <p className="text-[10px] text-muted-foreground/70 mt-1">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}