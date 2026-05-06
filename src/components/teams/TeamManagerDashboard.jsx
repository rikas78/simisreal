import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Users, Flag, Trophy, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

const categoryColors = {
  START: 'text-muted-foreground bg-muted/50 border-border',
  ROOKIE: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  AMATEUR: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  'SEMI-PRO': 'text-accent bg-accent/10 border-accent/30',
  PRO: 'text-green-400 bg-green-400/10 border-green-400/30',
  K: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
};

export default function TeamManagerDashboard({ team, pilots, teamRequests, races, myPilot }) {
  const queryClient = useQueryClient();
  const myTeamPilots = pilots.filter(p => p.team_id === team?.id);
  const pendingRequests = teamRequests.filter(r => r.team_id === team?.id && r.status === 'pending');
  const upcomingRaces = races.filter(r => r.status === 'upcoming').slice(0, 5);

  const acceptMutation = useMutation({
    mutationFn: async ({ request }) => {
      await base44.entities.TeamRequest.update(request.id, { status: 'accepted' });
      await base44.entities.Pilot.update(request.pilot_id, { team_id: team.id, team_name: team.name });
      await base44.entities.Team.update(team.id, { member_count: (team.member_count || 1) + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-requests'] });
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Pilota aggiunto alla scuderia!');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamRequest.update(id, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-requests'] });
      toast.success('Richiesta rifiutata');
    },
  });

  const registerPilotMutation = useMutation({
    mutationFn: async ({ race, pilot }) => {
      const updated = [...(race.registered_pilot_ids || []), pilot.id];
      await base44.entities.Race.update(race.id, {
        registered_pilot_ids: updated,
        current_participants: updated.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races'] });
      toast.success('Pilota iscritto alla gara!');
    },
  });

  return (
    <div className="space-y-6">
      {/* Team summary */}
      <div className="racing-card bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="font-heading text-lg text-primary">{team?.tag}</span>
          </div>
          <div>
            <h2 className="font-heading text-xl text-foreground">{team?.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1"><Crown className="w-3.5 h-3.5" />Team Manager: {myPilot?.username}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-heading text-2xl text-primary">{myTeamPilots.reduce((s,p) => s + (p.total_points||0), 0)}</p>
            <p className="text-xs text-muted-foreground">punti team</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending requests */}
        <div className="racing-card bg-card p-5">
          <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Richieste di Accesso
            {pendingRequests.length > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {pendingRequests.length}
              </span>
            )}
          </h3>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna richiesta in attesa</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(req => {
                const pilot = pilots.find(p => p.id === req.pilot_id);
                return (
                  <div key={req.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-heading text-sm flex-shrink-0">
                      {req.pilot_username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm text-foreground">{req.pilot_username}</p>
                        {pilot && (
                          <Badge variant="outline" className={cn("text-[10px]", categoryColors[pilot.category || 'START'])}>
                            {pilot.category || 'START'}
                          </Badge>
                        )}
                      </div>
                      {req.message && <p className="text-xs text-muted-foreground line-clamp-2">{req.message}</p>}
                      {pilot && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {pilot.total_points || 0} pt · {pilot.wins || 0} vittorie · {pilot.races_completed || 0} gare
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => acceptMutation.mutate({ request: req })}
                        className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => rejectMutation.mutate(req.id)}
                        className="w-7 h-7 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive flex items-center justify-center transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Roster */}
        <div className="racing-card bg-card p-5">
          <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" />Rosa Piloti ({myTeamPilots.length})
          </h3>
          {myTeamPilots.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun pilota nel team</p>
          ) : (
            <div className="space-y-2">
              {myTeamPilots.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/20">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-heading text-xs">
                    {p.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{p.username}</p>
                    <p className="text-[10px] text-muted-foreground">{p.nationality} · {p.main_simulator}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn("text-[10px]", categoryColors[p.category || 'START'])}>
                      {p.category || 'START'}
                    </Badge>
                    <p className="text-xs text-primary font-heading mt-0.5">{p.total_points || 0} pt</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Register pilots to races */}
      <div className="racing-card bg-card p-5">
        <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <Flag className="w-4 h-4" />Iscrivi Piloti alle Gare
        </h3>
        {upcomingRaces.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessuna gara in programma</p>
        ) : (
          <div className="space-y-4">
            {upcomingRaces.map(race => {
              const availableSlots = (race.max_participants || 0) - (race.current_participants || 0);
              return (
                <div key={race.id} className="border border-border/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{race.title}</p>
                      <p className="text-xs text-muted-foreground">{race.track} · {race.simulator}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-xs font-semibold", availableSlots <= 3 ? "text-destructive" : "text-foreground")}>
                        {availableSlots} posti liberi
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {race.date ? format(parseISO(race.date), 'd MMM', { locale: it }) : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {myTeamPilots.map(pilot => {
                      const registered = (race.registered_pilot_ids || []).includes(pilot.id);
                      return (
                        <button
                          key={pilot.id}
                          disabled={registered || availableSlots <= 0}
                          onClick={() => registerPilotMutation.mutate({ race, pilot })}
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-lg border transition-all",
                            registered
                              ? "bg-primary/10 border-primary/30 text-primary cursor-default"
                              : availableSlots <= 0
                              ? "opacity-40 cursor-not-allowed bg-secondary border-border text-muted-foreground"
                              : "bg-secondary border-border text-foreground hover:border-primary/50 hover:text-primary"
                          )}
                        >
                          {registered ? '✓ ' : ''}{pilot.username}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}