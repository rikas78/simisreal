import React, { useState, useMemo } from 'react';
import { Settings, ChevronDown, ChevronUp, Save, RotateCcw, Copy, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const CARS = [
  'Lamborghini Huracán GT3 EVO','Ferrari 296 GT3','Porsche 992 GT3 R',
  'BMW M4 GT3','Aston Martin Vantage GT3','Mercedes-AMG GT3','McLaren 720S GT3 EVO',
  'Porsche 718 Cayman GT4','BMW M4 GT4','Aston Martin Vantage GT4',
  'Toyota GR86','Toyota GR Supra','Honda Civic Type R (FL5)',
];

const TRACKS = [
  'Red Bull Ring','Monza','Spa-Francorchamps','Nürburgring GP',
  'Brands Hatch','Barcellona','Zandvoort','Imola','Fuji','Suzuka',
  'Tokyo Expressway','Willow Springs','Blue Moon Bay',
];

const CONDITIONS = ['☀️ Asciutto','🌧️ Bagnato','⛅ Misto'];

const DEFAULT_SETUP = {
  front_wing: 15, rear_wing: 25,
  front_height: 85, rear_height: 90,
  front_spring: 5, rear_spring: 6,
  front_arb: 4, rear_arb: 4,
  front_comp: 5, rear_comp: 5,
  diff_accel: 40, diff_brake: 20,
  brake_bias: 56, brake_force: 7,
  front_pressure: 1.9, rear_pressure: 1.85,
  front_camber: -2.5, rear_camber: -1.5,
  front_toe: 0.0, rear_toe: 0.1,
  notes: '', best_time: '',
};

function Section({ title, icon, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="racing-card bg-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-border/50 hover:bg-secondary/10 transition-colors"
      >
        <span className="font-heading text-sm text-foreground flex items-center gap-2">
          <span>{icon}</span>{title}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

function SliderRow({ label, value, min, max, step = 1, unit = '', hint, onChange }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <Label className="text-xs text-foreground">{label}</Label>
        <span className="font-heading text-sm text-primary">{value}{unit}</span>
      </div>
      <Slider
        min={min} max={max} step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function SetupMacchine() {
  const [car, setCar] = useState('');
  const [track, setTrack] = useState('');
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [setup, setSetup] = useState(DEFAULT_SETUP);
  const [saved, setSaved] = useState(false);

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: pilots = [] } = useQuery({ queryKey: ['pilots'], queryFn: () => base44.entities.Pilot.list() });
  const myPilot = pilots.find(p => p.created_by === me?.email);

  const set = (k, v) => setSetup(s => ({ ...s, [k]: v }));

  const isConfigured = car && track;

  const handleSave = () => {
    if (!isConfigured) return toast.error('Seleziona vettura e circuito');
    const key = `setup_${car}_${track}_${condition}`;
    localStorage.setItem(key, JSON.stringify({ ...setup, savedAt: new Date().toISOString(), pilot: myPilot?.username }));
    setSaved(true);
    toast.success('Setup salvato!');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLoad = () => {
    const key = `setup_${car}_${track}_${condition}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setSetup({ ...DEFAULT_SETUP, ...JSON.parse(saved) });
      toast.success('Setup caricato!');
    } else {
      toast.error('Nessun setup salvato per questa configurazione');
    }
  };

  const handleReset = () => { setSetup(DEFAULT_SETUP); toast.info('Setup resettato ai valori default'); };

  const handleCopy = () => {
    const text = Object.entries(setup)
      .filter(([k]) => k !== 'notes')
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    navigator.clipboard.writeText(`Setup: ${car} @ ${track} (${condition})\n\n${text}`);
    toast.success('Setup copiato negli appunti!');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" />
          Setup Macchine
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Configura e salva il setup per ogni vettura e circuito</p>
      </div>

      {/* Config selector */}
      <div className="racing-card bg-card p-5 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">🔍 Configurazione</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs mb-1">Vettura</Label>
            <Select value={car} onValueChange={setCar}>
              <SelectTrigger className="bg-background border-border"><SelectValue placeholder="— Seleziona Vettura —" /></SelectTrigger>
              <SelectContent>{CARS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">Circuito</Label>
            <Select value={track} onValueChange={setTrack}>
              <SelectTrigger className="bg-background border-border"><SelectValue placeholder="— Seleziona Circuito —" /></SelectTrigger>
              <SelectContent>{TRACKS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">Condizioni</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
              <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        {isConfigured && (
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={handleLoad} variant="outline" className="text-xs h-8">Carica Salvato</Button>
            <Button size="sm" onClick={handleReset} variant="outline" className="text-xs h-8"><RotateCcw className="w-3 h-3 mr-1" />Reset</Button>
            <Button size="sm" onClick={handleCopy} variant="outline" className="text-xs h-8"><Copy className="w-3 h-3 mr-1" />Copia</Button>
          </div>
        )}
      </div>

      {!isConfigured ? (
        <div className="racing-card bg-card p-16 text-center">
          <Settings className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Seleziona vettura e circuito per cominciare</p>
        </div>
      ) : (
        <>
          <Section title="Aerodinamica" icon="💨">
            <SliderRow label="Ala Anteriore" value={setup.front_wing} min={0} max={50} onChange={v => set('front_wing', v)} hint="0 = Min deportanza · 50 = Max" />
            <SliderRow label="Ala Posteriore" value={setup.rear_wing} min={0} max={50} onChange={v => set('rear_wing', v)} hint="0 = Bassa · 50 = Massima" />
          </Section>

          <Section title="Sospensioni" icon="🔧">
            <div className="grid grid-cols-2 gap-4">
              <SliderRow label="Altezza Ant. (mm)" value={setup.front_height} min={50} max={150} onChange={v => set('front_height', v)} unit="mm" />
              <SliderRow label="Altezza Post. (mm)" value={setup.rear_height} min={50} max={150} onChange={v => set('rear_height', v)} unit="mm" />
              <SliderRow label="Molla Ant." value={setup.front_spring} min={1} max={10} onChange={v => set('front_spring', v)} />
              <SliderRow label="Molla Post." value={setup.rear_spring} min={1} max={10} onChange={v => set('rear_spring', v)} />
              <SliderRow label="Barra Ant. (ARB)" value={setup.front_arb} min={1} max={7} onChange={v => set('front_arb', v)} />
              <SliderRow label="Barra Post. (ARB)" value={setup.rear_arb} min={1} max={7} onChange={v => set('rear_arb', v)} />
              <SliderRow label="Ammort. Comp. Ant." value={setup.front_comp} min={1} max={10} onChange={v => set('front_comp', v)} />
              <SliderRow label="Ammort. Comp. Post." value={setup.rear_comp} min={1} max={10} onChange={v => set('rear_comp', v)} />
            </div>
          </Section>

          <Section title="Trasmissione & Freni" icon="⚙️">
            <SliderRow label="Differenziale Accelerazione" value={setup.diff_accel} min={0} max={100} unit="%" onChange={v => set('diff_accel', v)} hint="0% = Libero · 100% = Bloccato" />
            <SliderRow label="Differenziale Frenata" value={setup.diff_brake} min={0} max={100} unit="%" onChange={v => set('diff_brake', v)} hint="0% = Libero · 100% = Bloccato" />
            <SliderRow label="Bilanciamento Freni (Ant.)" value={setup.brake_bias} min={40} max={70} unit="%" onChange={v => set('brake_bias', v)} hint="Tipicamente 55–60% anteriore" />
            <SliderRow label="Forza Frenante" value={setup.brake_force} min={1} max={10} onChange={v => set('brake_force', v)} />
          </Section>

          <Section title="Gomme" icon="🔵">
            <div className="grid grid-cols-2 gap-4">
              <SliderRow label="Pressione Ant. (bar)" value={setup.front_pressure} min={1.5} max={2.5} step={0.05} unit=" bar" onChange={v => set('front_pressure', Math.round(v * 100) / 100)} />
              <SliderRow label="Pressione Post. (bar)" value={setup.rear_pressure} min={1.5} max={2.5} step={0.05} unit=" bar" onChange={v => set('rear_pressure', Math.round(v * 100) / 100)} />
              <SliderRow label="Camber Ant. (°)" value={setup.front_camber} min={-5} max={0} step={0.1} unit="°" onChange={v => set('front_camber', Math.round(v * 10) / 10)} />
              <SliderRow label="Camber Post. (°)" value={setup.rear_camber} min={-5} max={0} step={0.1} unit="°" onChange={v => set('rear_camber', Math.round(v * 10) / 10)} />
              <SliderRow label="Toe Ant. (°)" value={setup.front_toe} min={-0.5} max={0.5} step={0.05} unit="°" onChange={v => set('front_toe', Math.round(v * 100) / 100)} />
              <SliderRow label="Toe Post. (°)" value={setup.rear_toe} min={-0.5} max={0.5} step={0.05} unit="°" onChange={v => set('rear_toe', Math.round(v * 100) / 100)} />
            </div>
          </Section>

          <Section title="Note Pilota" icon="📝">
            <div>
              <Label className="text-xs">Miglior Tempo</Label>
              <Input value={setup.best_time} onChange={e => set('best_time', e.target.value)} placeholder="es. 1:42.345" className="bg-background border-border mt-1 font-heading" />
            </div>
            <div>
              <Label className="text-xs">Note</Label>
              <Textarea value={setup.notes} onChange={e => set('notes', e.target.value)} placeholder="Impressioni, cosa migliorare, condizioni pista..." className="bg-background border-border mt-1 h-24" />
            </div>
          </Section>

          {/* Save bar */}
          <div className="sticky bottom-4 racing-card bg-card border border-primary/20 p-4 flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{car}</span> @ {track} · {condition}
            </div>
            <Button
              onClick={handleSave}
              className={cn('bg-primary text-primary-foreground hover:bg-primary/90', saved && 'bg-green-500 hover:bg-green-500')}
            >
              <Save className="w-4 h-4 mr-2" />
              {saved ? 'Salvato ✓' : 'Salva Setup'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}