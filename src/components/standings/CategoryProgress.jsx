import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

const THRESHOLDS = [
  { from: 'START',    to: 'ROOKIE',   pts: 50 },
  { from: 'ROOKIE',   to: 'AMATEUR',  pts: 200 },
  { from: 'AMATEUR',  to: 'SEMI-PRO', pts: 500 },
  { from: 'SEMI-PRO', to: 'PRO',      pts: 1000 },
  { from: 'PRO',      to: null,       pts: null },
  { from: 'K',        to: null,       pts: null },
];

const categoryColors = {
  START: 'text-muted-foreground',
  ROOKIE: 'text-blue-400',
  AMATEUR: 'text-cyan-400',
  'SEMI-PRO': 'text-accent',
  PRO: 'text-green-400',
  K: 'text-purple-400',
};

export default function CategoryProgress({ pilot }) {
  const category = pilot?.category || 'START';
  const totalPoints = pilot?.total_points || 0;
  const threshold = THRESHOLDS.find(t => t.from === category);

  if (!threshold || !threshold.pts) {
    return (
      <div className="racing-card-sm bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Avanzamento Categoria</span>
        </div>
        <p className={cn("font-heading text-lg", categoryColors[category])}>{category}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {category === 'PRO' ? 'Valutazione manuale per categoria superiore' : 'Categoria massima raggiunta'}
        </p>
      </div>
    );
  }

  const prevThreshold = THRESHOLDS.find(t => t.to === category);
  const basePoints = prevThreshold?.pts || 0;
  const needed = threshold.pts;
  const progress = Math.min((totalPoints - basePoints) / (needed - basePoints), 1);
  const remaining = Math.max(needed - totalPoints, 0);

  return (
    <div className="racing-card-sm bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Avanzamento Categoria</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className={cn("font-heading text-sm", categoryColors[category])}>{category}</span>
        <span className="text-muted-foreground text-xs">→</span>
        <span className={cn("font-heading text-sm", categoryColors[threshold.to])}>{threshold.to}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{totalPoints} pt</span>
        <span className="text-foreground font-medium">
          {remaining > 0 ? `${remaining} pt al prossimo livello` : '✓ Pronto per avanzare'}
        </span>
        <span>{needed} pt</span>
      </div>
    </div>
  );
}