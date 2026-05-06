import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Users, Building2, Vote, Plus, CheckCircle, XCircle, Clock, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';

const DECISION_HIERARCHY = [
  { level: 'Platform Base Rules', desc: 'Sempre applicabili. Non derogabili da nessuna lega o associazione.', color: 'text-destructive' },
  { level: 'Federation', desc: 'Supervisione e coordinamento inter-lega. Può emettere bandi globali.', color: 'text-primary' },
  { level: 'League Operators', desc: 'Aggiungono regole specifiche per i propri campionati.', color: 'text-accent' },
  { level: 'Drivers Association', desc: 'Rappresenta i piloti. Propone motions, vota regole.', color: 'text-blue-400' },
  { level: 'Teams Association', desc: 'Rappresenta le scuderie. Propone e vota regole team.', color: 'text-cyan-400' },
  { level: 'Open Race Self-Management', desc: 'Gare aperte gestite dai partecipanti con giudice opzionale.', color: 'text-muted-foreground' },
];

const ROLES = [
  { role: 'Pilota', desc: 'Partecipa alle gare', path: 'START → ROOKIE → PRO → ELITE', color: 'bg-primary/10 text-primary' },
  { role: 'Team Manager', desc: 'Gestisce la scuderia', path: 'Fonda team, ingaggia piloti', color: 'bg-accent/10 text-accent' },
  { role: 'Commentatore', desc: 'Commenta le dirette', path: 'Junior → Senior → Capo', color: 'bg-blue-500/10 text-blue-400' },
  { role: 'Giudice', desc: 'Arbitra reclami e penalità', path: 'Steward → Chief Steward', color: 'bg-orange-500/10 text-orange-400' },
  { role: 'Regista', desc: 'Dirige il broadcast', path: 'Operatore → Regista → Direttore', color: 'bg-purple-500/10 text-purple-400' },
  { role: 'Moderatore', desc: 'Gestisce chat e annunci', path: 'Mod → Senior Mod', color: 'bg-cyan-500/10 text-cyan-400' },
  { role: 'Admin', desc: 'Accesso completo alla piattaforma', path: 'Platform Staff', color: 'bg-destructive/10 text-destructive' },
];

