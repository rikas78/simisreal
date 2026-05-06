import React from 'react';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

function FilterGroup({ label, children }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{label}</p>
      {children}
    </div>
  );
}

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(value === opt.value ? null : opt.value)}
          className={cn(
            "px-2.5 py-1 text-xs rounded-md border transition-all",
            value === opt.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function FiltersSidebar({ filters, onChange, tracks, onClose }) {
  const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }));

  return (
    <div className="w-64 flex-shrink-0">
      <div className="racing-card bg-card p-4 space-y-5 sticky top-6">
        <div className="flex items-center justify-between">
          <p className="font-heading text-sm text-foreground uppercase tracking-wide">Filtri</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <FilterGroup label="Data">
          <ChipGroup
            value={filters.dateRange}
            onChange={(v) => set('dateRange', v)}
            options={[
              { value: 'today', label: 'Oggi' },
              { value: 'week', label: 'Questa settimana' },
              { value: 'month', label: 'Questo mese' },
            ]}
          />
        </FilterGroup>

        <FilterGroup label="Orario">
          <ChipGroup
            value={filters.timeSlot}
            onChange={(v) => set('timeSlot', v)}
            options={[
              { value: 'morning', label: '🌅 Mattina' },
              { value: 'afternoon', label: '☀️ Pomeriggio' },
              { value: 'evening', label: '🌆 Sera' },
              { value: 'night', label: '🌙 Notte' },
            ]}
          />
        </FilterGroup>

        <FilterGroup label="Status">
          <ChipGroup
            value={filters.status}
            onChange={(v) => set('status', v)}
            options={[
              { value: 'live', label: '🔴 LIVE' },
              { value: 'aperta', label: '🟢 Aperte' },
              { value: 'prossima', label: '🟡 Prossime' },
              { value: 'completed', label: '⬜ Completate' },
            ]}
          />
        </FilterGroup>

        <FilterGroup label="Categoria">
          <ChipGroup
            value={filters.category}
            onChange={(v) => set('category', v)}
            options={[
              { value: 'GT3', label: 'GT3' },
              { value: 'GT4', label: 'GT4' },
              { value: 'Formula', label: 'Formula' },
              { value: 'Rally', label: 'Rally' },
              { value: 'Endurance', label: 'Endurance' },
            ]}
          />
        </FilterGroup>

        <FilterGroup label="Circuito">
          <Select value={filters.track || ''} onValueChange={(v) => set('track', v || null)}>
            <SelectTrigger className="bg-background border-border text-xs h-8">
              <SelectValue placeholder="Tutti i circuiti" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Tutti</SelectItem>
              {tracks.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterGroup>

        <FilterGroup label="Montepremi">
          <ChipGroup
            value={filters.prizeRange}
            onChange={(v) => set('prizeRange', v)}
            options={[
              { value: 'free', label: 'Gratuito' },
              { value: '10-50', label: '€10–50' },
              { value: '50-200', label: '€50–200' },
              { value: '200+', label: '€200+' },
            ]}
          />
        </FilterGroup>

        <FilterGroup label="Dimensione">
          <ChipGroup
            value={filters.sizeRange}
            onChange={(v) => set('sizeRange', v)}
            options={[
              { value: 'small', label: 'Piccola 1–12' },
              { value: 'medium', label: 'Media 13–20' },
              { value: 'large', label: 'Grande 20+' },
            ]}
          />
        </FilterGroup>

        <button
          onClick={() => onChange({ dateRange: null, timeSlot: null, status: null, category: null, track: null, prizeRange: null, sizeRange: null })}
          className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Rimuovi tutti i filtri
        </button>
      </div>
    </div>
  );
}