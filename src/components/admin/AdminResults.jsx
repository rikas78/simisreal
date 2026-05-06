import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Plus, CheckCircle2, DollarSign, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SPEED_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

function calcSpeedPoints(pos) {
  return SPEED_POINTS[pos - 1] || 0;
}

function calcTotalPoints(speedPts, sportsPts) {
  return Math.round(speedPts + sportsPts * 1.2);
}

export default function AdminResults() {
  const queryClient = useQueryClient();
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [rows, setRows] = useState([]);
  const [verified, setVerified] = useState(false);
  const [prizeDistributed, setPrizeDistributed] = useState(false);
  const [prizeDate, setPrizeDate] = useState('');

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list('-date', 100),
    select: data => data.filter(r => r.status === 'completed' || r.status === 'live'),
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list(),
  });

  const { data: existingResults = [] } = useQuery({
    queryKey: ['results', selectedRaceId],
    queryFn: () => base44.entities.RaceResult.filter({ race_id: selectedRaceId }),
    enabled: !!selectedRaceId,
  });

  const saveResultsMutation = useMutation({
    mutationFn: async () => {
      // Save each row as a RaceResult
      const selectedRace = races.find(r => r.id === selectedRaceId);
      await Promise.all(rows.filter(r => r.pilot_id).map(row => {
        const sp = calcSpeedPoints(row.position);
        const total = calcTotalPoints(sp, row.sportsmanship_points);
        const data = {
          race_id: selectedRaceId,
          race_title: selectedRace?.title,
          pilot_id: row.pilot_id,
          pilot_username: pilots.find(p => p.id === row.pilot_id)?.username,
          position: row.position,
          gap: row.gap,
          speed_points: sp,
          sportsmanship_points: row.sportsmanship_points,
          total_points: total,
          penalties: row.penalties,
          notes: row.notes,
          verified,
          prize_distributed: prizeDistributed,
          prize_distributed_date: prizeDate || undefined,
        };
        // Update pilot stats
        const pilot = pilots.find(p => p.id === row.pilot_id);
        if (pilot) {
          base44.entities.Pilot.update(row.pilot_id, {
            total_points: (pilot.total_points || 0) + total,
            speed_points: (pilot.speed_points || 0) + sp,
            sportsmanship_points: (pilot.sportsmanship_points || 0) + row.sportsmanship_points,
            races_completed: (pilot.races_completed || 0) + 1,
            wins: row.position === 1 ? (pilot.wins || 0) + 1 : pilot.wins,
            podiums: row.position <= 3 ? (pilot.podiums || 0) + 1 : pilot.podiums,
          });
        }
        return base44.entities.RaceResult.create(data);
      }));
      // Mark race as completed
      await base44.entities.Race.update(selectedRaceId, { status: 'completed' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      queryClient.invalidateQueries({ queryKey: ['races'] });
      toast.success('Risultati salvati e punti assegnati!');
    },
  });

  const initRows = (raceId) => {
    const race = races.find(r => r.id === raceId);
    const count = race?.current_participants || 6;
    setRows(Array.from({ length: count }, (_, i) => ({
      position: i + 1,
      pilot_id: '',
      gap: i === 0 ? 'Leader' : '',
      sportsmanship_points: 10,
      penalties: '',
      notes: '',
    })));
  };

  const updateRow = (idx, key, val) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r));
  };

  const addRow = () => setRows(prev => [...prev, { position: prev.length + 1, pilot_id: '', gap: '', sportsmanship_points: 10, penalties: '', notes: '' }]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3">Seleziona Gara</h2>
        <Select value={selectedRaceId} onValueChange={v => { setSelectedRaceId(v); initRows(v); }}>
          <SelectTrigger className="bg-card border-border max-w-sm">
            <SelectValue placeholder="Seleziona una gara completata..." />
          </SelectTrigger>
          <SelectContent>
            {races.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selectedRaceId && (
        <>
          <div className="racing-card bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="font-heading text-sm text-foreground uppercase tracking-wide">Classifica Finale</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Pos', 'Pilota', 'Distacco', 'Pt Velocità', 'Pt Sportività', 'Pt Totali', 'Penalità', 'Note'].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const sp = calcSpeedPoints(row.position);
                    const total = calcTotalPoints(sp, row.sportsmanship_points);
                    return (
                      <tr key={idx} className="border-b border-border/30 hover:bg-secondary/10">
                        <td className="px-3 py-2">
                          <span className={cn("font-heading text-sm", idx === 0 ? 'text-accent' : idx === 1 ? 'text-muted-foreground' : idx === 2 ? 'text-orange-400' : 'text-foreground')}>
                            {row.position}°
                          </span>
                        </td>
                        <td className="px-3 py-2 min-w-[160px]">
                          <Select value={row.pilot_id} onValueChange={v => updateRow(idx, 'pilot_id', v)}>
                            <SelectTrigger className="h-7 text-xs bg-background border-border w-full"><SelectValue placeholder="Pilota..." /></SelectTrigger>
                            <SelectContent>
                              {pilots.map(p => <SelectItem key={p.id} value={p.id}>{p.username}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2 min-w-[100px]">
                          <Input value={row.gap} onChange={e => updateRow(idx, 'gap', e.target.value)} className="h-7 text-xs bg-background border-border" placeholder="+1:23.4" />
                        </td>
                        <td className="px-3 py-2 text-xs text-primary font-semibold">{sp}</td>
                        <td className="px-3 py-2 min-w-[90px]">
                          <Input
                            type="number"
                            value={row.sportsmanship_points}
                            onChange={e => updateRow(idx, 'sportsmanship_points', Number(e.target.value))}
                            className="h-7 text-xs bg-background border-border"
                            min={0} max={15}
                          />
                        </td>
                        <td className="px-3 py-2 text-xs text-accent font-bold">{total}</td>
                        <td className="px-3 py-2 min-w-[150px]">
                          <Input value={row.penalties} onChange={e => updateRow(idx, 'penalties', e.target.value)} className="h-7 text-xs bg-background border-border" placeholder="es. +5s track limits" />
                        </td>
                        <td className="px-3 py-2 min-w-[150px]">
                          <Input value={row.notes} onChange={e => updateRow(idx, 'notes', e.target.value)} className="h-7 text-xs bg-background border-border" placeholder="Note..." />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-border">
              <button onClick={addRow} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Aggiungi riga
              </button>
            </div>
          </div>

          {/* Legenda sportività */}
          <div className="racing-card-sm bg-card p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Guida Punti Sportività (base: 10)</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span>Incidente causato: <span className="text-destructive">-2</span></span>
              <span>Track limits: <span className="text-destructive">-1</span></span>
              <span>Unsafe rejoin: <span className="text-destructive">-3</span></span>
              <span>Bandiera gialla violata: <span className="text-destructive">-5</span></span>
              <span>Giro veloce: <span className="text-green-400">+1</span></span>
              <span>Sorpasso pulito: <span className="text-green-400">+1</span></span>
            </div>
          </div>

          {/* Flags */}
          <div className="racing-card-sm bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <Label className="text-sm">Risultati Verificati</Label>
              </div>
              <Switch checked={verified} onCheckedChange={setVerified} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-accent" />
                <Label className="text-sm">Montepremi Distribuito</Label>
              </div>
              <Switch checked={prizeDistributed} onCheckedChange={setPrizeDistributed} />
            </div>
            {prizeDistributed && (
              <div>
                <Label className="text-xs text-muted-foreground">Data distribuzione</Label>
                <Input type="date" value={prizeDate} onChange={e => setPrizeDate(e.target.value)} className="bg-background border-border mt-1 h-8 text-xs" />
              </div>
            )}
          </div>

          <Button
            onClick={() => saveResultsMutation.mutate()}
            disabled={saveResultsMutation.isPending || rows.every(r => !r.pilot_id)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
          >
            {saveResultsMutation.isPending ? 'Salvataggio...' : 'Salva Risultati & Assegna Punti'}
          </Button>
        </>
      )}
    </div>
  );
}