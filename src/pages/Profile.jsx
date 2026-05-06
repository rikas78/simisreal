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
 