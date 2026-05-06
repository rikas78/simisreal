import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Calendar, Users, Euro, Trophy, Shield, Lock, AlertTriangle, CheckCircle2, Zap, Clock, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format, parseISO, differenceInHours } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import RaceSettingsBadge from '@/components/races/RaceSettingsBadge';
import PilotsList from '@/components/races/PilotsList';
import RegistrationModal from '@/components/races/RegistrationModal';
import PayoutPanel from '@/components/races/PayoutPanel';

function getPrizePool(race) {
  return Math.round((race.entry_fee || 0) * (race.current_participants || 0) * 0.85);
}

function getComputedStatus(race) {
  if (!race) return 'upcoming';
  if (race.status === 'live') return 'live';
  if (race.status === 'completed' || race.status === 'cancelled') return race.status;
  const hoursUntil = differenceInHours(parseISO(race.date), new Date());
  if (hoursUntil <= 0) return 'completed';
  if (hoursUntil <= 24) return 'prossima';
  const isFull = race.current_participants >= race.max_participants;
  if (isFull) return 'piena';
  return 'aperta';
}

const statusConfig = {
  live:       { label: 'LIVE',         class: 'bg-destructive/15 text-destructive border-destructive/40', pulse: true },
  aperta:     { label: 'APERTA',       class: 'bg-green-500/15 text-green-400 border-green-500/40' },
  piena:      { label: 'PIENA',        class: 'bg-orange-500/15 text-orange-400 border-orange-500/40' },
  prossima:   { label: 'PROSSIMA',     class: 'bg-accent/15 text-accent border-accent/40' },
  completed:  { label: 'COMPLETATA',   class: 'bg-muted/50 text-muted-foreground border-border' },
  cancelled:  { label: 'CANCELLATA',   class: 'bg-muted/50 text-muted-foreground border-border' },
  upcoming:   { label: 'IN PROGRAMMA', class: 'bg-primary/10 text-primary border-primary/20' },
};

export default function RaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRegModal, setShowRegModal] = useState(false);

  const { data: race, isLoading } = useQuery({
    queryKey: ['race', id],
    queryFn: () => base44.entities.Race.filter({ id }),
    select: (data) => Array.isArray(data) ? data[0] : data,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list(),
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const newCount = (race.current_participants || 0) + 1;
      const newIds = [...(race.registered_pilot_ids || []), currentUser?.email];
      return base44.entities.Race.update(id, {
        current_participants: newCount,
        registered_pilot_ids: newIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['race', id] });
      queryClient.invalidateQueries({ queryKey: ['races'] });
      toast.success('Iscrizione completata! 🏁');
      setShowRegModal(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-card rounded animate-pulse" />
        <div className="racing-card bg-card h-64 animate-pulse" />
      </div>
    );
  }

  if (!race) {
    return (
      <div className="text-center py-20">
 