import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock, Unlock, Shield } from 'lucide-react';
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

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: escrows = [], isLoading } = useQuery({
    queryKey: ['escrows'],
    queryFn: () => base44.entities.EscrowRace.list('-created_date', 100),
  });

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list(),
  });

  const updateEscrow = useMutation({
    mutationFn: async (variables) => {
      const { id, status, reason, raceId } = variables;
      const now = new Date().toISOString();

      await base44.entities.EscrowRace.update(id, {
        status,
        frozen_reason: reason || null,
        frozen_at: status === 'frozen' ? now : null,
        released_at: status === 'released' ? now : null,
        released_by: status === 'released' ? user?.email ?? null : null,
      });

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
    onError: () => {
      toast.error('Errore durante l’aggiornamento escrow');
    },
  });

  const enriched = escrows.map((e) => ({
    ...e,
    race: races.find((r) => r.id === e.race_id),
  }));

  const totals = {
    deposited: escrows
      .filter((e) => e.status === 'deposited')
      .reduce((s, e) => s + (e.amount_gw || 0), 0),
    frozen: escrows
      .filter((e) => e.status === 'frozen')
      .reduce((s, e) => s + (e.amount_gw || 0), 0),
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" />
          Admin — Gestione Escrow
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Montepremi garantiti, freeze e release
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Totale Escrow', value: escrows.length, sub: 'gare', color: 'text-foreground' },
          {
            label: 'Depositati',
            value: escrows.filter((e) => e.status === 'deposited').length,
            sub: formatGW(totals.deposited),
            color: 'text-green-400',
          },
          {
            label: 'Congelati',
            value: escrows.filter((e) => e.status === 'frozen').length,
            sub: formatGW(totals.frozen),
            color: 'text-orange-400',
          },
          {
            label: 'Rilasciati',
            value: escrows.filter((e) => e.status === 'released').length,
            sub: 'completati',
            color: 'text-primary',
          },
        ].map((s) => (
          <div key={s.label} className="racing-card-sm bg-card p-4 text-center">
            <p className={cn('font-heading text-2xl font-black', s.color)}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
              {s.label}
            </p>
            <p className="text-[10px] text-muted-foreground/60">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="racing-card bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Gara', 'Montepremi Escrow', 'Stato', 'Data', 'Azioni'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Caricamento...
                  </td>
                </tr>
              ) : enriched.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nessun escrow registrato
                  </td>
                </tr>
              ) : (
                enriched.map((e) => {
                  const sc = statusConfig[e.status] || statusConfig.pending;

                  return (
                    <tr
                      key={e.id}
                      className="border-b border-border/40 hover:bg-secondary/10 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">
                          {e.race?.title || e.race_title || '—'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {e.race?.simulator || ''}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-heading text-base text-primary font-black">
                          {formatGW(e.amount_gw || 0)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatEur(gwToEur(e.amount_gw || 0))}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn('text-[10px]', sc.color)}>
                          {sc.label}
                        </Badge>
                        {e.frozen_reason && (
                          <p className="text-[10px] text-orange-400 mt-1">
                            {e.frozen_reason}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {e.created_date
                          ? format(new Date(e.created_date), 'd MMM yy', { locale: it })
                          : '—'}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {e.status === 'deposited' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-orange-400/30 text-orange-400 hover:bg-orange-400/10"
                              onClick={() =>
                                updateEscrow.mutate({
                                  id: e.id,
                                  status: 'frozen',
                                  reason: 'Freeze admin manuale',
                                  raceId: e.race_id,
                                })
                              }
                              disabled={updateEscrow.isPending}
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              Freeze
                            </Button>
                          )}

                          {(e.status === 'frozen' || e.status === 'deposited') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-green-400/30 text-green-400 hover:bg-green-400/10"
                              onClick={() =>
                                updateEscrow.mutate({
                                  id: e.id,
                                  status: 'released',
                                  raceId: e.race_id,
                                })
                              }
                              disabled={updateEscrow.isPending}
                            >
                              <Unlock className="w-3 h-3 mr-1" />
                              Release
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}