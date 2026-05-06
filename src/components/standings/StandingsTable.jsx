import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const categoryColors = {
  START: 'text-muted-foreground bg-muted/50 border-border',
  ROOKIE: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  AMATEUR: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  'SEMI-PRO': 'text-accent bg-accent/10 border-accent/30',
  PRO: 'text-green-400 bg-green-400/10 border-green-400/30',
  K: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
};

const safetyColors = {
  S: 'text-green-400 bg-green-400/10 border-green-400/30',
  A: 'text-primary bg-primary/10 border-primary/30',
  B: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  C: 'text-accent bg-accent/10 border-accent/30',
  D: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  E: 'text-red-400 bg-red-400/10 border-red-400/30',
  F: 'text-destructive bg-destructive/10 border-destructive/30',
};

const columns = [
  { key: 'pos',                   label: 'Pos',         sortable: false },
  { key: 'username',              label: 'Pilota',      sortable: true },
  { key: 'team_name',             label: 'Team',        sortable: false },
  { key: 'category',              label: 'Categoria',   sortable: true },
  { key: 'total_points',          label: 'Punti Tot.',  sortable: true },
  { key: 'speed_points',          label: 'Pt Velocità', sortable: true },
  { key: 'sportsmanship_points',  label: 'Pt Sport.',   sortable: true },
  { key: 'wins',                  label: 'Vitt.',       sortable: true },
  { key: 'podiums',               label: 'Podi',        sortable: true },
  { key: 'races_completed',       label: 'Gare',        sortable: true },
  { key: 'safety_rating',         label: 'SR',          sortable: true },
];

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === -1 ? <ChevronDown className="w-3 h-3 text-primary" /> : <ChevronUp className="w-3 h-3 text-primary" />;
}

export default function StandingsTable({ pilots, myPilotId, isLoading, sortCol, sortDir, onSort }) {
  return (
    <div className="racing-card bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-border">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort(col.key)}
                  className={cn(
                    "text-left text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-4 py-3 whitespace-nowrap",
                    col.sortable && "cursor-pointer hover:text-foreground transition-colors select-none"
                  )}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  {columns.map(c => <td key={c.key} className="px-4 py-3"><div className="h-4 bg-secondary/50 rounded animate-pulse" /></td>)}
                </tr>
              ))
            ) : pilots.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">Nessun pilota trovato</td></tr>
            ) : (
              pilots.map((pilot, idx) => {
                const isMe = pilot.id === myPilotId;
                const isTop3 = idx < 3;
                return (
                  <tr
                    key={pilot.id}
                    className={cn(
                      "border-b border-border/40 transition-colors",
                      isMe ? "bg-primary/5 border-primary/20" : isTop3 ? "bg-accent/3 hover:bg-accent/5" : "hover:bg-secondary/10"
                    )}
                  >
                    {/* Pos */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        "font-heading text-sm",
                        idx === 0 ? "text-accent" : idx === 1 ? "text-muted-foreground" : idx === 2 ? "text-orange-400" : "text-muted-foreground"
                      )}>
                        {idx + 1}
                        {isMe && <span className="ml-1 text-[10px] text-primary font-normal">(tu)</span>}
                      </span>
                    </td>
                    {/* Pilota */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                          isMe ? "bg-primary/20 text-primary" : "bg-secondary text-foreground"
                        )}>
                          {pilot.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className={cn("font-semibold", isMe ? "text-primary" : "text-foreground")}>{pilot.username}</p>
                          <p className="text-[10px] text-muted-foreground">{pilot.main_simulator}</p>
                        </div>
                      </div>
                    </td>
                    {/* Team */}
                    <td className="px-4 py-3 text-xs text-primary">{pilot.team_name || '—'}</td>
                    {/* Categoria */}
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-[10px] font-bold", categoryColors[pilot.category || 'START'])}>
                        {pilot.category || 'START'}
                      </Badge>
                    </td>
                    {/* Punti totali */}
                    <td className="px-4 py-3">
                      <span className="font-heading text-sm text-primary">{pilot.total_points || 0}</span>
                    </td>
                    {/* Pt velocità */}
                    <td className="px-4 py-3 text-xs text-foreground">{pilot.speed_points || 0}</td>
                    {/* Pt sportività */}
                    <td className="px-4 py-3 text-xs text-foreground">{pilot.sportsmanship_points || 0}</td>
                    {/* Vittorie */}
                    <td className="px-4 py-3 text-xs text-foreground font-semibold">{pilot.wins || 0}</td>
                    {/* Podi */}
                    <td className="px-4 py-3 text-xs text-foreground">{pilot.podiums || 0}</td>
                    {/* Gare */}
                    <td className="px-4 py-3 text-xs text-muted-foreground">{pilot.races_completed || 0}</td>
                    {/* Safety Rating */}
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-xs font-bold", safetyColors[pilot.safety_rating || 'S'])}>
                        {pilot.safety_rating || 'S'}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-border/50 flex flex-wrap gap-4 text-[10px] text-muted-foreground">
        <span>Formula punti: <span className="text-foreground">Pt Totali = Pt Velocità + (Pt Sportività × 1.2)</span></span>
        <span>SR: <span className="text-green-400">S</span> → <span className="text-primary">A</span> → <span className="text-blue-400">B</span> → <span className="text-accent">C</span> → <span className="text-orange-400">D</span> → <span className="text-red-400">E</span> → <span className="text-destructive">F</span></span>
      </div>
    </div>
  );
}