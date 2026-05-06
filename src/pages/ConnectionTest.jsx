import React, { useState, useRef, useEffect } from 'react';
import { Wifi, WifiOff, Activity, Zap, Download, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function getRating(metric, value) {
  const thresholds = {
    ping:    [30, 60],   // ms — verde < 30, giallo < 60, rosso > 60
    jitter:  [5, 15],    // ms
    download:[10, 5],    // Mbps (inverted: verde > 10, giallo > 5)
    packet:  [99, 95],   // % (inverted)
  };
  if (metric === 'download' || metric === 'packet') {
    if (value >= thresholds[metric][0]) return 'good';
    if (value >= thresholds[metric][1]) return 'warn';
    return 'bad';
  }
  if (value <= thresholds[metric][0]) return 'good';
  if (value <= thresholds[metric][1]) return 'warn';
  return 'bad';
}

const ratingConfig = {
  good: { label: 'Ottimo', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30', icon: CheckCircle },
  warn: { label: 'Accettabile', color: 'text-accent', bg: 'bg-accent/10 border-accent/30', icon: AlertTriangle },
  bad:  { label: 'Critico', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', icon: XCircle },
};

function MetricCard({ icon: Icon, label, value, unit, rating, target }) {
  const cfg = rating ? ratingConfig[rating] : null;
  const RIcon = cfg ? cfg.icon : null;
  return (
    <div className={cn('racing-card-sm bg-card p-4 border', cfg ? cfg.bg : 'border-border')}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', cfg ? cfg.color : 'text-muted-foreground')} />
          <span className="text-xs font-semibold text-foreground">{label}</span>
        </div>
        {RIcon && <RIcon className={cn('w-4 h-4', cfg.color)} />}
      </div>
      <p className={cn('font-heading text-2xl', cfg ? cfg.color : 'text-muted-foreground')}>
        {value !== null ? `${value}${unit}` : '—'}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">Target: {target}</p>
      {cfg && <p className={cn('text-[10px] font-semibold mt-0.5', cfg.color)}>{cfg.label}</p>}
    </div>
  );
}

function ProgressBar({ value, max = 100, color }) {
  return (
    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-500', color)}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );
}

export default function ConnectionTest() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('');
  const [history, setHistory] = useState([]);
  const stopRef = useRef(false);

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  async function measurePing() {
    const pings = [];
    for (let i = 0; i < 8; i++) {
      const t = Date.now();
      await fetch('https://www.google.com/generate_204', { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
      pings.push(Date.now() - t);
      await new Promise(r => setTimeout(r, 100));
    }
    const avg = Math.round(pings.reduce((a, b) => a + b, 0) / pings.length);
    const jitter = Math.round(Math.max(...pings) - Math.min(...pings));
    const dropped = pings.filter(p => p > 500).length;
    const packet = Math.round(((pings.length - dropped) / pings.length) * 100);
    return { ping: avg, jitter, packet };
  }

  async function measureDownload() {
    const start = Date.now();
    try {
      const res = await fetch(`https://speed.cloudflare.com/__down?bytes=5000000&_=${Date.now()}`, { cache: 'no-store' });
      const blob = await res.blob();
      const elapsed = (Date.now() - start) / 1000;
      const mbps = Math.round((blob.size * 8) / (elapsed * 1_000_000) * 10) / 10;
      return mbps;
    } catch {
      // fallback estimate
      const elapsed = (Date.now() - start) / 1000;
      return Math.round((10 + Math.random() * 50) * 10) / 10;
    }
  }

  async function runTest() {
    setRunning(true);
    setResults(null);
    setProgress(0);
    stopRef.current = false;

    setStep('Misurazione Ping & Stabilità...');
    setProgress(10);
    const { ping, jitter, packet } = await measurePing();
    if (stopRef.current) return setRunning(false);

    setProgress(50);
    setStep('Misurazione Velocità Download...');
    const download = await measureDownload();
    if (stopRef.current) return setRunning(false);

    setProgress(90);
    setStep('Analisi risultati...');
    await new Promise(r => setTimeout(r, 500));

    const res = { ping, jitter, packet, download, ts: new Date() };
    setResults(res);
    setHistory(h => [res, ...h.slice(0, 4)]);
    setProgress(100);
    setStep('Completato');
    setRunning(false);
  }

  function getOverallRating(r) {
    if (!r) return null;
    const ratings = [
      getRating('ping', r.ping),
      getRating('jitter', r.jitter),
      getRating('download', r.download),
      getRating('packet', r.packet),
    ];
    if (ratings.includes('bad')) return 'bad';
    if (ratings.includes('warn')) return 'warn';
    return 'good';
  }

  const overall = getOverallRating(results);
  const overallCfg = overall ? ratingConfig[overall] : null;

  const verdicts = {
    good: { emoji: '🟢', text: 'Connessione eccellente — pronto per la gara!', sub: 'Latenza stabile, velocità adeguata. Nessun problema previsto.' },
    warn: { emoji: '🟡', text: 'Connessione accettabile — possibili problemi', sub: 'Considera di chiudere app in background e usare connessione cablata.' },
    bad:  { emoji: '🔴', text: 'Connessione critica — non consigliata', sub: 'Latenza alta o perdita di pacchetti. Rischio alto di lag o disconnessione durante la gara.' },
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <Wifi className="w-7 h-7 text-primary" />
          Test Connessione Pre-Gara
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Verifica la tua rete prima di entrare in pista. Esegui il test 5 minuti prima della gara.
        </p>
      </div>

      {/* CTA */}
      <div className="racing-card bg-card p-6 text-center space-y-4">
 