import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock, Unlock, CheckCircle, AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatGW, gwToEur, formatEur } from '@/lib/walletUtils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const statusConfig = {
  pending: { label: 'In attesa deposito', color: 'text-muted-foreground border-border' },
  deposited: { label: 'Depositato', color: 'text-green-400 border-green-400/30 bg-green-400/5' },
  frozen: { label: 'Congelato', color: 'text-orange-400 border-orange-400/30 bg-orange-400/5' },
  released: { label: 'Rilasciato', color: 'text-primary border-primary/30 bg-primary/5' },
  refunded: { label: 'Rimborsato', color: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
};

export default function AdminEscrow() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: escrows = [], isLoading } = useQuery({
    queryKey: ['escrows'],
    queryFn: () => base44.entities.EscrowRace.list('-created_date', 100),
  });

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list(),
  });

  const updateEscrow = useMutation({
    mutationFn: async ({ id, status, reason, raceId }) => {
      const now = new Date().toISOString();
      await base44.entities.EscrowRace.update(id, {
        status,
        frozen_reason: reason || null,
        frozen_at: status === 'frozen' ? now : null,
        released_at: status === 'released' ? now : null,
        released_by: status === 'released' ? user?.email : null,
      });
      // Update race escrow_status
      if (raceId) {
        await base44.entities.Race.update(raceId, {
          escrow_status: status,
          prize_frozen: status === 'frozen',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      queryClient.invalidateQueries({ queryKey: ['races'] });
      toast.success('Escrow aggiornato');
    },
  });

  const enriched = escrows.map(e => ({
    ...e,
    race: races.find(r => r.id === e.race_id),
  }));

  const totals = {
    deposited: escrows.filter(e => e.status === 'deposited').reduce((s, e) => s + (e.amount_gw || 0), 0),
    frozen: escrows.filter(e => e.status === 'frozen').reduce((s, e) => s + (e.amount_gw || 0), 0),
  };

  return (
 