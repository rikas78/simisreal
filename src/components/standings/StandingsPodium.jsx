import React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const categoryColors = {
  START: 'text-muted-foreground', ROOKIE: 'text-blue-400', AMATEUR: 'text-cyan-400',
  'SEMI-PRO': 'text-accent', PRO: 'text-green-400', K: 'text-purple-400',
};

const safetyColors = {
  S: 'text-green-400 bg-green-400/10 border-green-400/30',
  A: 'text-primary bg-primary/10 border-primary/30',
  B: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  C: 'text-accent bg-accent/10 border-accent/30',
  D: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  E: 'text-red-400 bg-red-400/10 border-red-400/30',
  F: 'text-destructive bg-destructive/10 border-destructive/30',
};

function PodiumCard({ pilot, position }) {
  const isFirst = position === 1;
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div className={cn(
      "racing-card bg-card p-5 text-center flex flex-col items-center",
      isFirst ? "glow-accent" : "",
      position === 2 ? "mt-4" : position === 3 ? "mt-8" : ""
    )}>
      <span className="text-2xl mb-2">{medals[position]}</span>
      <div className={cn(
        "w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center border-2",
        isFirst ? "bg-accent/20 border-accent/50" : "bg-secondary border-border"
      )}>
        {pilot.avatar_url ? (
          <img src={pilot.avatar_url} alt={pilot.username} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className={cn("font-heading text-xl", isFirst ? "text-accent" : "text-foreground")}>
            {pilot.username?.[0]?.toUpperCase()}
          </span>
        )}
      </div>

      <p className="font-heading text-sm text-foreground truncate max-w-full">{pilot.username}</p>
      {pilot.team_name && <p className="text-xs text-primary truncate">{pilot.team_name}</p>}

      <div className="flex items-center gap-2 mt-2 justify-center flex-wrap">
        <span className={cn("text-xs font-bold", categoryColors[pilot.category || 'START'])}>{pilot.category || 'START'}</span>
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", safetyColors[pilot.safety_rating || 'S'])}>
          SR: {pilot.safety_rating || 'S'}
        </Badge>
      </div>

      <p className={cn("font-heading text-2xl mt-3", isFirst ? "text-accent" : "text-primary")}>
        {pilot.total_points || 0}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">punti totali</p>

      <div className="grid grid-cols-2 gap-2 mt-3 w-full text-center">
        <div>
          <p className="text-xs font-semibold text-foreground">{pilot.wins || 0}</p>
          <p className="text-[10px] text-muted-foreground">Vitt.</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">{pilot.races_completed || 0}</p>
          <p className="text-[10px] text-muted-foreground">Gare</p>
        </div>
      </div>
    </div>
  );
}

export default function StandingsPodium({ topThree }) {
  // Display order: 2nd, 1st, 3rd
  const order = [topThree[1], topThree[0], topThree[2]];
  const positions = [2, 1, 3];

  return (
    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
      {order.map((pilot, i) =>
        pilot ? <PodiumCard key={pilot.id} pilot={pilot} position={positions[i]} /> : <div key={i} />
      )}
    </div>
  );
}