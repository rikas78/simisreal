import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Flag, Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { isToday, isThisWeek, isThisMonth, parseISO, getHours, differenceInHours } from 'date-fns';
import RaceCard from '@/components/races/RaceCard';
import FiltersSidebar from '@/components/races/FiltersSidebar';
import QuickFilterChips from '@/components/races/QuickFilterChips';
import { useNavigate } from 'react-router-dom';

function parseSmartSearch(query) {
  const q = query.toLowerCase();
  const result = { track: null, category: null, timeSlot: null, rawWords: [] };

  const tracks = ['monza', 'spa', 'nurburgring', 'mugello', 'imola', 'silverstone', 'brands hatch', 'laguna seca', 'suzuka', 'interlagos'];
  const categories = ['gt3', 'gt4', 'formula', 'rally', 'endurance'];
  const timeMap = { 'mattina': 'morning', 'pomeriggio': 'afternoon', 'sera': 'evening', 'notte': 'night' };
  const dayMap = { 'oggi': 'today', 'domani': 'tomorrow', 'settimana': 'week' };

  tracks.forEach(t => { if (q.includes(t)) result.track = t; });
  categories.forEach(c => { if (q.includes(c)) result.category = c.toUpperCase().replace('FORMULA','Formula').replace('ENDURANCE','Endurance').replace('RALLY','Rally'); });
  Object.entries(timeMap).forEach(([k, v]) => { if (q.includes(k)) result.timeSlot = v; });
  Object.entries(dayMap).forEach(([k, v]) => { if (q.includes(k)) result.dayFilter = v; });

  result.rawWords = q.split(' ').filter(w => w.length > 2);
  return result;
}

function getPrizePool(race) {
  return Math.round((race.entry_fee || 0) * (race.current_participants || 0) * 0.85);
}

function getComputedStatus(race) {
  if (race.status === 'live') return 'live';
  if (race.status === 'completed' || race.status === 'cancelled') return race.status;
  const hoursUntil = differenceInHours(parseISO(race.date), new Date());
  if (hoursUntil <= 0) return 'completed';
  if (hoursUntil <= 24) return 'prossima';
  const isFull = race.current_participants >= race.max_participants;
  if (isFull) return 'piena';
  return 'aperta';
}

export default function Races() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: null, timeSlot: null, status: null,
    category: null, track: null, prizeRange: null, sizeRange: null,
  });

  const { data: races = [], isLoading } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list('-date', 200),
  });

  const smartSearch = useMemo(() => parseSmartSearch(search), [search]);

  const filtered = useMemo(() => {
    return races.filter(race => {
      const computedStatus = getComputedStatus(race);
      const raceDate = parseISO(race.date);
      const hour = getHours(raceDate);
      const prizePool = getPrizePool(race);

      // Smart search
      if (search.trim()) {
        const { track, category, timeSlot, dayFilter, rawWords } = smartSearch;
        if (track && !race.track?.toLowerCase().includes(track)) return false;
        if (category && race.category !== category) return false;
        if (timeSlot) {
          const slots = { morning: [6,12], afternoon: [12,18], evening: [18,24], night: [0,6] };
          const [s, e] = slots[timeSlot];
          if (!(hour >= s && hour < e)) return false;
        }
        if (dayFilter === 'today' && !isToday(raceDate)) return false;
        if (dayFilter === 'week' && !isThisWeek(raceDate)) return false;
        // fallback raw text match
        const hasTrackOrCategory = track || category || timeSlot || dayFilter;
        if (!hasTrackOrCategory) {
          const matchText = `${race.title} ${race.track} ${race.simulator} ${race.category}`.toLowerCase();
          if (!rawWords.some(w => matchText.includes(w))) return false;
        }
      }

      // Quick filters
      if (quickFilter === 'live' && computedStatus !== 'live') return false;
      if (quickFilter === 'today' && !isToday(raceDate)) return false;
      if (quickFilter === 'highstakes' && prizePool < 200) return false;
      if (quickFilter === 'campionato' && !race.championship) return false;

      // Sidebar filters
      if (filters.dateRange === 'today' && !isToday(raceDate)) return false;
      if (filters.dateRange === 'week' && !isThisWeek(raceDate)) return false;
      if (filters.dateRange === 'month' && !isThisMonth(raceDate)) return false;
      if (filters.timeSlot) {
        const slots = { morning: [6,12], afternoon: [12,18], evening: [18,24], night: [0,6] };
        const [s, e] = slots[filters.timeSlot];
        if (!(hour >= s && hour < e)) return false;
      }
      if (filters.status && filters.status !== computedStatus) return false;
      if (filters.category && race.category !== filters.category) return false;
      if (filters.track && race.track !== filters.track) return false;
      if (filters.prizeRange === 'free' && (race.entry_fee || 0) > 0) return false;
      if (filters.prizeRange === '10-50' && !(prizePool >= 10 && prizePool <= 50)) return false;
      if (filters.prizeRange === '50-200' && !(prizePool > 50 && prizePool <= 200)) return false;
      if (filters.prizeRange === '200+' && prizePool <= 200) return false;
      if (filters.sizeRange === 'small' && !((race.max_participants || 0) <= 12)) return false;
      if (filters.sizeRange === 'medium' && !((race.max_participants || 0) >= 13 && (race.max_participants || 0) <= 20)) return false;
      if (filters.sizeRange === 'large' && !((race.max_participants || 0) > 20)) return false;

      return true;
    });
  }, [races, search, smartSearch, quickFilter, filters]);

  const allTracks = useMemo(() => [...new Set(races.map(r => r.track).filter(Boolean))].sort(), [races]);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground">Gare & Tornei</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} eventi trovati</p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
            sidebarOpen || activeFilterCount > 0
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:border-primary/50"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtri
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary-foreground text-primary text-xs flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Smart Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder='Cerca libero: "monza domani sera GT3"'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border h-11"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick filter chips */}
      <QuickFilterChips active={quickFilter} onChange={setQuickFilter} />

      {/* Main layout */}
      <div className="flex gap-6">
        {/* Sidebar */}
        {sidebarOpen && (
          <FiltersSidebar
            filters={filters}
            onChange={setFilters}
            tracks={allTracks}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Race list */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="racing-card bg-card h-52 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="racing-card bg-card p-16 text-center">
              <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nessuna gara corrisponde ai filtri</p>
              <button onClick={() => { setSearch(''); setFilters({ dateRange: null, timeSlot: null, status: null, category: null, track: null, prizeRange: null, sizeRange: null }); setQuickFilter(null); }} className="mt-3 text-primary text-sm hover:underline">
                Rimuovi tutti i filtri
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filtered.map(race => (
                <RaceCard
                  key={race.id}
                  race={race}
                  computedStatus={getComputedStatus(race)}
                  prizePool={getPrizePool(race)}
                  onClick={() => navigate(`/races/${race.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}