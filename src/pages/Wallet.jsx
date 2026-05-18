import React from 'react';
import { Link } from 'react-router-dom';
import { Coins, ArrowUpRight, ArrowDownLeft, ShieldCheck, Clock, ChevronRight, TrendingUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// DEMO DATA — nessun backend richiesto
const DEMO_WALLET = {
  gw_disponibili: 3_750_000,
  gw_bonus: 750_000,
  gw_bloccati: 1_000_000,
  bonus_expires_at: '2026-06-04T00:00:00Z',
};

const DEMO_TRANSACTIONS = [
  { id: 1, type: 'prize',        causale: '1° posto — Monza Sprint Race',         amount: 2_000_000,  created_date: '2026-04-28' },
  { id: 2, type: 'welcome_bonus',causale: 'Bonus benvenuto S.R.F.',                amount: 750_000,    created_date: '2026-04-20' },
  { id: 3, type: 'deposit',      causale: 'Ricarica wallet — €25,00',              amount: 1_000_000,  created_date: '2026-04-18' },
  { id: 4, type: 'freeze',       causale: 'Escrow gara — Spa Endurance',           amount: -1_000_000, created_date: '2026-04-15' },
  { id: 5, type: 'fee',          causale: 'Iscrizione — Red Bull Ring Time Attack', amount: -200_000,   created_date: '2026-04-10' },
];

const gwToEur = (gw) => ((gw / 100_000) * 2.5).toFixed(2);
const formatGW = (gw) => (gw >= 1_000_000
  ? (gw / 1_000_000).toFixed(1) + 'M GW'
  : (gw / 1_000).toFixed(0) + 'K GW');

const TX_LABELS = {
  prize:         { label: 'Premio gara',    color: 'text-green-400' },
  welcome_bonus: { label: 'Bonus S.R.F.',   color: 'text-accent' },
  deposit:       { label: 'Ricarica',       color: 'text-blue-400' },
  freeze:        { label: 'Escrow',         color: 'text-orange-400' },
  fee:           { label: 'Iscrizione',     color: 'text-muted-foreground' },
  withdrawal:    { label: 'Prelievo',       color: 'text-red-400' },
};

export default function Wallet() {
  const w = DEMO_WALLET;
  const totalGW = w.gw_disponibili + w.gw_bonus + w.gw_bloccati;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <Coins className="w-7 h-7 text-primary" /> Wallet GW
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Golden Wheels — Valuta ufficiale S.R.F.</p>
        </div>
        <Badge variant="outline" className="border-green-500/40 text-green-400">
          <ShieldCheck className="w-3 h-3 mr-1" /> KYC: Verificato
        </Badge>
      </div>

      {/* Demo banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-primary/30 bg-primary/5">
        <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-sm text-primary font-medium">
          Modalità Demo — dati simulati per presentazione S.R.F. · 100.000 GW = €2,50
        </p>
      </div>

      {/* Bonus expiry */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-accent/30 bg-accent/5">
        <Clock className="w-4 h-4 text-accent flex-shrink-0" />
        <p className="text-sm text-accent">
          I tuoi <strong>{formatGW(w.gw_bonus)}</strong> GW Bonus scadono il <strong>4 giugno 2026</strong>
        </p>
      </div>

      {/* 3 saldi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Disponibili */}
        <div className="racing-card bg-card p-5 space-y-2 border border-green-500/20">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">GW Disponibili</p>
          <p className="font-heading text-2xl text-green-400">{formatGW(w.gw_disponibili)}</p>
          <p className="text-xs text-muted-foreground">≈ €{gwToEur(w.gw_disponibili)}</p>
          <p className="text-[10px] text-green-400/60 uppercase tracking-wide">Prelevabili ✓</p>
        </div>
        {/* Bonus */}
        <div className="racing-card bg-card p-5 space-y-2 border border-accent/20">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">GW Bonus</p>
          <p className="font-heading text-2xl text-accent">{formatGW(w.gw_bonus)}</p>
          <p className="text-xs text-muted-foreground">≈ €{gwToEur(w.gw_bonus)}</p>
          <p className="text-[10px] text-accent/60 uppercase tracking-wide">Solo in-platform · scad. 60gg</p>
        </div>
        {/* Bloccati */}
        <div className="racing-card bg-card p-5 space-y-2 border border-orange-500/20">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">GW Bloccati</p>
          <p className="font-heading text-2xl text-orange-400">{formatGW(w.gw_bloccati)}</p>
          <p className="text-xs text-muted-foreground">≈ €{gwToEur(w.gw_bloccati)}</p>
          <p className="text-[10px] text-orange-400/60 uppercase tracking-wide flex items-center gap-1"><Lock className="w-3 h-3" /> Escrow gara attiva</p>
        </div>
      </div>

      {/* Totale */}
      <div className="racing-card bg-card px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Totale wallet</p>
          <p className="font-heading text-xl text-foreground">{formatGW(totalGW)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Controvalore</p>
          <p className="font-heading text-xl text-primary">€ {gwToEur(totalGW)}</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/wallet/ricarica">
          <Button className="w-full bg-primary text-primary-foreground h-11">
            <ArrowDownLeft className="w-4 h-4 mr-2" /> Ricarica
          </Button>
        </Link>
        <Link to="/wallet/prelievo">
          <Button variant="outline" className="w-full h-11 border-primary/30 text-primary">
            <ArrowUpRight className="w-4 h-4 mr-2" /> Prelievo
          </Button>
        </Link>
      </div>

      {/* KYC completato */}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-green-500/20 bg-green-500/5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-sm font-semibold text-foreground">Identità verificata KYC</p>
            <p className="text-xs text-muted-foreground">Prelievi e gare con premio reale abilitati</p>
          </div>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-0">✓ Approvato</Badge>
      </div>

      {/* Movimenti recenti */}
      <div className="racing-card bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Movimenti Recenti</h3>
          <Link to="/wallet/movimenti" className="text-xs text-primary hover:underline">Vedi tutti →</Link>
        </div>
        <div className="divide-y divide-border">
          {DEMO_TRANSACTIONS.map(tx => {
            const meta = TX_LABELS[tx.type] || { label: tx.type, color: 'text-foreground' };
            const positive = tx.amount > 0;
            return (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${positive ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-sm text-foreground font-medium">{tx.causale}</p>
                    <p className={`text-xs ${meta.color}`}>{meta.label} · {tx.created_date}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold font-heading ${positive ? 'text-green-400' : 'text-red-400'}`}>
                  {positive ? '+' : ''}{formatGW(Math.abs(tx.amount))}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
