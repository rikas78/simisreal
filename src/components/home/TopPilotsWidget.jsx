import React from 'react';
import { Crown, Medal, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const positionStyles = [
  'text-accent',
  'text-muted-foreground',
  'text-orange-400',
];

export default function TopPilotsWidget({ pilots }) {
  const topPilots = [...pilots]
    .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
    .slice(0, 5);

  return (
    <div className="racing-card bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-accent" />
        <h3 className="font-heading text-sm uppercase tracking-wider text-foreground">Top 5 Piloti</h3>
      </div>

      {topPilots.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nessun pilota registrato</p>
      ) : (
        <div className="space-y-2">
          {topPilots.map((pilot, idx) => (
            <div
              key={pilot.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                idx === 0 ? "bg-accent/5" : "bg-background/30"
              )}
            >
              <span className={cn(
                "font-heading text-lg w-8 text-center",
                idx < 3 ? positionStyles[idx] : "text-muted-foreground"
              )}>
                {idx + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-foreground">
                  {pilot.username?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{pilot.username}</p>
                <p className="text-xs text-muted-foreground">{pilot.main_simulator}</p>
              </div>
              <div className="text-right">
                <p className="font-heading text-sm text-primary">{pilot.total_points || 0}</p>
                <p className="text-[10px] uppercase text-muted-foreground">pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}