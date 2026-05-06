import React from 'react';
import { Coins, Lock, Gift, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatGW, formatEur, gwToEur } from '@/lib/walletUtils';

const SLABS = [
  {
    key: 'gw_disponibili',
    label: 'GW Disponibili',
    sublabel: 'Prelevabili in Euro',
    icon: TrendingUp,
    color: 'text-primary',
    border: 'border-primary/20',
    bg: 'bg-primary/5',
    badge: 'bg-primary/10 text-primary',
  },
  {
    key: 'gw_bonus',
    label: 'GW Bonus',
    sublabel: 'Crediti Gara / Promozionali',
    icon: Gift,
    color: 'text-accent',
    border: 'border-accent/20',
    bg: 'bg-accent/5',
    badge: 'bg-accent/10 text-accent',
  },
  {
    key: 'gw_bloccati',
    label: 'GW Bloccati',
    sublabel: 'Escrow / Contestazioni',
    icon: Lock,
    color: 'text-orange-400',
    border: 'border-orange-400/20',
    bg: 'bg-orange-400/5',
    badge: 'bg-orange-400/10 text-orange-400',
  },
];

export default function WalletBalanceCard({ wallet }) {
  const total = (wallet?.gw_disponibili || 0) + (wallet?.gw_bonus || 0) + (wallet?.gw_bloccati || 0);

  return (
    <div className="space-y-4">
      {/* Total */}
      <div className="racing-card bg-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Coins className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Saldo Totale</p>
            <p className="font-heading text-2xl text-foreground">{formatGW(total)}</p>
            <p className="text-xs text-muted-foreground">{formatEur(gwToEur(total))}</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Tasso fisso S.R.F.</p>
          <p className="text-xs text-foreground font-mono">100.000 GW = €2,50</p>
        </div>
      </div>

      {/* 3 saldi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SLABS.map(s => {
          const amount = wallet?.[s.key] || 0;
          const Icon = s.icon;
          return (
            <div key={s.key} className={cn("racing-card-sm bg-card p-4 border", s.border)}>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", s.bg)}>
                <Icon className={cn("w-4 h-4", s.color)} />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{s.label}</p>
              <p className={cn("font-heading text-xl mt-1", s.color)}>{formatGW(amount)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatEur(gwToEur(amount))}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-2">{s.sublabel}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}