import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gavel, Plus, Clock, Eye, CheckCircle, XCircle, AlertTriangle, Upload, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format, differenceInMinutes } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';

const INCIDENT_TYPES = [
  'No-Show', 'Late Check-in', 'Crash pre-partenza', 'Crash durante gara',
  'Disconnect (< 3 giri)', 'Disconnect (> 3 giri)', 'Guida non sicura',
  'Rage quit', 'Screenshot mancante', 'Replay mancante', 'Cheating sospetto', 'Altro',
];

const PENALTIES = ['Avvertimento', 'Penalità punti (-5)', 'Penalità punti (-10)', 'Squalifica gara', 'Sospensione 1 gara', 'Sospensione 2 gare', 'Ban temporaneo', 'Ban permanente'];

const statusConfig = {
  pending:   { label: 'In Attesa', icon: Clock,         class: 'bg-accent/10 text-accent border-accent/20' },
  reviewing: { label: 'In Revisione', icon: Eye,        class: 'bg-primary/10 text-primary border-primary/20' },
  resolved:  { label: 'Risolto', icon: CheckCircle,     class: 'bg-green-500/10 text-green-400 border-green-500/20' },
  rejected:  { label: 'Rigettato', icon: XCircle,       class: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const appealStatusConfig = {
  pending:  { label: 'In Attesa',  class: 'bg-accent/10 text-accent border-accent/20' },
  accepted: { label: 'Accettato', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
  rejected: { label: 'Respinto',  class: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function DisputeCenter() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(null);
  const [appealOpen, setAppealOpen] = useState(null);
  const [form, setForm] = useState({ race_title: '', against_pilot: '', description: '', incident_type: 'Altro' });
  const [evForm, setEvForm] = useState({ type: 'screenshot', description: '', file_url: '' });
  const [appealForm, setAppealForm] = useState({ reason: '', new_evidence_url: '' });

  const { data: complaints = [] } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => base44.entities.Complaint.list('-created_date', 100),
  });
  const { data: evidences = [] } = useQuery({
    queryKey: ['evidences'],
    queryFn: () => base44.entities.Evidence.list('-created_date', 200),
  });
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: pilots = [] } = useQuery({ queryKey: ['pilots'], queryFn: () => base44.entities.Pilot.list() });
  const myPilot = pilots.find(p => p.created_by === user?.email);

  const createComplaint = useMutation({
    mutationFn: (data) => base44.entities.Complaint.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      setOpen(false);
      setForm({ race_title: '', against_pilot: '', description: '', incident_type: 'Altro' });
      toast.success('Reclamo inviato. Finestra risposta: 15 minuti.');
    },
  });

  const { data: appeals = [] } = useQuery({
    queryKey: ['appeals'],
    queryFn: () => base44.entities.Appeal.list('-created_date', 100),
  });

  const addEvidence = useMutation({
    mutationFn: (data) => base44.entities.Evidence.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidences'] });
      setEvidenceOpen(null);
      toast.success('Prova allegata!');
    },
  });

  const createAppeal = useMutation({
    mutationFn: (data) => base44.entities.Appeal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeals'] });
      setAppealOpen(null);
      setAppealForm({ reason: '', new_evidence_url: '' });
      toast.success('Ricorso inviato! Risposta entro 30 minuti.');
    },
  });

  const myComplaints = complaints.filter(c => c.submitted_by === (myPilot?.username || user?.email));
  const allComplaints = complaints;

  const renderComplaint = (c) => {
    const s = statusConfig[c.status] || statusConfig.pending;
    const Icon = s.icon;
    const cEvs = evidences.filter(e => e.complaint_id === c.id);
    const minutesAgo = differenceInMinutes(new Date(), new Date(c.created_date));
    const withinWindow = minutesAgo <= 15;

    return (
      <div key={c.id} className="racing-card bg-card p-5">
        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
          <div>
            <p className="font-heading text-foreground">{c.race_title || 'Gara'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {c.submitted_by} → {c.against_pilot || 'N/A'} · {format(new Date(c.created_date), 'd MMM yyyy · HH:mm', { locale: it })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {withinWindow && c.status === 'pending' && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                ⏱ Finestra aperta: {15 - minutesAgo} min
              </Badge>
            )}
            <Badge variant="outline" className={cn("text-xs flex items-center gap-1", s.class)}>
              <Icon className="w-3 h-3" />{s.label}
            </Badge>
          </div>
        </div>
        {c.description && <p className="text-sm text-muted-foreground mb-3">{c.description}</p>}

        {/* Evidence */}
        {cEvs.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {cEvs.map(e => (
              <a key={e.id} href={e.file_url || '#'} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-secondary rounded border border-border text-muted-foreground hover:text-foreground flex items-center gap-1">
                📎 {e.type}: {e.description || 'prova'}
              </a>
            ))}
          </div>
        )}

        {c.resolution && (
          <div className="p-3 rounded-lg bg-background/50 border border-border/50 mb-3">
            <p className="text-xs font-semibold text-foreground mb-1">Esito:</p>
            <p className="text-sm text-muted-foreground">{c.resolution}</p>
            {c.penalty && <p className="text-xs text-destructive mt-1">Penalità: {c.penalty}</p>}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => setEvidenceOpen(c.id)} className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
            <Upload className="w-3 h-3 mr-1" /> Allega Prova
          </Button>
          {/* Appeal button — only for resolved/rejected within 30 min */}
          {(c.status === 'resolved' || c.status === 'rejected') && (() => {
            const minSince = differenceInMinutes(new Date(), new Date(c.updated_date || c.created_date));
            const canAppeal = minSince <= 30;
            const myAppeal = appeals.find(a => a.complaint_id === c.id);
            if (myAppeal) return (
              <Badge variant="outline" className={cn('text-xs', appealStatusConfig[myAppeal.status]?.class)}>
                <RotateCcw className="w-3 h-3 mr-1" /> Ricorso: {appealStatusConfig[myAppeal.status]?.label}
              </Badge>
            );
            if (canAppeal) return (
              <Button size="sm" variant="outline" onClick={() => setAppealOpen(c.id)} className="h-7 text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                <RotateCcw className="w-3 h-3 mr-1" /> Ricorso ({30 - minSince} min)
              </Button>
            );
            return null;
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <Gavel className="w-7 h-7 text-destructive" /> Dispute Center
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Gestione reclami, prove e penalità ufficiali</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Nuovo Reclamo
        </Button>
      </div>

      {/* Info bar */}
      <div className="racing-card bg-card p-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>⏱ Finestra protesta: <span className="text-foreground font-semibold">15 minuti</span> post-evento</span>
        <span>📎 Prove obbligatorie: screenshot o replay</span>
        <span>⚖️ Decisione entro 24h per gare aperte, 48h per campionati</span>
        <span>🔁 Appeal disponibile entro 30 minuti dalla sentenza</span>
      </div>

      <Tabs defaultValue="mine">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="mine">I Miei Reclami</TabsTrigger>
          <TabsTrigger value="all">Tutti ({complaints.length})</TabsTrigger>
          <TabsTrigger value="appeals">⚖️ Ricorsi ({appeals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="mt-5 space-y-4">
          {myComplaints.length === 0 ? (
            <div className="racing-card bg-card p-12 text-center text-muted-foreground">Nessun reclamo inviato</div>
          ) : myComplaints.map(renderComplaint)}
        </TabsContent>

        <TabsContent value="all" className="mt-5 space-y-4">
          {allComplaints.length === 0 ? (
            <div className="racing-card bg-card p-12 text-center text-muted-foreground">Nessun reclamo presente</div>
          ) : allComplaints.map(renderComplaint)}
        </TabsContent>

        <TabsContent value="appeals" className="mt-5 space-y-4">
          {appeals.length === 0 ? (
            <div className="racing-card bg-card p-12 text-center text-muted-foreground">
              <RotateCcw className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Nessun ricorso presentato</p>
              <p className="text-xs mt-1">I ricorsi possono essere presentati entro 30 minuti dalla sentenza</p>
            </div>
          ) : appeals.map(ap => {
            const cfg = appealStatusConfig[ap.status] || appealStatusConfig.pending;
            const origComplaint = complaints.find(c => c.id === ap.complaint_id);
            return (
              <div key={ap.id} className="racing-card bg-card p-5">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="font-heading text-foreground">Ricorso — {origComplaint?.race_title || ap.complaint_id}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Presentato da: {ap.submitted_by}</p>
                  </div>
                  <Badge variant="outline" className={cn('text-xs', cfg.class)}>{cfg.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{ap.reason}</p>
                {ap.new_evidence_url && (
                  <a href={ap.new_evidence_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    📎 Nuova prova allegata
                  </a>
                )}
                {ap.outcome && (
                  <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border/50">
                    <p className="text-xs font-semibold text-foreground mb-1">Esito Ricorso:</p>
                    <p className="text-sm text-muted-foreground">{ap.outcome}</p>
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground flex items-center gap-2"><Gavel className="w-4 h-4" /> Nuovo Reclamo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Tipo Incidente</Label>
              <Select value={form.incident_type} onValueChange={v => setForm(f => ({ ...f, incident_type: v }))}>
                <SelectTrigger className="bg-background border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{INCIDENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Gara</Label><Input value={form.race_title} onChange={e => setForm(f => ({ ...f, race_title: e.target.value }))} className="bg-background border-border mt-1" placeholder="Titolo della gara" /></div>
            <div><Label>Pilota Accusato</Label><Input value={form.against_pilot} onChange={e => setForm(f => ({ ...f, against_pilot: e.target.value }))} className="bg-background border-border mt-1" placeholder="Username" /></div>
            <div><Label>Descrizione</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-background border-border mt-1 h-28" placeholder="Descrivi l'incidente nel dettaglio..." /></div>
            <p className="text-xs text-muted-foreground">⚠️ Allega screenshots o replay dopo aver inviato il reclamo. Senza prove il caso potrebbe essere respinto.</p>
            <Button onClick={() => createComplaint.mutate({ ...form, submitted_by: myPilot?.username || user?.email, status: 'pending' })} disabled={createComplaint.isPending || !form.description} className="w-full bg-primary text-primary-foreground">Invia Reclamo</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appeal dialog */}
      <Dialog open={!!appealOpen} onOpenChange={() => setAppealOpen(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-orange-400" /> Presenta Ricorso
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-orange-400">
              ⏱ Finestra ricorso: <strong>30 minuti</strong> dalla sentenza. Il Collegio Arbitrale risponde entro 30 minuti.
            </div>
            <div>
              <Label>Motivazione del Ricorso</Label>
              <Textarea value={appealForm.reason} onChange={e => setAppealForm(f => ({ ...f, reason: e.target.value }))} className="bg-background border-border mt-1 h-24" placeholder="Spiega perché la sentenza è ingiusta e su quali basi..." />
            </div>
            <div>
              <Label>Nuova Prova (URL — opzionale)</Label>
              <Input value={appealForm.new_evidence_url} onChange={e => setAppealForm(f => ({ ...f, new_evidence_url: e.target.value }))} className="bg-background border-border mt-1" placeholder="https://..." />
            </div>
            <Button
              onClick={() => createAppeal.mutate({ complaint_id: appealOpen, ...appealForm, submitted_by: myPilot?.username || user?.email, status: 'pending' })}
              disabled={createAppeal.isPending || !appealForm.reason}
              className="w-full bg-orange-500 text-white hover:bg-orange-600"
            >
              Invia Ricorso
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Evidence dialog */}
      <Dialog open={!!evidenceOpen} onOpenChange={() => setEvidenceOpen(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Allega Prova</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Tipo</Label>
              <Select value={evForm.type} onValueChange={v => setEvForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="bg-background border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['screenshot','replay','video','note'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>URL File / Link</Label><Input value={evForm.file_url} onChange={e => setEvForm(f => ({ ...f, file_url: e.target.value }))} className="bg-background border-border mt-1" placeholder="https://..." /></div>
            <div><Label>Descrizione</Label><Input value={evForm.description} onChange={e => setEvForm(f => ({ ...f, description: e.target.value }))} className="bg-background border-border mt-1" /></div>
            <Button onClick={() => addEvidence.mutate({ complaint_id: evidenceOpen, ...evForm, submitted_by: myPilot?.username || user?.email })} disabled={addEvidence.isPending} className="w-full bg-primary text-primary-foreground">Allega</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}