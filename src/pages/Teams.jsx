import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Building2, Search, Users, Trophy, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import CreateTeamModal from '@/components/teams/CreateTeamModal';
import TeamManagerDashboard from '@/components/teams/TeamManagerDashboard';
import TeamStats from '@/components/teams/TeamStats';

const categoryColors = {
  START: 'text-muted-foreground',
  ROOKIE: 'text-blue-400',
  AMATEUR: 'text-cyan-400',
  'SEMI-PRO': 'text-accent',
  PRO: 'text-green-400',
  K: 'text-purple-400',
};

export default function Teams() {
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-created_date'),
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list(),
  });

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const filteredTeams = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teams;

    return teams.filter((team) => {
      const name = (team.name || '').toLowerCase();
      const tag = (team.tag || '').toLowerCase();
      const description = (team.description || '').toLowerCase();
      return name.includes(q) || tag.includes(q) || description.includes(q);
    });
  }, [teams, search]);

  const myPilot = useMemo(() => {
    if (!me?.email) return null;
    return pilots.find((p) => p.email === me.email) || null;
  }, [pilots, me]);

  const myTeam = useMemo(() => {
    if (!myPilot?.team_id) return null;
    return teams.find((t) => t.id === myPilot.team_id) || null;
  }, [teams, myPilot]);

  const handleJoinRequest = (team) => {
    toast.info(`Richiesta di ingresso a ${team.name || 'team'} non ancora collegata al backend`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" />
            Teams
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestisci il tuo team, scopri le scuderie e confronta statistiche
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Crea team
        </Button>
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="my-team">Il mio team</TabsTrigger>
          <TabsTrigger value="stats">Statistiche</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4 mt-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca team per nome, tag o descrizione..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {teamsLoading ? (
            <div className="racing-card bg-card p-6 text-sm text-muted-foreground">
              Caricamento team...
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="racing-card bg-card p-6 text-sm text-muted-foreground">
              Nessun team trovato.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredTeams.map((team) => {
                const members = pilots.filter((p) => p.team_id === team.id);
                const captain = members.find((p) => p.id === team.captain_id);

                return (
                  <div key={team.id} className="racing-card bg-card p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading text-xl text-foreground">
                            {team.name || 'Team senza nome'}
                          </h3>
                          {team.tag && (
                            <Badge variant="outline" className="text-xs">
                              {team.tag}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                          {team.description || 'Nessuna descrizione disponibile.'}
                        </p>
                      </div>

                      <Badge variant="outline" className="text-xs">
                        {team.status || 'active'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Membri
                        </p>
                        <p className="text-lg font-bold text-foreground flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          {members.length}
                        </p>
                      </div>

                      <div className="rounded-lg border border-border p-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Categoria top
                        </p>
                        <p className={cn('text-sm font-bold', categoryColors[team.category] || 'text-foreground')}>
                          {team.category || 'N/D'}
                        </p>
                      </div>

                      <div className="rounded-lg border border-border p-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Captain
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {captain?.full_name || 'Non assegnato'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        Team ranking e palmarès in aggiornamento
                      </div>

                      <Button variant="outline" size="sm" onClick={() => handleJoinRequest(team)}>
                        Richiedi ingresso
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-team" className="mt-4">
          {myTeam ? (
            <TeamManagerDashboard team={myTeam} pilot={myPilot} />
          ) : (
            <div className="racing-card bg-card p-6 space-y-3">
              <h3 className="font-heading text-lg text-foreground">Nessun team associato</h3>
              <p className="text-sm text-muted-foreground">
                Non fai ancora parte di un team oppure il profilo pilota non è collegato.
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Crea un team
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <TeamStats teams={teams} pilots={pilots} />
        </TabsContent>
      </Tabs>

      <CreateTeamModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        currentPilot={myPilot}
      />
    </div>
  );
}