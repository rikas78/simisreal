import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'In Attesa', icon: Clock, class: 'bg-accent/10 text-accent border-accent/20' },
  reviewing: { label: 'In Revisione', icon: Eye, class: 'bg-primary/10 text-primary border-primary/20' },
  resolved: { label: 'Risolto', icon: CheckCircle, class: 'bg-green-500/10 text-green-500 border-green-500/20' },
  rejected: { label: 'Rigettato', icon: XCircle, class: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function Complaints() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ race_id: '', race_title: '', against_pilot: '', description: '' });

  const { data: complaints = [] } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => base44.entities.Complaint.list('-created_date', 100),
  });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list(),
  });

  const myPilot = pilots.find(p => p.created_by === user?.email);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Complaint.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      setOpen(false);
      setForm({ race_id: '', race_title: '', against_pilot: '', description: '' });
      toast.success('Reclamo inviato');
    },
  });

  const handleSubmit = () => {
    if (!form.description.trim()) return toast.error('Inserisci una descrizione');
    createMutation.mutate({
      ...form,
      submitted_by: myPilot?.username || user?.email,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground">Reclami</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestione reclami e penalità</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Reclamo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-heading text-foreground">Nuovo Reclamo</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <Label>Titolo Gara</Label>
                <Input
                  value={form.race_title}
                  onChange={(e) => setForm(f => ({ ...f, race_title: e.target.value }))}
                  placeholder="Nome della gara"
                  className="bg-background border-border mt-1"
                />
              </div>
              <div>
                <Label>Pilota Accusato</Label>
                <Input
                  value={form.against_pilot}
                  onChange={(e) => setForm(f => ({ ...f, against_pilot: e.target.value }))}
                  placeholder="Username del pilota"
                  className="bg-background border-border mt-1"
                />
              </div>
              <div>
                <Label>Descrizione</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descrivi l'incidente in dettaglio..."
                  className="bg-background border-border mt-1 h-28"
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Invia Reclamo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Complaints list */}
      {complaints.length === 0 ? (
        <div className="racing-card bg-card p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nessun reclamo presente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(complaint => {
            const status = statusConfig[complaint.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <div key={complaint.id} className="racing-card bg-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{complaint.race_title || 'Gara'}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Da: {complaint.submitted_by} → Contro: {complaint.against_pilot || 'N/A'}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs flex items-center gap-1", status.class)}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{complaint.description}</p>
                {complaint.resolution && (
                  <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border/50">
                    <p className="text-xs font-semibold text-foreground mb-1">Esito:</p>
                    <p className="text-sm text-muted-foreground">{complaint.resolution}</p>
                    {complaint.penalty && (
                      <p className="text-xs text-destructive mt-1">Penalità: {complaint.penalty}</p>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(complaint.created_date), "d MMM yyyy · HH:mm", { locale: it })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}