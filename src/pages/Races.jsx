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
