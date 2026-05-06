import React from 'react';
import { Trophy, Medal } from 'lucide-react';

const positions = [
  { pos: '1°', pct: 0.50, icon: '🥇', color: 'text-accent' },
  { pos: '2°', pct: 0.30, icon: '🥈', color: 'text-muted-foreground' },
  { pos: '3°', pct: 0.20, icon: '🥉', color: 'text-orange-400' },
];

export default function PrizeDistribution({ prizePool }) {
  return (
    <div className="space-y-2">
      {positions.map(({ pos, pct, icon, color }) => {
        const amount = Math.round(prizePool * pct);
        const widthPct = pct * 100;
        return (
          <div key={pos} className="flex items-center gap-3">
            <span className="text-base w-6 text-center">{icon}</span>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className={color + " font-semibold"}>{pos} posto</span>
                <span className={color + " font-bold"}>€{amount.toLocaleString('it')}</span>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-current rounded-full opacity-50" style={{ width: `${widthPct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}