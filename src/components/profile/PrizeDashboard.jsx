import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Euro, Trophy, CheckCircle, Clock, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function PrizeDashboard({ pilot }) {
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['race-results', pilot?.id],
    queryFn: () => base44.entities.RaceResult.filter({ pilot_id: pilot.id }),
    enabled: !!pilot?.id,
  });

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list(),
  });

  const enriched = results
    .map(r => {
      const race = races.find(rc => rc.id === r.race_id);
      // Stima premio: basata su entry_fee e posizione
      const pool = race ? Math.floor((race.entry_fee || 0) * (race.current_participants || 0) * 0.85) : 0;
      const prizes = [0.4, 0.25, 0.15, 0.1, 0.05, 0.05];
      const prize = r.position && r.position <= 6 ? Math.floor(pool * (prizes[r.position - 1] || 0)) : 0;
      return { ...r, race, estimatedPrize: prize };
    })
    .sort((a, b) => new Date(b.race?.date || 0) - new Date(a.race?.date || 0));

  const totalEarned = enriched.filter(r => r.prize_distributed).reduce((s, r) => s + r.estimatedPrize, 0);
  const totalPending = enriched.filter(r => !r.prize_distributed && r.estimatedPrize > 0).reduce((s, r) => s + r.estimatedPrize, 0);
  const totalEstimated = enriched.reduce((s, r) => s + r.estimatedPrize, 0);
  const wins = enriched.filter(r => r.position === 1).length;

  if (isLoading) return <div className="h-32 bg-secondary/20 animate-pulse rounded-lg" />;

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Guadagni Totali', value: `€${totalEstimated}`, icon: Euro, color: 'text-primary', sub: 'stimato' },
          { label: 'Pagato', value: `€${totalEarned}`, icon: CheckCircle, color: 'text-green-400', sub: 'ricevuto' },
          { label: 'In Attesa', value: `€${totalPending}`, icon: Clock, color: 'text-accent', sub: 'da ricevere' },
          { label: 'Vittorie Premi', value: wins, icon: Trophy, color: 'text-yellow-400', sub: '1° posto' },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="racing-card-sm bg-card p-4 text-center">
              <Icon className={cn("w-4 h-4 mx-auto mb-1.5", k.color)} />
              <p className={cn("font-heading text-xl font-black leading-none", k.color)}>{k.value}</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1 font-bold">{k.label}</p>
              <p className="text-[9px] text-muted-foreground/60 mt-0.5">{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Prize history table */}
      {enriched.length === 0 ? (
        <div className="p-10 text-center border border-border rounded-lg text-muted-foreground">
          <Euro className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Nessun premio ancora</p>
        </div>
      ) : (
        <div className="racing-card bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">Storico Premi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {['Gara', 'Data', 'Pos.', 'Premio Stimato', 'Stato'].map(h => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enriched.map(r => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground text-xs">{r.race_title || r.race?.title || '—'}</p>
                      <p className="text-[10px] text-muted-foreground">{r.race?.simulator || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {r.race?.date ? format(new Date(r.race.date), 'd MMM yy', { locale: it }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("font-heading text-base font-black",
                        r.position === 1 ? 'text-yellow-400' :
                        r.position === 2 ? 'text-slate-300' :
                        r.position === 3 ? 'text-orange-400' : 'text-muted-foreground'
                      )}>
                        {r.position ? `P${r.position}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("font-bold text-sm", r.estimatedPrize > 0 ? 'text-primary' : 'text-muted-foreground')}>
                        {r.estimatedPrize > 0 ? `€${r.estimatedPrize}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.estimatedPrize === 0 ? (
                        <Badge variant="outline" className="text-[9px] text-muted-foreground border-border/50">Nessun Premio</Badge>
                      ) : r.prize_distributed ? (
                        <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20">
                          <CheckCircle className="w-2.5 h-2.5 mr-1" /> Pagato
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] bg-accent/10 text-accent border-accent/20">
                          <Clock className="w-2.5 h-2.5 mr-1" /> In Attesa
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border/50 bg-secondary/20 flex flex-wrap gap-4">
            <span className="text-xs text-muted-foreground">
              💡 I premi sono calcolati sul montepremi netto (85% delle quote iscrizione × partecipanti)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}