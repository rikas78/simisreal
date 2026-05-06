import React from 'react';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Gift, Lock, Unlock, RefreshCw, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TX_TYPE_LABELS, TX_TYPE_COLORS, formatGW } from '@/lib/walletUtils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const TX_ICONS = {
  deposit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  prize: TrendingUp,
  bonus_credit: Gift,
  welcome_bonus: Gift,
  freeze: Lock,
  unfreeze: Unlock,
  refund_credit: RefreshCw,
  fee: Minus,
};

export default function WalletRecentTx({ transactions = [] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        Nessun movimento registrato
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {transactions.map(tx => {
        const Icon = TX_ICONS[tx.type] || Minus;
        const color = TX_TYPE_COLORS[tx.type] || 'text-muted-foreground';
        const isCredit = tx.amount > 0;
        return (
          <div key={tx.id} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/20 transition-colors">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-secondary/30")}>
              <Icon className={cn("w-3.5 h-3.5", color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{TX_TYPE_LABELS[tx.type] || tx.type}</p>
              <p className="text-xs text-muted-foreground truncate">{tx.causale}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={cn("text-sm font-heading font-black", isCredit ? 'text-green-400' : 'text-red-400')}>
                {isCredit ? '+' : ''}{formatGW(tx.amount)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {tx.created_date ? format(new Date(tx.created_date), 'd MMM HH:mm', { locale: it }) : '—'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}