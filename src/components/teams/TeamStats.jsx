import React, { useMemo } from 'react';
import { Trophy, Users, Flag, Euro, TrendingUp, Shield, Zap, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const COLORS = ['#00ccaa', '#ffd700', '#f97316', '#3b82f6', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#14b8a6'];

const safetyScore = { S: 100, A: 80, B: 60, C: 40, D: 20, E: 10, F: 0 };

export default function TeamStats({ teamStandings }) {
  const stats = useMemo(() => {
    return teamStandings.map((team, i) => {
      const members = team.members || [];
      const totalWins = members.reduce((s, p) => s + (p.wins || 0), 0);
      const totalPodiums = members.reduce((s, p) => s + (p.podiums || 0), 0);
      const totalRaces = members.reduce((s, p) => s + (p.races_completed || 0), 0);
      const totalEarnings = members.reduce((s, p) => s + (p.earnings || 0), 0);
      const avgSafety = members.length
        ? Math.round(members.reduce((s, p) => s + (safetyScore[p.safety_rating || 'S'] || 0), 0) / members.length)
        : 0;
      const winRate = totalRaces > 0 ? Math.round((totalWins / totalRaces) * 100) : 0;
      const podiumRate = totalRaces > 0 ? Math.round((totalPodiums / totalRaces) * 100) : 0;

      return {
        ...team,
        totalWins, totalPodiums, totalRaces, totalEarnings,
        avgSafety, winRate, podiumRate,
        color: COLORS[i % COLORS.length],
        radarData: [
          { subject: 'Velocità', value: Math.min(100, Math.round((team.computedPoints / 5))) },
          { subject: 'Vittorie', value: Math.min(100, totalWins * 7) },
          { subject: 'Podi', value: Math.min(100, podiumRate * 2) },
          { subject: 'Safety', value: avgSafety },
          { subject: 'Esperienza', value: Math.min(100, totalRaces * 2) },
          { subject: 'Guadagni', value: Math.min(100, Math.round(totalEarnings / 100)) },
        ],
      };
    });
  }, [teamStandings]);

  const topTeams = stats.slice(0, 5);

  // Bar chart data
  const pointsBarData = stats.map(t => ({ name: t.tag, pts: t.computedPoints, color: t.color }));
  const earningsBarData = stats.map(t => ({ name: t.tag, eur: t.totalEarnings, color: t.color }));

  return (
    <div className="space-y-6">

      {/* KPI cards top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.slice(0, 3).map((team, i) => (
          <div key={team.id} className={cn(
            "racing-card bg-card p-5 border",
            i === 0 ? 'border-accent/40 glow-accent' : i === 1 ? 'border-muted-foreground/30' : 'border-orange-500/30'
          )}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${team.color}20` }}>
                <span className="font-heading text-sm" style={{ color: team.color }}>{team.tag}</span>
              </div>
              <div>
                <p className="font-heading text-sm text-foreground">{team.name}</p>
                <p className="text-[10px] text-muted-foreground">#{i + 1} in campionato</p>
              </div>
              <div className="ml-auto text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-heading text-lg" style={{ color: team.color }}>{team.computedPoints}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Punti</p>
              </div>
              <div>
                <p className="font-heading text-lg text-accent">{team.totalWins}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Vittorie</p>
              </div>
              <div>
                <p className="font-heading text-lg text-foreground">{team.winRate}%</p>
                <p className="text-[10px] text-muted-foreground uppercase">Win Rate</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Points bar */}
        <div className="racing-card bg-card p-5">
          <h3 className="font-heading text-sm text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" /> Punti per Scuderia
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pointsBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#7a8299' }} />
              <YAxis tick={{ fontSize: 10, fill: '#7a8299' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(230,30%,12%)', border: '1px solid hsl(230,20%,20%)', borderRadius: 8 }}
                labelStyle={{ color: 'hsl(220,20%,95%)' }}
                itemStyle={{ color: '#00ccaa' }}
              />
              <Bar dataKey="pts" radius={[4, 4, 0, 0]}>
                {pointsBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Earnings bar */}
        <div className="racing-card bg-card p-5">
          <h3 className="font-heading text-sm text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Euro className="w-4 h-4 text-accent" /> Guadagni Totali (€)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={earningsBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#7a8299' }} />
              <YAxis tick={{ fontSize: 10, fill: '#7a8299' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(230,30%,12%)', border: '1px solid hsl(230,20%,20%)', borderRadius: 8 }}
                labelStyle={{ color: 'hsl(220,20%,95%)' }}
                formatter={(v) => [`€${v}`, 'Guadagni']}
              />
              <Bar dataKey="eur" radius={[4, 4, 0, 0]}>
                {earningsBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar top 5 */}
      <div className="racing-card bg-card p-5">
        <h3 className="font-heading text-sm text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" /> Radar Performance — Top 5 Scuderie
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {topTeams.map(team => (
            <div key={team.id} className="text-center">
              <p className="font-heading text-xs mb-2" style={{ color: team.color }}>{team.tag}</p>
              <ResponsiveContainer width="100%" height={120}>
                <RadarChart data={team.radarData}>
                  <PolarGrid stroke="hsl(230,20%,20%)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 7, fill: '#7a8299' }} />
                  <Radar dataKey="value" stroke={team.color} fill={team.color} fillOpacity={0.2} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>

      {/* Full stats table */}
      <div className="racing-card bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Scuderia','Piloti','Gare','Vittorie','Podi','Win%','Podi%','Safety Avg','Guadagni'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map(team => (
                <tr key={team.id} className="border-b border-border/40 hover:bg-secondary/10 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-xs px-1.5 py-0.5 rounded" style={{ color: team.color, backgroundColor: `${team.color}20` }}>{team.tag}</span>
                      <span className="text-foreground text-xs truncate max-w-[120px]">{team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{team.members.length}</td>
                  <td className="px-4 py-3 text-muted-foreground">{team.totalRaces}</td>
                  <td className="px-4 py-3"><span className="text-accent font-heading">{team.totalWins}</span></td>
                  <td className="px-4 py-3 text-foreground">{team.totalPodiums}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-semibold", team.winRate >= 30 ? 'text-primary' : team.winRate >= 15 ? 'text-accent' : 'text-muted-foreground')}>
                      {team.winRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{team.podiumRate}%</td>
                  <td className="px-4 py-3">
                    <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${team.avgSafety}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{team.avgSafety}/100</span>
                  </td>
                  <td className="px-4 py-3 text-accent font-heading text-sm">€{team.totalEarnings.toLocaleString('it')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}