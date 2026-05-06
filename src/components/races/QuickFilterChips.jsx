import React from 'react';
import { cn } from '@/lib/utils';
import { Radio, Sun, TrendingUp, Shield, Users } from 'lucide-react';

const chips = [
  { id: 'live',       label: 'LIVE ora',       icon: Radio,      color: 'text-destructive border-destructive/30 bg-destructive/5' },
  { id: 'today',      label: 'Oggi',            icon: Sun,        color: 'text-accent border-accent/30 bg-accent/5' },
  { id: 'highstakes', label: 'High Stakes',     icon: TrendingUp, color: 'text-purple-400 border-purple-400/30 bg-purple-400/5' },
  { id: 'campionato', label: 'Campionato',      icon: Shield,     color: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
];

export default function QuickFilterChips({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(chip => {
        const Icon = chip.icon;
        const isActive = active === chip.id;
        return (
          <button
            key={chip.id}
            onClick={() => onChange(isActive ? null : chip.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
              isActive
                ? chip.color + " opacity-100 scale-[1.02]"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}