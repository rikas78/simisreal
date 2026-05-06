import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import StandingsPodium from '@/components/standings/StandingsPodium';
import StandingsTable from '@/components/standings/StandingsTable';

const CATEGORIES = ['Tutti', 'START', 'ROOKIE', 'AMATEUR', 'SEMI-PRO', 'PRO', 'K'];
const SIMULATORS = ['Tutti', 'GT7', 'Assetto Corsa', 'iRacing', 'MotoGP'];

export default function Standings() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tutti');
  const [simulatorFilter, setSimulatorFilter] = useState('Tutti');
  const [championshipFilter, setChampionshipFilter] = useState('Tutti');
  const [sortCol, setSortCol] = useState('total_points');
  const [sortDir, setSortDir] = useState(-1);

  const { data: pilots = [], isLoading } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list('-total_points', 200),
  });

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list(),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const championships = useMemo(() => {
    const set = new Set(races.map(r => r.championship).filter(Boolean));
    return ['Tutti', ...set];
  }, [races]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d * -1);
    else { setSortCol(col); setSortDir(-1); }
  };

  const filtered = useMemo(() => {
    return [...pilots]
      .filter(p => {
        if (search && !p.username?.toLowerCase().includes(search.toLowerCase())) return false;
        if (categoryFilter !== 'Tutti' && (p.category || 'START') !== categoryFilter) return false;
        if (simulatorFilter !== 'Tutti' && p.main_simulator !== simulatorFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const av = a[sortCol] || 0;
        const bv = b[sortCol] || 0;
        return sortDir * (typeof av === 'string' ? av.localeCompare(bv) : bv - av);
      });
  }, [pilots, search, categoryFilter, simulatorFilter, sortCol, sortDir]);

  const topThree = filtered.slice(0, 3);
  const myPilot = pilots.find(p => p.created_by === currentUser?.email);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <Trophy className="w-7 h-7 text-accent" />
          Classifica Generale
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{filtered.length} piloti in classifica</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card border-border h-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36 bg-card border-border h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={simulatorFilter} onValueChange={setSimulatorFilter}>
          <SelectTrigger className="w-40 bg-card border-border h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SIMULATORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={championshipFilter} onValueChange={setChampionshipFilter}>
          <SelectTrigger className="w-44 bg-card border-border h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {championships.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Podium */}
      {!search && categoryFilter === 'Tutti' && simulatorFilter === 'Tutti' && topThree.length >= 1 && (
        <StandingsPodium topThree={topThree} />
      )}

      {/* Table */}
      <StandingsTable
        pilots={filtered}
        myPilotId={myPilot?.id}
        isLoading={isLoading}
        sortCol={sortCol}
        sortDir={sortDir}
        onSort={handleSort}
      />
    </div>
  );
}