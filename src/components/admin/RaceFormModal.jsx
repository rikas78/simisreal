import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const TRACKS = [
  'Monza','Spa-Francorchamps','Nürburgring GP','Mugello','Imola','Silverstone',
  'Brands Hatch','Laguna Seca','Suzuka','Interlagos','Barcellona','Le Mans',
  'Daytona','Road Atlanta','Watkins Glen','Mount Panorama','Fuji','Zandvoort',
];

const EMPTY = {
  title: '', championship: '', description: '', regulations: '',
  simulator: 'GT7', category: 'GT3', track: '',
  date: '', duration_laps: '', duration_minutes: '',
  entry_fee: 0, min_participants: 2, max_participants: 20,
  status: 'upcoming',
  bop: false, realistic_damage: true, weather: 'Fisso',
  fuel_consumption: false, mandatory_pitstop: false, stability_control: 'Consentito',
  prize_pct_1: 50, prize_pct_2: 30, prize_pct_3: 20,
};

function SwitchRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30">
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

export default function RaceFormModal({ race, onSave, onClose, isSaving }) {
  const [form, setForm] = useState(EMPTY);
  const [customTrack, setCustomTrack] = useState(false);

  useEffect(() => {
    if (race) {
      setForm({ ...EMPTY, ...race });
      setCustomTrack(!TRACKS.includes(race.track));
    } else {
      setForm(EMPTY);
    }
  }, [race]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim() || !form.date) return;
    onSave(form);
  };

  const pctTotal = (Number(form.prize_pct_1) || 0) + (Number(form.prize_pct_2) || 0) + (Number(form.prize_pct_3) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative racing-card bg-card border border-border shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-card z-10 flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading text-lg text-foreground">{race ? 'Modifica Gara' : 'Crea Nuova Gara'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Base info */}
          <section className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Informazioni Base</p>
            <div>
              <Label>Nome Gara *</Label>
              <Input value={form.title} onChange={e => set('title', e.target.value)} className="bg-background border-border mt-1" placeholder="es. GT3 Championship Round 4" />
            </div>
            <div>
              <Label>Campionato</Label>
              <Input value={form.championship} onChange={e => set('championship', e.target.value)} className="bg-background border-border mt-1" placeholder="es. SIM is REAL GT Series" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Simulatore</Label>
                <Select value={form.simulator} onValueChange={v => set('simulator', v)}>
                  <SelectTrigger className="bg-background border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['GT7','Assetto Corsa','iRacing','MotoGP'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => set('category', v)}>
                  <SelectTrigger className="bg-background border-border mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['GT3','GT4','Formula','Rally','Endurance'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Circuito</Label>
              <div className="flex gap-2 mt-1">
                {customTrack ? (
                  <Input value={form.track} onChange={e => set('track', e.target.value)} className="bg-background border-border flex-1" placeholder="Nome circuito..." />
                ) : (
                  <Select value={form.track} onValueChange={v => set('track', v)}>
                    <SelectTrigger className="bg-background border-border flex-1"><SelectValue placeholder="Seleziona circuito" /></SelectTrigger>
                    <SelectContent>
                      {TRACKS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                <button onClick={() => setCustomTrack(!customTrack)} className="text-xs text-primary hover:underline whitespace-nowrap">
                  {customTrack ? 'Lista' : 'Testo libero'}
                </button>
              </div>
            </div>
            <div>
              <Label>Data e Ora *</Label>
              <Input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} className="bg-background border-border mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Giri (opz.)</Label>
                <Input type="number" value={form.duration_laps} onChange={e => set('duration_laps', e.target.value)} className="bg-background border-border mt-1" placeholder="es. 20" />
              </div>
              <div>
                <Label>Durata minuti (opz.)</Label>
                <Input type="number" value={form.duration_minutes} onChange={e => set('duration_minutes', e.target.value)} className="bg-background border-border mt-1" placeholder="es. 60" />
              </div>
            </div>
          </section>

          {/* Partecipanti & quota */}
          <section className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Partecipanti & Quota</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Min Piloti</Label>
                <Input type="number" value={form.min_participants} onChange={e => set('min_participants', Number(e.target.value))} className="bg-background border-border mt-1" />
              </div>
              <div>
                <Label>Max Piloti</Label>
                <Input type="number" value={form.max_participants} onChange={e => set('max_participants', Number(e.target.value))} className="bg-background border-border mt-1" />
              </div>
              <div>
                <Label>Quota (€)</Label>
                <Input type="number" value={form.entry_fee} onChange={e => set('entry_fee', Number(e.target.value))} className="bg-background border-border mt-1" />
              </div>
            </div>
          </section>

          {/* Distribuzione montepremi */}
          <section className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Distribuzione Montepremi (%)</p>
            <div className="grid grid-cols-3 gap-3">
              {[['🥇 1° posto', 'prize_pct_1'], ['🥈 2° posto', 'prize_pct_2'], ['🥉 3° posto', 'prize_pct_3']].map(([label, key]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input type="number" value={form[key]} onChange={e => set(key, Number(e.target.value))} className="bg-background border-border mt-1" />
                </div>
              ))}
            </div>
            <p className={cn("text-xs", pctTotal === 100 ? 'text-green-400' : 'text-destructive')}>
              Totale: {pctTotal}% {pctTotal !== 100 ? '⚠ deve essere 100%' : '✓'}
            </p>
          </section>

          {/* Impostazioni tecniche */}
          <section className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Impostazioni Tecniche</p>
            <SwitchRow label="BOP (Balance of Performance)" value={form.bop} onChange={v => set('bop', v)} />
            <SwitchRow label="Danni Realistici" value={form.realistic_damage} onChange={v => set('realistic_damage', v)} />
            <SwitchRow label="Consumo Carburante" value={form.fuel_consumption} onChange={v => set('fuel_consumption', v)} />
            <SwitchRow label="Pit Stop Obbligatorio" value={form.mandatory_pitstop} onChange={v => set('mandatory_pitstop', v)} />
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <span className="text-sm text-foreground">Meteo</span>
              <Select value={form.weather} onValueChange={v => set('weather', v)}>
                <SelectTrigger className="w-36 h-8 text-xs bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fisso">Fisso</SelectItem>
                  <SelectItem value="Dinamico">Dinamico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">Controllo Stabilità</span>
              <Select value={form.stability_control} onValueChange={v => set('stability_control', v)}>
                <SelectTrigger className="w-36 h-8 text-xs bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consentito">Consentito</SelectItem>
                  <SelectItem value="Vietato">Vietato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Descrizione & Regolamento */}
          <section className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Testi</p>
            <div>
              <Label>Descrizione</Label>
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} className="bg-background border-border mt-1 h-20" placeholder="Breve descrizione della gara..." />
            </div>
            <div>
              <Label>Regolamento</Label>
              <Textarea value={form.regulations} onChange={e => set('regulations', e.target.value)} className="bg-background border-border mt-1 h-28" placeholder="Regole specifiche, penalità, comportamento in pista..." />
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-border">Annulla</Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !form.title.trim() || !form.date || pctTotal !== 100}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? 'Salvataggio...' : race ? 'Salva Modifiche' : 'Crea Gara'}
          </Button>
        </div>
      </div>
    </div>
  );
}