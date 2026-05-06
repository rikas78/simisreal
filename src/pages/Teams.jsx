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
 