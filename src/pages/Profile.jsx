import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Save, Trophy, Flag, Award, Euro, Zap, LogOut, Shield, Clock } from 'lucide-react';

import CategoryProgress from '@/components/standings/CategoryProgress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PilotRaceHistory from '@/components/profile/PilotRaceHistory';
import PrizeDashboard from '@/components/profile/PrizeDashboard';

const safetyColors = {
  S: 'text-green-import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Save, Trophy, Flag, Award, Euro, Zap, LogOut, Shield, Clock } from 'lucide-react';

import CategoryProgress from '@/components/standings/CategoryProgress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PilotRaceHistory from '@/components/profile/PilotRaceHistory';
import PrizeDashboard from '@/components/profile/PrizeDashboard';

const safetyColors = {
  S: 'text-green-400 bg-green-400/10 border-green-400/30',
  A: 'text-primary bg-primary/10 border-primary/30',
  B: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  C: 'text-accent bg-accent/10 border-accent/30',
  D: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  E: 'text-red-400 bg-red-400/10 border-red-400/30',
  F: 'text-destructive bg-destructive/10 border-destructive/30',
};
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Profile() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list(),
  });

  const myPilot = pilots.find(p => p.created_by === user?.email);
  const [formData, setFormData] = useState(null);

  React.useEffect(() => {
    if (myPilot && !formData) {
      setFormData({
        nationality: myPilot.nationality || '',
        main_simulator: myPilot.main_simulator || 'GT7',
      });
    }
  }, [myPilot]);

  const createPilotMutation = useMutation({
    mutationFn: (data) => base44.entities.Pilot.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      toast.success('Profilo pilota creato!');
    },
  });

  const updatePilotMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Pilot.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      setIsEditing(false);
      toast.success('Profilo aggiornato!');
    },
  });

  const [newUsername, setNewUsername] = useState('');
  const [newNationality, setNewNationality] = useState('');
  const [newSimulator, setNewSimulator] = useState('GT7');

  const handleCreatePilot = () => {
    if (!newUsername.trim()) return toast.error('Inserisci un username');
    if (!newNationality.trim()) return toast.error('Inserisci la nazionalità');
    createPilotMutation.mutate({
      username: newUsername.trim(),
      nationality: newNationality.trim(),
      main_simulator: newSimulator,
      user_id: user?.id,
    });
  };

  const handleUpdate = () => {
    if (!formData) return;
    updatePilotMutation.mutate({
      id: myPilot.id,
      data: formData,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground">Profilo</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestisci il tuo profilo pilota</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => base44.auth.logout()}
          className="text-destructive hover:text-destructive border-destructive/30"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Esci
        </Button>
      </div>

      {/* User info */}
      <div className="racing-card bg-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-xl text-foreground">{user?.full_name || 'Utente'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {!myPilot ? (
        /* Create pilot profile */
        <div className="racing-card bg-card p-6 space-y-4">
          <h3 className="font-heading text-lg text-foreground">Crea il tuo profilo pilota</h3>
          <p className="text-sm text-muted-foreground">
            Per partecipare alle gare devi creare un profilo pilota. L'username non sarà modificabile.
          </p>
          
          <div className="space-y-3">
            <div>
              <Label>Username (permanente)</Label>
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Il tuo username unico"
                className="bg-background border-border mt-1"
              />
            </div>
            <div>
              <Label>Nazionalità</Label>
              <Input
                value={newNationality}
                onChange={(e) => setNewNationality(e.target.value)}
                placeholder="es. Italia"
                className="bg-background border-border mt-1"
              />
            </div>
            <div>
              <Label>Simulatore Principale</Label>
              <Select value={newSimulator} onValueChange={setNewSimulator}>
                <SelectTrigger className="bg-background border-border mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GT7">GT7</SelectItem>
                  <SelectItem value="Assetto Corsa">Assetto Corsa</SelectItem>
                  <SelectItem value="iRacing">iRacing</SelectItem>
                  <SelectItem value="MotoGP">MotoGP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleCreatePilot}
            disabled={createPilotMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Zap className="w-4 h-4 mr-2" />
            Crea Profilo Pilota
          </Button>
        </div>
      ) : (
        <>
          <Tabs defaultValue="profile">
            <TabsList className="bg-card border border-border flex-wrap h-auto">
              <TabsTrigger value="profile">Profilo</TabsTrigger>
              <TabsTrigger value="history"><Clock className="w-3.5 h-3.5 mr-1.5" />Storico Gare</TabsTrigger>
              <TabsTrigger value="prizes"><Euro className="w-3.5 h-3.5 mr-1.5" />Montepremi</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-5 space-y-4">
          {/* Pilot stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Punti', value: myPilot.total_points || 0, icon: Trophy, color: 'text-primary' },
              { label: 'Vittorie', value: myPilot.wins || 0, icon: Award, color: 'text-accent' },
              { label: 'Gare', value: myPilot.races_completed || 0, icon: Flag, color: 'text-foreground' },
              { label: 'Guadagni', value: `€${myPilot.earnings || 0}`, icon: Euro, color: 'text-accent' },
            ].map(stat => (
              <div key={stat.label} className="racing-card-sm bg-card p-4 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <p className={`font-heading text-xl ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Category progress */}
          <CategoryProgress pilot={myPilot} />

          {/* Safety rating */}
          <div className="racing-card-sm bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Safety Rating</span>
            </div>
            <Badge variant="outline" className={safetyColors[myPilot.safety_rating || 'S']}>
              {myPilot.safety_rating || 'S'}
            </Badge>
          </div>

          {/* Edit profile */}
          <div className="racing-card bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg text-foreground">Dati Pilota</h3>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Modifica
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Username</Label>
                <p className="text-foreground font-semibold">{myPilot.username}</p>
              </div>
              <div>
                <Label>Nazionalità</Label>
                {isEditing ? (
                  <Input
                    value={formData?.nationality || ''}
                    onChange={(e) => setFormData(f => ({ ...f, nationality: e.target.value }))}
                    className="bg-background border-border mt-1"
                  />
                ) : (
                  <p className="text-foreground">{myPilot.nationality}</p>
                )}
              </div>
              <div>
                <Label>Simulatore Principale</Label>
                {isEditing ? (
                  <Select
                    value={formData?.main_simulator || 'GT7'}
                    onValueChange={(v) => setFormData(f => ({ ...f, main_simulator: v }))}
                  >
                    <SelectTrigger className="bg-background border-border mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GT7">GT7</SelectItem>
                      <SelectItem value="Assetto Corsa">Assetto Corsa</SelectItem>
                      <SelectItem value="iRacing">iRacing</SelectItem>
                      <SelectItem value="MotoGP">MotoGP</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-foreground">{myPilot.main_simulator}</p>
                )}
              </div>
              {myPilot.team_name && (
                <div>
                  <Label className="text-muted-foreground">Scuderia</Label>
                  <p className="text-primary font-semibold">{myPilot.team_name}</p>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleUpdate} disabled={updatePilotMutation.isPending} className="bg-primary text-primary-foreground">
                  <Save className="w-4 h-4 mr-2" />
                  Salva
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Annulla</Button>
              </div>
            )}
          </div>
            </TabsContent>

            <TabsContent value="history" className="mt-5">
              <PilotRaceHistory pilot={myPilot} />
            </TabsContent>

            <TabsContent value="prizes" className="mt-5">
              <PrizeDashboard pilot={myPilot} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}400 bg-green-400/10 border-green-400/30',
  A: 'text-primary bg-primary/10 border-primary/30',
  B: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  C: 'text-accent bg-accent/10 border-accent/30',
  D: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  E: 'text-red-400 bg-red-400/10 border-red-400/30',
  F: 'text-destructive bg-destructive/10 border-destructive/30',
};
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Profile() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list(),
  });

  const myPilot = pilots.find(p => p.created_by === user?.email);
  const [formData, setFormData] = useState(null);

  React.useEffect(() => {
    if (myPilot && !formData) {
      setFormData({
        nationality: myPilot.nationality || '',
        main_simulator: myPilot.main_simulator || 'GT7',
      });
    }
  }, [myPilot]);

  const createPilotMutation = useMutation({
    mutationFn: (data) => base44.entities.Pilot.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      toast.success('Profilo pilota creato!');
    },
  });

  const updatePilotMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Pilot.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      setIsEditing(false);
      toast.success('Profilo aggiornato!');
    },
  });

  const [newUsername, setNewUsername] = useState('');
  const [newNationality, setNewNationality] = useState('');
  const [newSimulator, setNewSimulator] = useState('GT7');

  const handleCreatePilot = () => {
    if (!newUsername.trim()) return toast.error('Inserisci un username');
    if (!newNationality.trim()) return toast.error('Inserisci la nazionalità');
    createPilotMutation.mutate({
      username: newUsername.trim(),
      nationality: newNationality.trim(),
      main_simulator: newSimulator,
      user_id: user?.id,
    });
  };

  const handleUpdate = () => {
    if (!formData) return;
    updatePilotMutation.mutate({
      id: myPilot.id,
      data: formData,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
 