import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flag, Users, Euro } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO, addMonths, subMonths, getDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  upcoming: 'bg-primary/80', live: 'bg-red-500', completed: 'bg-muted-foreground', cancelled: 'bg-destructive/50',
};
const simColors = {
  GT7: 'text-blue-400', 'Assetto Corsa': 'text-green-400', iRacing: 'text-yellow-400', MotoGP: 'text-orange-400',
};

export default function Calendar() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [simFilter, setSimFilter] = useState('Tutti');
  const [champFilter, setChampFilter] = useState('Tutti');

  const { data: races = [], isLoading } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list('-date', 200),
    refetchInterval: 30000,
  });

  const championships = useMemo(() => {
    const s = new Set(races.map(r => r.championship).filter(Boolean));
    return ['Tutti', ...s];
  }, [races]);

  const filteredRaces = useMemo(() => races.filter(r => {
    if (simFilter !== 'Tutti' && r.simulator !== simFilter) return false;
    if (champFilter !== 'Tutti' && r.championship !== champFilter) return false;
    return true;
  }), [races, simFilter, champFilter]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  // Pad start
  const startPad = (getDay(monthStart) + 6) % 7;
  const padDays = Array.from({ length: startPad });

  const racesOnDay = (day) => filteredRaces.filter(r => {
    try { return isSameDay(parseISO(r.date), day); } catch { return false; }
  });

  const selectedRaces = selectedDay ? racesOnDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-primary" />
            Calendario Gare
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{filteredRaces.length} eventi</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={simFilter} onValueChange={setSimFilter}>
            <SelectTrigger className="w-40 bg-card border-border h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['Tutti','GT7','Assetto Corsa','iRacing','MotoGP'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={champFilter} onValueChange={setChampFilter}>
            <SelectTrigger className="w-44 bg-card border-border h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {championships.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Month nav */}
      <div className="racing-card bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-heading text-lg text-foreground capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: it })}
          </h2>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Grid header */}
        <div className="grid grid-cols-7 border-b border-border">
          {['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map(d => (
            <div key={d} className="py-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {padDays.map((_, i) => <div key={`pad-${i}`} className="border-b border-r border-border/30 min-h-[80px]" />)}
          {days.map(day => {
            const dayRaces = racesOnDay(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDay(isSameDay(day, selectedDay) ? null : day)}
                className={cn(
                  "border-b border-r border-border/30 min-h-[80px] p-1.5 cursor-pointer transition-colors",
                  isSelected ? "bg-primary/10" : "hover:bg-secondary/30",
                  !isSameMonth(day, currentMonth) && "opacity-30"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 font-semibold",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayRaces.slice(0, 3).map(race => (
                    <div key={race.id} className={cn(
                      "text-[9px] rounded px-1 py-0.5 truncate text-white font-medium",
                      statusColors[race.status] || 'bg-primary/70'
                    )}>
                      {race.title}
                    </div>
                  ))}
                  {dayRaces.length > 3 && (
                    <div className="text-[9px] text-muted-foreground">+{dayRaces.length - 3} altri</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="racing-card bg-card p-5">
          <h3 className="font-heading text-base text-foreground mb-4 capitalize">
            {format(selectedDay, 'EEEE d MMMM yyyy', { locale: it })}
          </h3>
          {selectedRaces.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna gara in questo giorno con i filtri selezionati.</p>
          ) : (
            <div className="space-y-3">
              {selectedRaces.map(race => {
                const available = (race.max_participants || 0) - (race.current_participants || 0);
                const prize = Math.round((race.entry_fee || 0) * (race.current_participants || 0) * 0.85);
                return (
                  <div
                    key={race.id}
                    onClick={() => navigate(`/races/${race.id}`)}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors border border-border/50"
                  >
                    <div className={cn("w-2 h-12 rounded-full flex-shrink-0", statusColors[race.status] || 'bg-primary')} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-heading text-sm text-foreground">{race.title}</p>
                        <Badge variant="outline" className="text-[10px]">{race.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Flag className="w-3 h-3" />{race.track || '—'}</span>
                        <span className={cn("font-medium", simColors[race.simulator])}>{race.simulator}</span>
                        {race.championship && <span className="text-primary">{race.championship}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <div className="flex items-center gap-1 text-xs text-foreground justify-end">
                        <Users className="w-3 h-3" />
                        <span className={cn(available <= 3 ? "text-destructive font-bold" : "")}>
                          {available} posti liberi
                        </span>
                      </div>
                      <div className="text-xs text-accent font-semibold">
                        {format(parseISO(race.date), 'HH:mm')}
                      </div>
                      {prize > 0 && <div className="text-xs text-primary">€{prize.toLocaleString('it')}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-xs text-muted-foreground">
        {Object.entries(statusColors).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className={cn("w-2.5 h-2.5 rounded-full", v)} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}