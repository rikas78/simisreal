import React from 'react';
import { Radio, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

function LiveRaceCard({ race }) {
  return (
    <Link to={`/races?id=${race.id}`} className="racing-card-sm bg-background/50 p-4 block hover:bg-background/80 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm text-foreground">{race.title}</h4>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-destructive live-pulse" />
          <span className="text-xs font-bold text-destructive uppercase tracking-wide">LIVE</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {race.simulator}
        </span>
        <span>{race.track}</span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {race.current_participants || 0}
        </span>
      </div>
    </Link>
  );
}

export default function LiveRacesWidget({ races }) {
  const liveRaces = races.filter(r => r.status === 'live');

  return (
    <div className="racing-card bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-5 h-5 text-destructive" />
        <h3 className="font-heading text-sm uppercase tracking-wider text-foreground">Gare LIVE</h3>
        {liveRaces.length > 0 && (
          <span className="ml-auto flex items-center gap-1.5 bg-destructive/10 text-destructive text-xs font-bold px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive live-pulse" />
            {liveRaces.length} IN CORSO
          </span>
        )}
      </div>

      {liveRaces.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nessuna gara in corso al momento</p>
      ) : (
        <div className="space-y-2">
          {liveRaces.map(race => (
            <LiveRaceCard key={race.id} race={race} />
          ))}
        </div>
      )}
    </div>
  );
}