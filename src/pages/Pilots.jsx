import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Trophy, Flag, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Pilots() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { data: pilots = [], isLoading } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list('-total_points', 100),
  });

  const filtered = pilots.filter(p =>
    !search || p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.nationality?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-foreground">Piloti</h1>
        <p className="text-muted-foreground text-sm mt-1">{pilots.length} piloti registrati</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome o nazionalità..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="racing-card bg-card h-44 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="racing-card bg-card p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nessun pilota trovato</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(pilot => (
            <div key={pilot.id} onClick={() => navigate(`/pilots/${pilot.id}`)} className="racing-card bg-card p-5 hover:glow-primary transition-all cursor-pointer hover:border-primary/30 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                  <span className="font-heading text-base text-foreground">
                    {pilot.username?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-sm text-foreground truncate">{pilot.username}</p>
                  <p className="text-xs text-muted-foreground">{pilot.nationality}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <Zap className="w-3.5 h-3.5" />
                <span>{pilot.main_simulator}</span>
                {pilot.team_name && (
                  <>
                    <span className="text-border">|</span>
                    <span className="text-primary">{pilot.team_name}</span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                <div className="text-center">
                  <p className="font-heading text-sm text-primary">{pilot.total_points || 0}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Punti</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-sm text-foreground">{pilot.wins || 0}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Vittorie</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-sm text-foreground">{pilot.races_completed || 0}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Gare</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}