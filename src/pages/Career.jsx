import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Zap, Trophy, Mic, Clapperboard, Shield, Star, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import CategoryProgress from '@/components/standings/CategoryProgress';
import { Badge } from '@/components/ui/badge';

const PILOT_TRACK = [
  { level: 'START',   pts: 0,    desc: 'Inizio carriera. Accesso a gare aperte.' },
  { level: 'ROOKIE',  pts: 50,   desc: 'Prime vittorie. Accesso gare intermedie.' },
  { level: 'AMATEUR', pts: 150,  desc: 'Accesso campionati amatoriali.' },
  { level: 'SEMI-PRO',pts: 300,  desc: 'Accesso campionati semi-pro.' },
  { level: 'PRO',     pts: 600,  desc: 'Accesso campionati PRO ufficiali.' },
  { level: 'K-Series',pts: 1200, desc: 'Élite. Campionati a premi reali. Su invito.' },
];

const MEDIA_TRACKS = [
  {
    title: 'Commentatore',
    icon: Mic,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    steps: [
      'Partecipa a 10+ gare come pilota',
      'Candidatura al ruolo commentatore junior',
      'Affiancamento in 3 broadcast',
      'Valutazione staff → Commentatore Ufficiale',
      'Senior dopo 10 broadcast valutati positivamente',
    ],
  },
  {
    title: 'Giudice / Steward',
    icon: Shield,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    steps: [
      'Minimo categoria SEMI-PRO come pilota',
      'Candidatura al ruolo Steward',
      'Studio regolamento ufficiale SIM is REAL',
      'Valutazione da Chief Steward',
      'Assegnazione gare come Steward attivo',
    ],
  },
  {
    title: 'Regista / Streaming',
    icon: Clapperboard,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    steps: [
      'Candidatura al ruolo broadcast',
      'Formazione tecnica (OBS, streaming, regia)',
      'Operatore in 3 eventi supervisionati',
      'Certificazione Regista Junior',
      'Regista Ufficiale dopo 5 eventi autonomi',
    ],
  },
];

const safetyColors = {
  S: 'text-green-400 bg-green-400/10 border-green-400/30',
  A: 'text-primary bg-primary/10 border-primary/30',
  B: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  C: 'text-accent bg-accent/10 border-accent/30',
  D: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  E: 'text-red-400 bg-red-400/10 border-red-400/30',
  F: 'text-destructive bg-destructive/10 border-destructive/30',
};

export default function Career() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: pilots = [] } = useQuery({ queryKey: ['pilots'], queryFn: () => base44.entities.Pilot.list() });
  const { data: raceResults = [] } = useQuery({ queryKey: ['race-results'], queryFn: () => base44.entities.RaceResult.list('-created_date', 200) });

  const myPilot = pilots.find(p => p.created_by === user?.email);
  const myResults = raceResults.filter(r => r.pilot_id === myPilot?.id);
  const podiums = myResults.filter(r => r.position <= 3).length;
  const wins = myResults.filter(r => r.position === 1).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <Star className="w-7 h-7 text-accent" /> Carriera
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Il tuo percorso nella piattaforma SIM is REAL</p>
      </div>

      {myPilot ? (
        <>
          {/* Stats hero */}
          <div className="racing-card bg-card p-6 flex flex-wrap gap-6 items-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="font-heading text-2xl text-primary">{myPilot.username?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <p className="font-heading text-xl text-foreground">{myPilot.username}</p>
              <p className="text-sm text-muted-foreground">{myPilot.nationality} · {myPilot.main_simulator}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={safetyColors[myPilot.safety_rating || 'S']}>SR: {myPilot.safety_rating || 'S'}</Badge>
                <Badge variant="outline" className="border-border text-muted-foreground">{myPilot.team_name || 'Free Agent'}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div><p className="font-heading text-2xl text-primary">{myPilot.total_points || 0}</p><p className="text-[10px] uppercase text-muted-foreground">Punti</p></div>
              <div><p className="font-heading text-2xl text-accent">{wins}</p><p className="text-[10px] uppercase text-muted-foreground">Vittorie</p></div>
              <div><p className="font-heading text-2xl text-foreground">{myPilot.races_completed || 0}</p><p className="text-[10px] uppercase text-muted-foreground">Gare</p></div>
            </div>
          </div>

          {/* Category progress */}
          <CategoryProgress pilot={myPilot} />
        </>
      ) : (
        <div className="racing-card bg-card p-8 text-center">
          <Zap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Crea il tuo profilo pilota nel <a href="/profile" className="text-primary hover:underline">Profilo</a> per accedere alla carriera.</p>
        </div>
      )}

      {/* Pilot track */}
      <div>
        <h2 className="font-heading text-lg text-foreground mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-accent" /> Percorso Pilota</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PILOT_TRACK.map((lvl, idx) => {
            const reached = (myPilot?.total_points || 0) >= lvl.pts;
            return (
              <div key={lvl.level} className={cn("racing-card-sm bg-card p-3 text-center relative", reached ? "border border-primary/30" : "opacity-60")}>
                {reached ? <CheckCircle className="w-4 h-4 text-primary mx-auto mb-1" /> : <Lock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />}
                <p className={cn("font-heading text-sm", reached ? "text-primary" : "text-muted-foreground")}>{lvl.level}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{lvl.pts} pts</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{lvl.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Media tracks */}
      <div>
        <h2 className="font-heading text-lg text-foreground mb-3 flex items-center gap-2"><Clapperboard className="w-5 h-5 text-purple-400" /> Percorsi Media & Staff</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MEDIA_TRACKS.map(track => {
            const Icon = track.icon;
            return (
              <div key={track.title} className="racing-card bg-card p-5">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", track.bg)}>
                  <Icon className={cn("w-5 h-5", track.color)} />
                </div>
                <p className="font-heading text-foreground mb-3">{track.title}</p>
                <div className="space-y-2">
                  {track.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="font-heading text-[10px] text-muted-foreground mt-0.5 flex-shrink-0 w-4">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trophies */}
      <div>
        <h2 className="font-heading text-lg text-foreground mb-3">Milestone Sbloccate</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Prima Gara', icon: '🏁', cond: (myPilot?.races_completed || 0) >= 1 },
            { label: 'Prima Vittoria', icon: '🥇', cond: wins >= 1 },
            { label: 'Podio', icon: '🏆', cond: podiums >= 1 },
            { label: 'Rookie', icon: '⭐', cond: (myPilot?.total_points || 0) >= 50 },
            { label: '5 Gare', icon: '🔥', cond: (myPilot?.races_completed || 0) >= 5 },
            { label: 'Team Member', icon: '🤝', cond: !!myPilot?.team_id },
            { label: 'Safety S', icon: '🛡️', cond: myPilot?.safety_rating === 'S' },
            { label: 'PRO', icon: '🎖️', cond: (myPilot?.total_points || 0) >= 600 },
          ].map(t => (
            <div key={t.label} className={cn("racing-card-sm bg-card p-3 text-center", !t.cond && "opacity-40")}>
              <span className="text-2xl">{t.icon}</span>
              <p className="text-xs text-foreground mt-1">{t.label}</p>
              {!t.cond && <p className="text-[10px] text-muted-foreground mt-0.5"><Lock className="w-3 h-3 inline" /> Bloccato</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}