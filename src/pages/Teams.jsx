import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Search, Users, Trophy, Plus, ChevronRight, Crown, Flag, Check, X, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import CreateTeamModal from '@/components/teams/CreateTeamModal';
import TeamManagerDashboard from '@/components/teams/TeamManagerDashboard';
import TeamStats from '@/components/teams/TeamStats';

const categoryColors = {
  START: 'text-muted-foreground', ROOKIE: 'text-blue-400', AMATEUR: 'text-cyan-400',
  'SEMI-PRO': 'text-accent', PRO: 'text-green-400', K: 'text-purple-400',
};

export import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Search, Users, Trophy, Plus, ChevronRight, Crown, Flag, Check, X, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import CreateTeamModal from '@/components/teams/CreateTeamModal';
import TeamManagerDashboard from '@/components/teams/TeamManagerDashboard';
import TeamStats from '@/components/teams/TeamStats';

const categoryColors = {
  START: 'text-muted-foreground', ROOKIE: 'text-blue-400', AMATEUR: 'text-cyan-400',
  'SEMI-PRO': 'text-accent', PRO: 'text-green-400', K: 'text-purple-400',
};

export default function Teams() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [requestingTeam, setRequestingTeam] = useState(null);

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-total_points', 100),
  });
  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list('-total_points', 200),
  });
  const { data: teamRequests = [] } = useQuery({
    queryKey: ['team-requests'],
    queryFn: () => base44.entities.TeamRequest.list('-created_date', 100),
  });
  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list(),
  });

  const myPilot = pilots.find(p => p.created_by === me?.email);
  const myTeam = teams.find(t => t.id === myPilot?.team_id);
  const isManager = myTeam?.manager_id === myPilot?.id;

  const sendRequestMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-requests'] });
      setRequestingTeam(null);
      setRequestMsg('');
      toast.success('Richiesta inviata!');
    },
  });

  const handleSendRequest = (team) => {
    if (!myPilot) return toast.error('Crea prima il tuo profilo pilota');
    const alreadySent = teamRequests.find(r => r.team_id === team.id && r.pilot_id === myPilot.id && r.status === 'pending');
    if (alreadySent) return toast.error('Hai già una richiesta in attesa');
    sendRequestMutation.mutate({
      team_id: team.id,
      team_name: team.name,
      pilot_id: myPilot.id,
      pilot_username: myPilot.username,
      message: requestMsg,
    });
  };

  // Build standings with pilots per team
  const teamStandings = useMemo(() => {
    return [...teams]
      .map(team => {
        const members = pilots.filter(p => p.team_id === team.id);
        const totalPts = members.reduce((s, p) => s + (p.total_points || 0), 0);
        return { ...team, members, computedPoints: totalPts };
      })
      .sort((a, b) => b.computedPoints - a.computedPoints);
  }, [teams, pilots]);

  const filtered = teamStandings.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.tag?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground">Scuderie</h1>
          <p className="text-muted-foreground text-sm mt-1">{teams.length} scuderie registrate</p>
        </div>
        {!myPilot?.team_id && (
          <Button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />Fonda Scuderia
          </Button>
        )}
      </div>

      <Tabs defaultValue={isManager ? 'dashboard' : 'standings'}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="standings">Classifica</TabsTrigger>
          <TabsTrigger value="stats">📊 Statistiche</TabsTrigger>
          <TabsTrigger value="teams">Tutte le Scuderie</TabsTrigger>
          {isManager && <TabsTrigger value="dashboard">Dashboard Manager</TabsTrigger>}
        </TabsList>

        {/* STANDINGS TAB */}
        <TabsContent value="standings" className="mt-5">
          <div className="racing-card bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Pos','Scuderia','Manager','Piloti','Punti Totali'].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamStandings.map((team, idx) => (
                    <tr key={team.id} className={cn(
                      "border-b border-border/40 hover:bg-secondary/10 transition-colors",
                      myTeam?.id === team.id && "bg-primary/5 border-primary/20"
                    )}>
                      <td className="px-4 py-3">
                        <span className={cn("font-heading text-sm",
                          idx === 0 ? "text-accent" : idx === 1 ? "text-muted-foreground" : idx === 2 ? "text-orange-400" : "text-muted-foreground"
                        )}>{idx + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="font-heading text-xs text-primary">{team.tag}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{team.name}</p>
                            {myTeam?.id === team.id && <span className="text-[10px] text-primary">(la tua scuderia)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{team.manager_username || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {team.members.slice(0,4).map(m => (
                            <span key={m.id} className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-foreground">{m.username}</span>
                          ))}
                          {team.members.length > 4 && <span className="text-[10px] text-muted-foreground">+{team.members.length - 4}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-heading text-base text-primary">{team.computedPoints}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TEAMS LIST TAB */}
        <TabsContent value="teams" className="mt-5">
          <div className="relative max-w-md mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca scuderia..." className="pl-10 bg-card border-border" />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="racing-card bg-card h-48 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(team => (
                <div key={team.id} className="racing-card bg-card p-5 hover:glow-primary transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="font-heading text-sm text-primary">{team.tag}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-base text-foreground truncate">{team.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Crown className="w-3 h-3" />{team.manager_username || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {team.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{team.description}</p>}
                  <div className="flex gap-2 flex-wrap mb-3">
                    {team.members.slice(0, 3).map(m => (
                      <span key={m.id} className="text-[10px] px-2 py-0.5 bg-secondary rounded-full text-foreground">{m.username}</span>
                    ))}
                    {team.members.length > 3 && <span className="text-[10px] text-muted-foreground self-center">+{team.members.length - 3}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50 mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm">{team.member_count || team.members.length || 1}</span>
                      <span className="text-xs text-muted-foreground">membri</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-accent" />
                      <span className="text-sm font-heading text-primary">{team.computedPoints}</span>
                      <span className="text-xs text-muted-foreground">pts</span>
                    </div>
                  </div>
                  {/* Request to join */}
                  {myPilot && !myPilot.team_id && myTeam?.id !== team.id && (
                    requestingTeam?.id === team.id ? (
                      <div className="space-y-2">
                        <Input
                          value={requestMsg}
                          onChange={e => setRequestMsg(e.target.value)}
                          placeholder="Messaggio di presentazione..."
                          className="text-xs bg-background border-border h-8"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSendRequest(team)} disabled={sendRequestMutation.isPending} className="bg-primary text-primary-foreground flex-1 h-7 text-xs">
                            <Send className="w-3 h-3 mr-1" />Invia
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRequestingTeam(null)} className="h-7 text-xs">Annulla</Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setRequestingTeam(team)} className="w-full h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                        Richiedi Accesso
                      </Button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* STATS TAB */}
        <TabsContent value="stats" className="mt-5">
          <TeamStats teamStandings={teamStandings} />
        </TabsContent>

        {/* MANAGER DASHBOARD */}
        {isManager && (
          <TabsContent value="dashboard" className="mt-5">
            <TeamManagerDashboard team={myTeam} pilots={pilots} teamRequests={teamRequests} races={races} myPilot={myPilot} />
          </TabsContent>
        )}
      </Tabs>

      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} myPilot={myPilot} />}
    </div>
  );
}default function Teams() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [requestingTeam, setRequestingTeam] = useState(null);

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-total_points', 100),
  });
  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list('-total_points', 200),
  });
  const { data: teamRequests = [] } = useQuery({
    queryKey: ['team-requests'],
    queryFn: () => base44.entities.TeamRequest.list('-created_date', 100),
  });
  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list(),
  });

  const myPilot = pilots.find(p => p.created_by === me?.email);
  const myTeam = teams.find(t => t.id === myPilot?.team_id);
  const isManager = myTeam?.manager_id === myPilot?.id;

  const sendRequestMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-requests'] });
      setRequestingTeam(null);
      setRequestMsg('');
      toast.success('Richiesta inviata!');
    },
  });

  const handleSendRequest = (team) => {
    if (!myPilot) return toast.error('Crea prima il tuo profilo pilota');
    const alreadySent = teamRequests.find(r => r.team_id === team.id && r.pilot_id === myPilot.id && r.status === 'pending');
    if (alreadySent) return toast.error('Hai già una richiesta in attesa');
    sendRequestMutation.mutate({
      team_id: team.id,
      team_name: team.name,
      pilot_id: myPilot.id,
      pilot_username: myPilot.username,
      message: requestMsg,
    });
  };

  // Build standings with pilots per team
  const teamStandings = useMemo(() => {
    return [...teams]
      .map(team => {
        const members = pilots.filter(p => p.team_id === team.id);
        const totalPts = members.reduce((s, p) => s + (p.total_points || 0), 0);
        return { ...team, members, computedPoints: totalPts };
      })
      .sort((a, b) => b.computedPoints - a.computedPoints);
  }, [teams, pilots]);

  const filtered = teamStandings.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.tag?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground">Scuderie</h1>
          <p className="text-muted-foreground text-sm mt-1">{teams.length} scuderie registrate</p>
        </div>
        {!myPilot?.team_id && (
          <Button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />Fonda Scuderia
          </Button>
        )}
      </div>

      <Tabs defaultValue={isManager ? 'dashboard' : 'standings'}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="standings">Classifica</TabsTrigger>
          <TabsTrigger value="stats">📊 Statistiche</TabsTrigger>
          <TabsTrigger value="teams">Tutte le Scuderie</TabsTrigger>
          {isManager && <TabsTrigger value="dashboard">Dashboard Manager</TabsTrigger>}
        </TabsList>

        {/* STANDINGS TAB */}
        <TabsContent value="standings" className="mt-5">
          <div className="racing-card bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Pos','Scuderia','Manager','Piloti','Punti Totali'].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamStandings.map((team, idx) => (
 