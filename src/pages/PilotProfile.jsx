import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Trophy, Flag, Star, Shield, Zap, Users, Calendar, Medal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import PilotStatsCards from '@/components/pilots/PilotStatsCards';
import PilotRaceHistory from '@/components/pilots/PilotRaceHistory';
import PilotSafetyChart from '@/components/pilots/PilotSafetyChart';
import PilotTrophies from '@/components/pilots/PilotTrophies';

const categoryColors = {
  START: 'text-muted-foreground bg-muted/50 border-border',
  ROOKIE: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  AMATEUR: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  'SEMI-PRO': 'text-accent bg-accent/10 border-accent/30',
  PRO: 'text-green-400 bg-green-400/10 border-green-400/30',
  K: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
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

export default function PilotProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: pilots = [], isLoading: loadingPilot } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list(),
  });

  const { data: results = [], isLoading: loadingResults } = useQuery({
    queryKey: ['race-results'],
    queryFn: () => base44.entities.RaceResult.list('-created_date', 200),
  });

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list(),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list(),
  });

  const pilot = pilots.find(p => p.id === id);
  const pilotResults = useMemo(() =>
    results.filter(r => r.pilot_id === id).sort((a, b) => {
      const ra = races.find(r2 => r2.id === a.race_id);
      const rb = races.find(r2 => r2.id === b.race_id);
      if (!ra || !rb) return 0;
      return new Date(rb.date) - new Date(ra.date);
    }),
    [results, id, races]
  );

  const team = teams.find(t => t.id === pilot?.team_id);

  if (loadingPilot) {
    return (
      <div className="space-y-6">
        <div className="h-40 racing-card bg-card animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 racing-card bg-card animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!pilot) {
    return (
      <div className="racing-card bg-card p-16 text-center">
        <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Pilota non trovato</p>
        <button onClick={() => navigate('/pilots')} className="mt-3 text-primary text-sm hover:underline">
          Torna alla lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/pilots')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Tutti i piloti
      </button>

      {/* Hero card */}
      <div className="racing-card bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-heading border-2",
            "bg-secondary border-primary/30"
          )}>
            {pilot.avatar_url
              ? <img src={pilot.avatar_url} alt={pilot.username} className="w-full h-full rounded-full object-cover" />
              : pilot.username?.[0]?.toUpperCase()
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-heading text-2xl md:text-3xl text-foreground">{pilot.username}</h1>
              <Badge variant="outline" className={cn("text-xs font-bold", categoryColors[pilot.category || 'START'])}>
                {pilot.category || 'START'}
              </Badge>
              <Badge variant="outline" className={cn("text-xs font-bold", safetyColors[pilot.safety_rating || 'S'])}>
                SR {pilot.safety_rating || 'S'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Flag className="w-3.5 h-3.5" />{pilot.nationality}</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" />{pilot.main_simulator}</span>
              {pilot.team_name && (
                <span className="flex items-center gap-1 text-primary"><Users className="w-3.5 h-3.5" />{pilot.team_name}</span>
              )}
              {pilot.role && pilot.role !== 'Pilota' && (
                <span className="flex items-center gap-1 text-accent"><Shield className="w-3.5 h-3.5" />{pilot.role}</span>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="font-heading text-3xl text-primary">{pilot.total_points || 0}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">punti totali</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <PilotStatsCards pilot={pilot} results={pilotResults} />

      {/* Safety rating chart */}
      <PilotSafetyChart pilot={pilot} results={pilotResults} races={races} />

      {/* Trophies + Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PilotTrophies pilot={pilot} results={pilotResults} races={races} />

        {/* Team card */}
        <div className="racing-card bg-card p-5">
          <h2 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />Scuderia
          </h2>
          {team || pilot.team_name ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center text-xl font-heading">
                {team?.tag || pilot.team_name?.[0]}
              </div>
              <div>
                <p className="font-heading text-lg text-primary">{team?.name || pilot.team_name}</p>
                {team?.tag && <p className="text-xs text-muted-foreground">{team.tag}</p>}
                {team?.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{team.description}</p>}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Pilota senza scuderia</p>
          )}
        </div>
      </div>

      {/* Race history */}
      <PilotRaceHistory results={pilotResults} races={races} isLoading={loadingResults} />
    </div>
  );
}