const statusConfig = {
  open:     { label: 'Aperta', class: 'bg-primary/10 text-primary border-primary/20' },
  closed:   { label: 'Chiusa', class: 'bg-muted/50 text-muted-foreground border-border' },
  approved: { label: 'Approvata', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
  rejected: { label: 'Respinta', class: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function Governance() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'regola' });

  const { data: motions = [] } = useQuery({
    queryKey: ['motions'],
    queryFn: () => base44.entities.Motion.list('-created_date', 50),
  });

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: pilots = [] } = useQuery({ queryKey: ['pilots'], queryFn: () => base44.entities.Pilot.list() });
  const myPilot = pilots.find(p => p.created_by === user?.email);

  const createMotion = useMutation({
    mutationFn: (data) => base44.entities.Motion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motions'] });
      setShowForm(false);
      setForm({ title: '', description: '', category: 'regola' });
      toast.success('Mozione proposta!');
    },
  });

  const vote = useMutation({
    mutationFn: async ({ motionId, choice, motion }) => {
      await base44.entities.Vote.create({ motion_id: motionId, motion_title: motion.title, voter_username: myPilot?.username || user?.email, choice });
      const update = { votes_yes: motion.votes_yes || 0, votes_no: motion.votes_no || 0, votes_abstain: motion.votes_abstain || 0 };
      if (choice === 'yes') update.votes_yes += 1;
      if (choice === 'no') update.votes_no += 1;
      if (choice === 'abstain') update.votes_abstain += 1;
      return base44.entities.Motion.update(motionId, update);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['motions'] }); toast.success('Voto registrato!'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" /> Governance
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gerarchia decisionale, associazioni e votazioni</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Proponi Mozione
        </Button>
      </div>

      {showForm && (
        <div className="racing-card bg-card p-5 space-y-3">
          <h3 className="font-heading text-foreground">Nuova Mozione</h3>
          <div><Label>Titolo</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-background border-border mt-1" /></div>
          <div><Label>Descrizione</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-background border-border mt-1 h-24" /></div>
          <div>
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger className="bg-background border-border mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['regola','penalita','governance','carriera','altro'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMotion.mutate({ ...form, proposed_by: myPilot?.username || user?.email, status: 'open' })} disabled={createMotion.isPending} className="bg-primary text-primary-foreground">Proponi</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annulla</Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="hierarchy">
        <TabsList className="bg-card border border-border flex-wrap h-auto gap-1">
          <TabsTrigger value="hierarchy">Gerarchia</TabsTrigger>
          <TabsTrigger value="motions">Votazioni</TabsTrigger>
          <TabsTrigger value="roles">Ruoli</TabsTrigger>
        </TabsList>

        {/* Gerarchia */}
        <TabsContent value="hierarchy" className="mt-5 space-y-3">
          {DECISION_HIERARCHY.map((item, idx) => (
            <div key={idx} className="racing-card bg-card p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-heading text-muted-foreground">{idx + 1}</div>
              <div>
                <p className={cn("font-heading text-base", item.color)}>{item.level}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
          {/* Rules quick ref */}
          <div className="racing-card bg-card p-5 mt-4">
            <h3 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2"><Flag className="w-4 h-4" /> Regolamento Base — Casi Standard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { caso: 'No-Show', penalita: 'Avvertimento → Punti -5 → Sospensione' },
                { caso: 'Late Check-in (>5 min)', penalita: 'Partenza dalla pit lane' },
                { caso: 'Crash pre-partenza', penalita: 'Ripartenza dalla pit lane o DQ' },
                { caso: 'Disconnect (< 3 giri)', penalita: 'DNS — nessuna penalità' },
                { caso: 'Disconnect (> 3 giri)', penalita: 'DNF — posizione retrocessa' },
                { caso: 'Guida scorretta', penalita: 'Stop-and-Go 10s o DQ' },
                { caso: 'Rage quit', penalita: 'Punti -10, sospensione 2 gare' },
                { caso: 'Mancata prova (screenshot)', penalita: 'Risultato annullato' },
                { caso: 'Cheating sospetto', penalita: 'Revisione + ban temporaneo' },
                { caso: 'Protesta', penalita: 'Finestra 15 min post-gara. Giudice decide.' },
              ].map(r => (
                <div key={r.caso} className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="font-semibold text-foreground">{r.caso}</p>
                  <p className="text-muted-foreground mt-0.5">{r.penalita}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Votazioni */}
        <TabsContent value="motions" className="mt-5 space-y-4">
          {motions.length === 0 ? (
            <div className="racing-card bg-card p-12 text-center text-muted-foreground">Nessuna mozione in corso</div>
          ) : motions.map(m => {
            const s = statusConfig[m.status] || statusConfig.open;
            const total = (m.votes_yes || 0) + (m.votes_no || 0) + (m.votes_abstain || 0);
            return (
              <div key={m.id} className="racing-card bg-card p-5">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="font-heading text-foreground">{m.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Proposta da: {m.proposed_by} · {format(new Date(m.created_date), 'd MMM yyyy', { locale: it })}</p>
                  </div>
                  <Badge variant="outline" className={s.class}>{s.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{m.description}</p>
                {/* Vote counts */}
                <div className="flex gap-4 text-xs mb-4">
                  <span className="text-green-400">✓ Sì: {m.votes_yes || 0}</span>
                  <span className="text-destructive">✗ No: {m.votes_no || 0}</span>
                  <span className="text-muted-foreground">— Astensione: {m.votes_abstain || 0}</span>
                  <span className="text-muted-foreground ml-auto">Totale: {total}</span>
                </div>
                {m.status === 'open' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => vote.mutate({ motionId: m.id, choice: 'yes', motion: m })} className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30 h-7 text-xs">Sì</Button>
                    <Button size="sm" onClick={() => vote.mutate({ motionId: m.id, choice: 'no', motion: m })} className="bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 h-7 text-xs">No</Button>
                    <Button size="sm" variant="outline" onClick={() => vote.mutate({ motionId: m.id, choice: 'abstain', motion: m })} className="h-7 text-xs">Astensione</Button>
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>

        {/* Ruoli */}
        <TabsContent value="roles" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ROLES.map(r => (
              <div key={r.role} className="racing-card bg-card p-4">
                <div className={cn("inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2", r.color)}>{r.role}</div>
                <p className="text-sm text-foreground font-medium">{r.desc}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.path}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}