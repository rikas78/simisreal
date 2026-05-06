import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, XCircle, Trash2, Flag, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import RaceFormModal from './RaceFormModal';

const EMPTY_FORM = {
  title: '', championship: '', description: '', regulations: '',
  simulator: 'GT7', category: 'GT3', track: '',
  date: '', duration_laps: '', duration_minutes: '',
  entry_fee: 0, min_participants: 2, max_participants: 20,
  status: 'upcoming',
  bop: false, realistic_damage: true, weather: 'Fisso',
  fuel_consumption: false, mandatory_pitstop: false, stability_control: 'Consentito',
  prize_pct_1: 50, prize_pct_2: 30, prize_pct_3: 20,
};

const statusColors = {
  upcoming: 'bg-primary/10 text-primary border-primary/20',
  live: 'bg-destructive/10 text-destructive border-destructive/20',
  completed: 'bg-muted/50 text-muted-foreground border-border',
  cancelled: 'bg-secondary text-muted-foreground border-border',
};

export default function AdminRaces() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRace, setEditingRace] = useState(null);

  const { data: races = [], isLoading } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list('-date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Race.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['races'] }); setModalOpen(false); toast.success('Gara creata!'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Race.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['races'] }); setModalOpen(false); setEditingRace(null); toast.success('Gara aggiornata!'); },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.Race.update(id, { status: 'cancelled' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['races'] }); toast.success('Gara annullata'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Race.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['races'] }); toast.success('Gara eliminata'); },
  });

  const handleSave = (form) => {
    if (editingRace) {
      updateMutation.mutate({ id: editingRace.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const openEdit = (race) => {
    setEditingRace(race);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingRace(null);
    setModalOpen(true);
  };

  // Stats
  const liveCount = races.filter(r => r.status === 'live').length;
  const upcomingCount = races.filter(r => r.status === 'upcoming').length;
  const completedCount = races.filter(r => r.status === 'completed').length;

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Totale', value: races.length, color: 'text-foreground' },
          { label: 'In Programma', value: upcomingCount, color: 'text-primary' },
          { label: 'LIVE', value: liveCount, color: 'text-destructive' },
          { label: 'Completate', value: completedCount, color: 'text-muted-foreground' },
        ].map(s => (
          <div key={s.label} className="racing-card-sm bg-card p-4 text-center">
            <p className={cn("font-heading text-2xl", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm uppercase tracking-wider text-muted-foreground">Tutte le Gare</h2>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Crea Nuova Gara
        </Button>
      </div>

      {/* Table */}
      <div className="racing-card bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Nome / Campionato', 'Data', 'Status', 'Iscritti', 'Montepremi', 'Azioni'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Caricamento...</td></tr>
              ) : races.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nessuna gara</td></tr>
              ) : (
                races.map(race => {
                  const prizePool = Math.round((race.entry_fee || 0) * (race.current_participants || 0) * 0.85);
                  return (
                    <tr key={race.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{race.title}</p>
                        {race.championship && <p className="text-xs text-muted-foreground">{race.championship}</p>}
                        <p className="text-xs text-muted-foreground">{race.simulator} · {race.track || 'TBD'}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {race.date ? format(parseISO(race.date), "d MMM yyyy\nHH:mm", { locale: it }) : 'TBD'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("text-xs", statusColors[race.status])}>
                          {race.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        {race.current_participants || 0} / {race.max_participants || '∞'}
                      </td>
                      <td className="px-4 py-3 text-xs text-accent font-semibold">
                        €{prizePool.toLocaleString('it')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(race)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" title="Modifica">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => race.status !== 'cancelled' && cancelMutation.mutate(race.id)}
                            disabled={race.status === 'cancelled'}
                            className="p-1.5 rounded hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors disabled:opacity-40" title="Annulla"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteMutation.mutate(race.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Elimina">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {modalOpen && (
        <RaceFormModal
          race={editingRace}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingRace(null); }}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}