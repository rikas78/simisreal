import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldBan, ShieldCheck, UserX, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const safetyColors = {
  S: 'text-green-400 bg-green-400/10 border-green-400/30',
  A: 'text-primary bg-primary/10 border-primary/30',
  B: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  C: 'text-accent bg-accent/10 border-accent/30',
  D: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  E: 'text-red-400 bg-red-400/10 border-red-400/30',
  F: 'text-destructive bg-destructive/10 border-destructive/30',
};

const categoryColors = {
  START: 'text-muted-foreground', ROOKIE: 'text-blue-400', AMATEUR: 'text-cyan-400',
  'SEMI-PRO': 'text-accent', PRO: 'text-green-400', K: 'text-purple-400',
};

export default function AdminPilots() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [banModal, setBanModal] = useState(null); // pilot object
  const [banReason, setBanReason] = useState('');

  const { data: pilots = [], isLoading } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list('-total_points', 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Pilot.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      toast.success('Pilota aggiornato');
      setBanModal(null);
      setBanReason('');
    },
  });

  const filtered = pilots.filter(p =>
    !search || p.username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleBan = (pilot) => {
    if (pilot.banned) {
      updateMutation.mutate({ id: pilot.id, data: { banned: false, ban_reason: '' } });
    } else {
      setBanModal(pilot);
    }
  };

  const confirmBan = () => {
    if (!banReason.trim()) return;
    updateMutation.mutate({ id: banModal.id, data: { banned: true, ban_reason: banReason } });
  };

  return (
    <div className="space-y-5">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca pilota..." className="pl-10 bg-card border-border" />
      </div>

      <div className="racing-card bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Username', 'Categoria', 'Punti', 'SR', 'Gare', 'Ruolo', 'Stato', 'Azioni'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Caricamento...</td></tr>
              ) : filtered.map(pilot => (
                <tr key={pilot.id} className={cn("border-b border-border/40 hover:bg-secondary/10 transition-colors", pilot.banned && 'opacity-50')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold">{pilot.username?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{pilot.username}</p>
                        <p className="text-xs text-muted-foreground">{pilot.main_simulator}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-bold", categoryColors[pilot.category || 'START'])}>{pilot.category || 'START'}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-primary font-semibold">{pilot.total_points || 0}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-xs", safetyColors[pilot.safety_rating || 'S'])}>{pilot.safety_rating || 'S'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">{pilot.races_completed || 0}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={pilot.role || 'Pilota'}
                      onValueChange={v => updateMutation.mutate({ id: pilot.id, data: { role: v } })}
                    >
                      <SelectTrigger className="h-7 w-32 text-xs bg-background border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Pilota','Team Member','Team Manager','Admin'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    {pilot.banned ? (
                      <Badge variant="outline" className="text-xs text-destructive border-destructive/30 bg-destructive/10">Bannato</Badge>
                    ) : pilot.suspended ? (
                      <Badge variant="outline" className="text-xs text-orange-400 border-orange-400/30 bg-orange-400/10">Sospeso</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-green-400 border-green-400/30 bg-green-400/10">Attivo</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateMutation.mutate({ id: pilot.id, data: { suspended: !pilot.suspended } })}
                        className={cn("p-1.5 rounded transition-colors", pilot.suspended ? "text-green-400 hover:bg-green-400/10" : "text-orange-400 hover:bg-orange-400/10")}
                        title={pilot.suspended ? 'Riattiva' : 'Sospendi'}
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleBan(pilot)}
                        className={cn("p-1.5 rounded transition-colors", pilot.banned ? "text-green-400 hover:bg-green-400/10" : "text-destructive hover:bg-destructive/10")}
                        title={pilot.banned ? 'Rimuovi ban' : 'Ban'}
                      >
                        {pilot.banned ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldBan className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBanModal(null)} />
          <div className="relative racing-card bg-card border border-border p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <h3 className="font-heading text-foreground">Ban {banModal.username}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Inserisci la motivazione del ban:</p>
            <textarea
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-3 text-sm text-foreground resize-none h-24 focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Motivazione..."
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setBanModal(null)} className="flex-1 border-border">Annulla</Button>
              <Button onClick={confirmBan} disabled={!banReason.trim() || updateMutation.isPending} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Conferma Ban
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}