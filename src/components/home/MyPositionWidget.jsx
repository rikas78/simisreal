import React from 'react';
import { Trophy, TrendingUp, Award } from 'lucide-react';

export default function MyPositionWidget({ pilot, totalPilots }) {
  if (!pilot) {
    return (
      <div className="racing-card bg-card p-6 glow-accent">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="font-heading text-sm uppercase tracking-wider text-foreground">Mia Posizione</h3>
        </div>
        <p className="text-muted-foreground text-sm">Completa il tuo profilo per vedere la classifica</p>
      </div>
    );
  }

  return (
    <div className="racing-card bg-card p-6 glow-accent relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          <h3 className="font-heading text-sm uppercase tracking-wider text-foreground">Mia Posizione</h3>
        </div>

        <div className="flex items-end gap-4 mb-4">
          <span className="font-heading text-4xl text-accent">#—</span>
          <span className="text-muted-foreground text-sm mb-1">/ {totalPilots || 0} piloti</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <p className="font-heading text-lg text-foreground">{pilot.total_points || 0}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Punti</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <p className="font-heading text-lg text-foreground">{pilot.wins || 0}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Vittorie</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <p className="font-heading text-lg text-foreground">{pilot.podiums || 0}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Podi</p>
          </div>
        </div>
      </div>
    </div>
  );
}