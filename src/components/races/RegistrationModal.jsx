import React from 'react';
import { X, CreditCard, Trophy, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegistrationModal({ race, prizePool, onConfirm, onClose, isLoading }) {
  const newPrizePool = Math.round((race.entry_fee || 0) * ((race.current_participants || 0) + 1) * 0.85);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative racing-card bg-card p-6 w-full max-w-md border border-border shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        <h2 className="font-heading text-lg text-foreground mb-1">Conferma Iscrizione</h2>
        <p className="text-muted-foreground text-sm mb-5">{race.title}</p>

        {/* Riepilogo */}
        <div className="bg-background/60 rounded-lg p-4 space-y-3 mb-5 border border-border/50">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quota iscrizione</span>
            <span className="font-bold text-foreground">€{race.entry_fee || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Montepremi attuale</span>
            <span className="font-bold text-accent">€{prizePool.toLocaleString('it')}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-border/50 pt-3">
            <span className="text-muted-foreground">Montepremi dopo iscrizione</span>
            <span className="font-bold text-green-400">€{newPrizePool.toLocaleString('it')}</span>
          </div>
        </div>

        {/* Distribuzione */}
        <div className="space-y-1.5 mb-5 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>🥇 1° posto</span>
            <span className="text-accent font-semibold">€{Math.round(newPrizePool * 0.50).toLocaleString('it')}</span>
          </div>
          <div className="flex justify-between">
            <span>🥈 2° posto</span>
            <span className="font-medium text-foreground">€{Math.round(newPrizePool * 0.30).toLocaleString('it')}</span>
          </div>
          <div className="flex justify-between">
            <span>🥉 3° posto</span>
            <span className="font-medium text-foreground">€{Math.round(newPrizePool * 0.20).toLocaleString('it')}</span>
          </div>
        </div>

        {/* Escrow */}
        {(race.entry_fee || 0) > 0 && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 mb-5">
            <div className="flex items-center gap-2 text-green-400 text-xs font-semibold mb-0.5">
              <Lock className="w-3.5 h-3.5" />
              Pagamento sicuro in escrow
            </div>
            <p className="text-xs text-muted-foreground">I fondi vengono bloccati fino al termine della gara.</p>
          </div>
        )}

        {/* Stripe placeholder */}
        <div className="border border-dashed border-border/60 rounded-lg p-3 flex items-center gap-3 mb-5 bg-background/30">
          <CreditCard className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium text-foreground">Pagamento via Stripe</p>
            <p className="text-[10px] text-muted-foreground">Integrazione Stripe — in arrivo</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-border">Annulla</Button>
          <Button onClick={onConfirm} disabled={isLoading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            {isLoading ? 'Registrazione...' : `Conferma — €${race.entry_fee || 0}`}
          </Button>
        </div>
      </div>
    </div>
  );
}