import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Calendar, Users, Euro, Trophy, Shield, Lock, AlertTriangle, CheckCircle2, Zap, Clock, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInHours } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import RaceSettingsBadge from '@/components/races/RaceSettingsBadge';
import PilotsList from '@/components/races/PilotsList';
import RegistrationModal from '@/components/races/RegistrationModal';
import PayoutPanel from '@/components/races/PayoutPanel';

function getPrizePool(race) {
  return Math.round((race.entry_fee || 0) * (race.current_participants || 0) * 0.85);
}

function getComputedStatus(race) {
  if (!race) return 'upcoming';
  if (race.status === 'live') return 'live';
  if (race.status === 'completed' || race.status === 'cancelled') return race.status;
  const hoursUntil = differenceInHours(parseISO(race.date), new Date());
  if (hoursUntil <= 0) return 'completed';
  if (hoursUntil <= 24) return 'prossima';
  const isFull = race.current_participants >= race.max_participants;
  if (isFull) return 'piena';
  return 'aperta';
}

const statusConfig = {
  live:       { label: 'LIVE',         class: 'bg-destructive/15 text-destructive border-destructive/40', pulse: true },
  aperta:     { label: 'APERTA',       class: 'bg-green-500/15 text-green-400 border-green-500/40' },
  piena:      { label: 'PIENA',        class: 'bg-orange-500/15 text-orange-400 border-orange-500/40' },
  prossima:   { label: 'PROSSIMA',     class: 'bg-accent/15 text-accent border-accent/40' },
  completed:  { label: 'COMPLETATA',   class: 'bg-muted/50 text-muted-foreground border-border' },
  cancelled:  { label: 'CANCELLATA',   class: 'bg-muted/50 text-muted-foreground border-border' },
  upcoming:   { label: 'IN PROGRAMMA', class: 'bg-primary/10 text-primary border-primary/20' },
};

export default function RaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRegModal, setShowRegModal] = useState(false);

  const { data: race, isLoading } = useQuery({
    queryKey: ['race', id],
    queryFn: () => base44.entities.Race.filter({ id }),
    select: (data) => Array.isArray(data) ? data[0] : data,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list(),
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const newCount = (race.current_participants || 0) + 1;
      const newIds = [...(race.registered_pilot_ids || []), currentUser?.email];
      return base44.entities.Race.update(id, {
        current_participants: newCount,
        registered_pilot_ids: newIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['race', id] });
      queryClient.invalidateQueries({ queryKey: ['races'] });
      toast.success('Iscrizione completata! 🏁');
      setShowRegModal(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-card rounded animate-pulse" />
        <div className="racing-card bg-card h-64 animate-pulse" />
      </div>
    );
  }

  if (!race) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Gara non trovata</p>
        <Button onClick={() => navigate('/races')} className="mt-4" variant="outline">Torna alle gare</Button>
      </div>
    );
  }

  const computedStatus = getComputedStatus(race);
  const status = statusConfig[computedStatus] || statusConfig.upcoming;
  const prizePool = getPrizePool(race);
  const canRegister = computedStatus === 'aperta';
  const isAlreadyRegistered = race.registered_pilot_ids?.includes(currentUser?.email);
  const hasPayingParticipants = (race.entry_fee || 0) > 0 && (race.current_participants || 0) > 0;
  const raceDate = parseISO(race.date);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate('/races')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" />
        Tutte le gare
      </button>

      {/* HEADER */}
      <div className="racing-card bg-card p-6">
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <Badge variant="outline" className={cn("text-sm font-bold px-3 py-1", status.class)}>
            {status.pulse && <span className="w-2 h-2 rounded-full bg-destructive live-pulse mr-2 inline-block" />}
            {status.label}
          </Badge>
          {race.category && (
            <Badge variant="outline" className="text-sm border-border text-muted-foreground">{race.category}</Badge>
          )}
        </div>

        <h1 className="font-heading text-2xl md:text-3xl text-foreground mb-1">{race.title}</h1>
        {race.championship && (
          <p className="text-primary text-sm font-semibold mb-4">{race.championship}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{race.track || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{format(raceDate, "d MMM · HH:mm", { locale: it })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{race.simulator}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">
              {race.duration_laps ? `${race.duration_laps} giri` : race.duration_minutes ? `${race.duration_minutes} min` : 'TBD'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="info">Info & Piloti</TabsTrigger>
          <TabsTrigger value="payout">💰 Premi & Payout</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="racing-card bg-card p-5">
                <h2 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-4">Impostazioni Gara</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <RaceSettingsBadge label="BOP" value={race.bop ? 'Sì' : 'No'} active={race.bop} />
                  <RaceSettingsBadge label="Danni realistici" value={race.realistic_damage ? 'Sì' : 'No'} active={race.realistic_damage} />
                  <RaceSettingsBadge label="Meteo" value={race.weather || 'Fisso'} active={race.weather === 'Dinamico'} />
                  <RaceSettingsBadge label="Carburante" value={race.fuel_consumption ? 'Sì' : 'No'} active={race.fuel_consumption} />
                  <RaceSettingsBadge label="Pit obbligatorio" value={race.mandatory_pitstop ? 'Sì' : 'No'} active={race.mandatory_pitstop} />
                  <RaceSettingsBadge label="Stabilità" value={race.stability_control || 'Consentito'} active={race.stability_control === 'Vietato'} warning={race.stability_control === 'Vietato'} />
                </div>
              </div>
              <PilotsList race={race} pilots={pilots} />
              {race.regulations && (
                <div className="racing-card bg-card p-5">
                  <h2 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Flag className="w-4 h-4" /> Regolamento
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{race.regulations}</p>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {/* CTA iscrizione */}
              <div className="racing-card bg-card p-5">
                {isAlreadyRegistered ? (
                  <div className="text-center">
                    <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
                    <p className="font-semibold text-foreground">Sei già iscritto!</p>
                    <p className="text-xs text-muted-foreground mt-1">Riceverai una notifica prima della gara.</p>
                  </div>
                ) : canRegister ? (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-3">
                      <span>Posti disponibili</span>
                      <span className="text-foreground font-medium">{(race.max_participants || 0) - (race.current_participants || 0)}</span>
                    </div>
                    <Button onClick={() => setShowRegModal(true)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading tracking-wide h-11">
                      Iscriviti — €{race.entry_fee || 0}
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center mt-2">Il montepremi si aggiorna in tempo reale</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {computedStatus === 'piena' ? 'Iscrizioni chiuse — lista piena' : computedStatus === 'live' ? 'Gara in corso' : 'Iscrizioni non disponibili'}
                    </p>
                  </div>
                )}
              </div>
              {/* Quick prize summary */}
              <div className="racing-card bg-card p-4 text-center">
                <Trophy className="w-6 h-6 text-accent mx-auto mb-1" />
                <p className="font-heading text-2xl text-accent">€{prizePool.toLocaleString('it')}</p>
                <p className="text-xs text-muted-foreground">Montepremi totale</p>
                <button onClick={() => {}} className="text-xs text-primary mt-2 hover:underline">Vedi breakdown completo →</button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payout" className="mt-5">
          <PayoutPanel race={race} />
        </TabsContent>
      </Tabs>

      {/* Registration modal */}
      {showRegModal && (
        <RegistrationModal
          race={race}
          prizePool={prizePool}
          onConfirm={() => registerMutation.mutate()}
          onClose={() => setShowRegModal(false)}
          isLoading={registerMutation.isPending}
        />
      )}
    </div>
  );
}