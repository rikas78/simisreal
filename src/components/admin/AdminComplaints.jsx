import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Gavel, Eye, CheckCircle, XCircle, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';

const PENALTIES = [
  'Avvertimento', 'Penalità -5 punti', 'Penalità -10 punti',
  'Squalifica gara', 'Sospensione 1 gara', 'Sospensione 2 gare',
  'Ban temporaneo', 'Ban permanente'
];

const statusCfg = {
  pending:   { label: 'In Attesa',    icon: Clock,       cls: 'bg-accent/10 text-accent border-accent/20' },
  reviewing: { label: 'In Revisione', icon: Eye,         cls: 'bg-primary/10 text-primary border-primary/20' },
  resolved:  { label: 'Risolto',      icon: CheckCircle, cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  rejected:  { label: 'Rigettato',    icon: XCircle,     cls: 'bg-destructive/10 text-destructive border-destructive/20' },
};

function ComplaintRow({ c, evidences, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState(c.resolution || '');
  const [penalty, setPenalty] = useState(c.penalty || '');
  const [saving, setSaving] = useState(false);

  const cEvs = evidences.filter(e => e.complaint_id === c.id);
  const s = statusCfg[c.status] || statusCfg.pending;
  const Icon = s.icon;

  const handleSave = async (newStatus) => {
    setSaving(true);
    await onUpdate(c.id, { status: newStatus, resolution, penalty });
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="racing-card bg-card overflow-hidden">
      {/* Header row */}
      <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/10 transition-colors" onClick={() => setOpen(!open)}>
        <Badge variant="outline" className={cn("text-xs flex items-center gap-1 flex-shrink-0", s.cls)}>
          <Icon className="w-3 h-3" />{s.label}
        </Badge>
        <div className="flex-1 text-left min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{c.race_title || 'Gara'}</p>
          <p className="text-[11px] text-muted-foreground">
            {c.submitted_by} → {c.against_pilot || 'N/A'} · {format(new Date(c.created_date), 'd MMM · HH:mm', { locale: it })}
          </p>
        </div>
        {cEvs.length > 0 && (
          <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded font-bold flex-shrink-0">
            {cEvs.length} prove
          </span>
        )}
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {/* Expanded */}
      {open && (
        <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
          {/* Description */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Descrizione</p>
            <p className="text-sm text-foreground">{c.description}</p>
          </div>

          {/* Evidence */}
          {cEvs.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Prove Allegate</p>
              <div className="flex flex-wrap gap-2">
                {cEvs.map(e => (
                  <a key={e.id} href={e.file_url || '#'} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-secondary rounded border border-border text-foreground hover:text-primary hover:border-primary/30 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    {e.type}: {e.description || 'prova'}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Direct evidence URL */}
          {c.evidence_url && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Prova Principale</p>
              <a href={c.evidence_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> Visualizza prova video
              </a>
            </div>
          )}

          {/* Resolution form */}
          <div className="space-y-3 pt-2 border-t border-border/30">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Motivazione Decisione</p>
              <Textarea
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                className="bg-background border-border h-20 text-sm"
                placeholder="Descrivi l'esito e le motivazioni..."
              />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Penalità (opzionale)</p>
              <Select value={penalty} onValueChange={setPenalty}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Nessuna penalità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nessuna penalità</SelectItem>
                  {PENALTIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={() => handleSave('reviewing')}
                disabled={saving}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" /> In Revisione
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave('resolved')}
                disabled={saving || !resolution}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Risolvi
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave('rejected')}
                disabled={saving}
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" /> Rigetta
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminComplaints() {
  const queryClient = useQueryClient();

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => base44.entities.Complaint.list('-created_date', 200),
  });
  const { data: evidences = [] } = useQuery({
    queryKey: ['evidences'],
    queryFn: () => base44.entities.Evidence.list('-created_date', 500),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Complaint.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Reclamo aggiornato!');
    },
  });

  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);
  const counts = {
    pending: complaints.filter(c => c.status === 'pending').length,
    reviewing: complaints.filter(c => c.status === 'reviewing').length,
  };

  if (isLoading) return <div className="h-40 animate-pulse bg-secondary/20 rounded-lg" />;

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Totali', count: complaints.length, color: 'text-foreground' },
          { label: 'In Attesa', count: counts.pending, color: 'text-accent' },
          { label: 'In Revisione', count: counts.reviewing, color: 'text-primary' },
          { label: 'Risolti', count: complaints.filter(c => c.status === 'resolved').length, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="racing-card bg-card p-4 text-center">
            <p className={cn("font-heading text-2xl font-black", s.color)}>{s.count}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['all','Tutti'],['pending','In Attesa'],['reviewing','In Revisione'],['resolved','Risolti'],['rejected','Rigettati']].map(([val, lab]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={cn("px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-colors",
              filter === val ? "bg-primary/10 text-primary border-primary/30" : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}>
            {lab}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="racing-card bg-card p-12 text-center text-muted-foreground">
          <Gavel className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>Nessun reclamo in questa categoria</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <ComplaintRow
              key={c.id}
              c={c}
              evidences={evidences}
              onUpdate={(id, data) => updateMutation.mutateAsync({ id, data })}
            />
          ))}
        </div>
      )}
    </div>
  );
}