import React from 'react';
import { Trophy, Euro, Lock, Users, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const DIST = [
  { pos: 1, label: '1° Posto', pct: 45, icon: '🥇', color: 'text-accent', bg: 'bg-accent/10 border-accent/30' },
  { pos: 2, label: '2° Posto', pct: 28, icon: '🥈', color: 'text-slate-300', bg: 'bg-slate-400/10 border-slate-400/30' },
  { pos: 3, label: '3° Posto', pct: 17, icon: '🥉', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  { pos: 4, label: '4° Posto', pct: 7,  icon: '4️⃣', color: 'text-muted-foreground', bg: 'bg-secondary border-border' },
  { pos: 5, label: '5° Posto', pct: 3,  icon: '5️⃣', color: 'text-muted-foreground', bg: 'bg-secondary border-border' },
];

const PLATFORM_FEE = 0.15;

export default function PayoutPanel({ race }) {
  const entryFee = race.entry_fee || 0;
  const participants = race.current_participants || 0;
  const gross = entryFee * participants;
  const platformFee = Math.round(gross * PLATFORM_FEE);
  const prizePool = gross - platformFee;

  const hasPayouts = entryFee > 0 && participants > 0;

  return (
    <div className="space-y-5">

      {/* Prize pool summary */}
      <div className="racing-card bg-card p-5">
        <h2 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent" /> Montepremi & Payout
        </h2>

        {!hasPayouts ? (
          <div className="text-center py-8 text-muted-foreground">
            <Euro className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Gara gratuita — nessun montepremi</p>
          </div>
        ) : (
          <>
            {/* Main pool */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-accent/20 mb-5">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Montepremi Totale</p>
                <p className="font-heading text-3xl text-accent">€{prizePool.toLocaleString('it')}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground space-y-1">
                <p>Iscritti: <span className="text-foreground font-semibold">{participants}</span></p>
                <p>Quota: <span className="text-foreground font-semibold">€{entryFee}</span></p>
                <p>Lordo: <span className="text-foreground font-semibold">€{gross}</span></p>
              </div>
            </div>

            {/* Distribution */}
            <div className="space-y-3 mb-5">
              {DIST.map(d => {
                const amount = Math.round(prizePool * d.pct / 100);
                return (
                  <div key={d.pos} className={cn('flex items-center justify-between px-4 py-2.5 rounded-lg border', d.bg)}>
                    <div className="flex items-center gap-3">
                      <span className="text-base">{d.icon}</span>
                      <span className={cn('text-sm font-semibold', d.color)}>{d.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={cn('font-heading text-base', d.color)}>€{amount.toLocaleString('it')}</p>
                        <p className="text-[10px] text-muted-foreground">{d.pct}% del pool</p>
                      </div>
                      {/* Bar */}
                      <div className="w-20 h-1.5 bg-black/20 rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full rounded-full" style={{ width: `${d.pct * 2}%`, backgroundColor: 'currentColor' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fee breakdown */}
            <div className="p-4 rounded-lg bg-background/50 border border-border/50 text-xs space-y-1.5">
              <p className="font-semibold text-foreground mb-2">Riepilogo Economico</p>
              <div className="flex justify-between text-muted-foreground">
                <span>Incasso lordo ({participants} × €{entryFee})</span>
                <span className="text-foreground">€{gross}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Fee piattaforma (15%)</span>
                <span className="text-destructive">−€{platformFee}</span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t border-border/50">
                <span className="text-foreground">Montepremi distribuibile</span>
                <span className="text-accent">€{prizePool}</span>
              </div>
            </div>

            {/* Escrow */}
            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-2">
              <Lock className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-green-400">Montepremi in Escrow ✓</p>
                <p className="text-xs text-muted-foreground mt-0.5">I fondi sono bloccati e garantiti prima dell'inizio della gara. Distribuzione automatica post-verifica risultati.</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Points payout */}
      <div className="racing-card bg-card p-5">
        <h2 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" /> Punti Campionato
        </h2>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {[25,18,15,12,10,8,6,4,2,1].map((pts, i) => (
            <div key={i} className={cn(
              'text-center py-2 px-1 rounded-lg border',
              i === 0 ? 'bg-accent/10 border-accent/30' : i === 1 ? 'bg-slate-400/10 border-slate-400/20' : i === 2 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-secondary border-border'
            )}>
              <p className="text-[10px] text-muted-foreground">P{i + 1}</p>
              <p className={cn('font-heading text-sm', i === 0 ? 'text-accent' : i < 3 ? 'text-foreground' : 'text-muted-foreground')}>{pts}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>⚡ <span className="text-foreground">+2 pts</span> giro veloce (top 10)</span>
          <span>🏁 <span className="text-foreground">+3 pts</span> pole position</span>
          <span>🤝 <span className="text-foreground">+10 pts</span> sportività massima</span>
          <span>⚠️ <span className="text-destructive">−5 pts</span> penalità per incidente</span>
        </div>
      </div>

      {/* Safety rating impact */}
      <div className="racing-card bg-card p-5">
        <h2 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" /> Impatto Safety Rating sui Premi
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { sr: 'S', label: 'Bonus +10%', desc: 'Bonus fedeltà sul montepremi', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
            { sr: 'A', label: 'Nessun modificatore', desc: 'Payout standard', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
            { sr: 'B', label: '−5% fee ridotta', desc: 'Piccolo svantaggio', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { sr: 'C o inferiore', label: '−10% escrow ritardato', desc: 'Distribuzione posticipata 48h', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
          ].map(item => (
            <div key={item.sr} className={cn('p-3 rounded-lg border', item.bg)}>
              <span className={cn('font-heading text-xl', item.color)}>{item.sr}</span>
              <p className={cn('text-xs font-semibold mt-1', item.color)}>{item.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}