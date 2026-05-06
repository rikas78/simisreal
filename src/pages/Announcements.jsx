import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Search, Pin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'hardware', label: 'Hardware', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { value: 'setup', label: 'Setup', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'livrea', label: 'Livrea', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'coaching', label: 'Coaching', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'slot_team', label: 'Slot Team', color: 'bg-primary/10 text-primary border-primary/20' },
  { value: 'evento', label: 'Evento', color: 'bg-accent/10 text-accent border-accent/20' },
  { value: 'broadcast', label: 'Broadcast', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { value: 'altro', label: 'Altro', color: 'bg-muted/50 text-muted-foreground border-border' },
];

const catMap = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

export default function Announcements() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('tutti');
  const [form, setForm] = useState({ title: '', content: '', category: 'hardware', price: '', contact: '' });

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => base44.entities.Announcement.list('-created_date', 100),
  });

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: pilots = [] } = useQuery({ queryKey: ['pilots'], queryFn: () => base44.entities.Pilot.list() });
  const myPilot = pilots.find(p => p.created_by === user?.email);

  const create = useMutation({
    mutationFn: (data) => base44.entities.Announcement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setOpen(false);
      setForm({ title: '', content: '', category: 'hardware', price: '', contact: '' });
      toast.success('Annuncio inviato — in attesa di approvazione');
    },
  });

  const approved = announcements.filter(a => a.status === 'approved' || a.status === undefined);
  const filtered = approved.filter(a => {
    const matchSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.content?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'tutti' || a.category === catFilter;
    return matchSearch && matchCat;
  });

  const pinned = filtered.filter(a => a.pinned);
  const regular = filtered.filter(a => !a.pinned);
  const combined = [...pinned, ...regular];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-accent" /> Annunci
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Bacheca ufficiale SIM is REAL — solo contenuto sim racing</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Pubblica Annuncio
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca annunci..." className="pl-10 bg-card border-border h-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setCatFilter('tutti')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", catFilter === 'tutti' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-card border-border text-muted-foreground hover:text-foreground')}>Tutti</button>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCatFilter(c.value)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", catFilter === c.value ? c.color : 'bg-card border-border text-muted-foreground hover:text-foreground')}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {combined.length === 0 ? (
        <div className="racing-card bg-card p-12 text-center">
          <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nessun annuncio trovato</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {combined.map(a => {
            const cat = catMap[a.category] || catMap['altro'];
            return (
              <div key={a.id} className={cn("racing-card bg-card p-5 flex flex-col", a.pinned && "border border-accent/30 glow-accent")}>
                <div className="flex items-start justify-between mb-2 gap-2">
                  <Badge variant="outline" className={cn("text-xs", cat.color)}>{cat.label}</Badge>
                  {a.pinned && <Pin className="w-3.5 h-3.5 text-accent flex-shrink-0" />}
                </div>
                <h3 className="font-heading text-foreground text-base mb-1">{a.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 line-clamp-3">{a.content}</p>
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{a.author_username || 'Anonimo'}</span>
                  <div className="flex items-center gap-2">
                    {a.price > 0 && <span className="text-accent font-semibold">€{a.price}</span>}
                    <span>{format(new Date(a.created_date), 'd MMM', { locale: it })}</span>
                  </div>
                </div>
                {a.contact && (
                  <p className="mt-2 text-xs text-primary">Contatto: {a.contact}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Nuovo Annuncio</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-background border-border mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Titolo</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-background border-border mt-1" /></div>
            <div><Label>Descrizione</Label><Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="bg-background border-border mt-1 h-24" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prezzo (€)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="bg-background border-border mt-1" placeholder="0" /></div>
              <div><Label>Contatto</Label><Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className="bg-background border-border mt-1" placeholder="Discord / email" /></div>
            </div>
            <p className="text-xs text-muted-foreground">Gli annunci vengono revisionati prima della pubblicazione. Solo contenuto sim racing.</p>
            <Button onClick={() => create.mutate({ ...form, price: form.price ? Number(form.price) : 0, author_username: myPilot?.username || user?.email, status: 'pending' })} disabled={create.isPending || !form.title} className="w-full bg-primary text-primary-foreground">Invia per approvazione</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}