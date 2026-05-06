import React from 'react';
import { Users } from 'lucide-react';

export default function PilotsList({ race, pilots }) {
  const registeredIds = race.registered_pilot_ids || [];
  const registeredPilots = pilots.filter(p => registeredIds.includes(p.created_by));

  return (
    <div className="racing-card bg-card p-5">
      <h2 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Piloti Iscritti ({race.current_participants || 0}/{race.max_participants || '∞'})
      </h2>

      {registeredPilots.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessun pilota iscritto ancora.</p>
      ) : (
        <div className="space-y-2">
          {registeredPilots.map((pilot, idx) => (
            <div key={pilot.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-background/50">
              <span className="text-xs text-muted-foreground w-5 text-center">{idx + 1}</span>
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-foreground">{pilot.username?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{pilot.username}</p>
                <p className="text-xs text-muted-foreground">{pilot.team_name || pilot.main_simulator}</p>
              </div>
              {pilot.category && (
                <span className="text-xs text-primary font-medium">{pilot.category}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}