import React from 'react';
import { Users, Calendar, Euro, MapPin, Zap, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

const statusConfig = {
  live:       { label: 'LIVE',       class: 'bg-destructive/15 text-destructive border-destructive/30', pulse: true },
  aperta:     { label: 'APERTA',     class: 'bg-green-500/15 text-green-400 border-green-500/30' },
  piena:      { label: 'PIENA',      class: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  prossima:   { label: 'PROSSIMA',   class: 'bg-accent/15 text-accent border-accent/30' },
  completed:  { label: 'COMPLETATA', class: 'bg-muted/50 text-muted-foreground border-border' },
  cancelled:  { label: 'CANCELLATA', class: 'bg-muted/50 text-muted-foreground border-border' },
  upcoming:   { label: 'IN PROGRAMMA', class: 'bg-primary/10 text-primary border-primary/20' },
};

const categoryColors = {
  GT3: 'text-blue-400', GT4: 'text-cyan-400', Formula: 'text-red-400',
  Rally: 'text-orange-400', Endurance: 'text-purple-400',
};

export default function RaceCard({ race, computedStatus, prizePool, onClick }) {
  const status = statusConfig[computedStatus] || statusConfig.upcoming;
  const filled = Math.min((race.current_participants || 0) / (race.max_participants || 1), 1);
  const canJoin = computedStatus === 'aperta';
  const raceDate = parseISO(race.date);

  return (
    <div
      onClick={onClick}
      className="racing-card bg-card p-5 hover:glow-primary transition-all group cursor-pointer border border-border/50 hover:border-primary/30"
    >
      {/* Top row: status + prize */}
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className={cn("text-xs font-bold tracking-wide", status.class)}>
          {status.pulse && <span className="w-1.5 h-1.5 rounded-full bg-destructive live-pulse mr-1.5 inline-block" />}
          {status.label}
        </Badge>
        <div className="flex items-center gap-1.5 text-accent font-heading text-sm">
          <Trophy className="w-3.5 h-3.5" />
          <span>€{prizePool > 0 ? prizePool.toLocaleString('it') : 0}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-heading text-base text-foreground mb-0.5 group-hover:text-primary transition-colors leading-tight">
        {race.title}
      </h3>
      {race.championship && (
        <p className="text-xs text-muted-foreground mb-3">{race.championship}</p>
      )}

      {/* Info grid */}
      <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{race.track || 'TBD'}</span>
          {race.category && (
            <span className={cn("ml-auto font-bold", categoryColors[race.category])}>{race.category}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{format(raceDate, "EEEE d MMM · HH:mm", { locale: it })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{race.simulator}</span>
          {race.entry_fee > 0 && (
            <span className="ml-auto flex items-center gap-0.5 text-foreground font-medium">
              <Euro className="w-3 h-3" />
              {race.entry_fee} iscrizione
            </span>
          )}
          {(!race.entry_fee || race.entry_fee === 0) && (
            <span className="ml-auto text-green-400 font-semibold">GRATIS</span>
          )}
        </div>
      </div>

      {/* Participants bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{race.current_participants || 0} / {race.max_participants || '∞'} piloti</span>
          </div>
          <span className="text-muted-foreground">{race.max_participants ? `${race.max_participants - (race.current_participants || 0)} posti liberi` : ''}</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              filled >= 1 ? "bg-orange-500" : filled > 0.75 ? "bg-accent" : "bg-primary"
            )}
            style={{ width: `${filled * 100}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        disabled={!canJoin}
        className={cn(
          "w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
          canJoin
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-secondary text-muted-foreground cursor-not-allowed"
        )}
      >
        {canJoin ? 'Iscriviti' : computedStatus === 'live' ? 'In Corso' : computedStatus === 'completed' ? 'Terminata' : computedStatus === 'piena' ? 'Lista Chiusa' : 'Visualizza'}
      </button>
    </div>
  );
}