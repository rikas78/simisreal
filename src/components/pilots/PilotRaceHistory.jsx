import React from 'react';
import { Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

function positionColor(pos) {
  if (pos === 1) return 'text-accent font-bold';
  if (pos === 2) return 'text-muted-foreground font-semibold';
  if (pos === 3) return 'text-orange-400 font-semibold';
  return 'text-foreground';
}
function positionEmoji(pos) {
  if (pos === 1) return '🥇';
  if (pos === 2) return '🥈';
  if (pos === 3) return '🥉';
  return pos;
}

export default function PilotRaceHistory({ results, races, isLoading }) {
  return (
    <div className="racing-card bg-card overflow-hidden">
      <div className="p-5 border-b border-border flex items-center gap-2">
        <Flag className="w-4 h-4 text-primary" />
        <h2 className="font-heading text-sm uppercase tracking-wider text-muted-foreground">Storico Gare</h2>
        <span className="text-xs text-muted-foreground ml-auto">{results.length} gare</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border/50">
              {['Data', 'Gara', 'Pos.', 'Distacco', 'Pt Vel.', 'Pt Sport.', 'Tot.', 'Note'].map(h => (
                <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-4 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-secondary/50 rounded animate-pulse" /></td>)}
                </tr>
              ))
            ) : results.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">Nessuna gara disputata ancora</td></tr>
            ) : (
              results.map(result => {
                const race = races.find(r => r.id === result.race_id);
                return (
                  <tr key={result.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {race?.date ? format(parseISO(race.date), 'd MMM yy', { locale: it }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground font-medium text-xs truncate max-w-[160px]">{result.race_title || race?.title || '—'}</p>
                      {race?.track && <p className="text-[10px] text-muted-foreground">{race.track}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-sm", positionColor(result.position))}>
                        {positionEmoji(result.position)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{result.gap || '—'}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{result.speed_points || 0}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{result.sportsmanship_points ?? 10}</td>
                    <td className="px-4 py-3">
                      <span className="text-primary font-heading text-sm">{result.total_points || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px] truncate">
                      {result.penalties && <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30 mr-1">P</Badge>}
                      {result.notes || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}