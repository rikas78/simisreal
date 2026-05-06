import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowDownLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { eurToGw, formatGW, formatEur, gwToEur, EUR_TO_GW_RATE } from '@/lib/walletUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];
const MIN_EUR = 5;

export default function WalletRicarica() {
  const queryClient = useQueryClient();
  const [amountEur, setAmountEur] = useState('');
  const [method, setMethod] = useState('test_sandbox');
  const [done, setDone] = useState(null);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: pilots = [] } = useQuery({ queryKey: ['pilots'], queryFn: () => base44.entities.Pilot.list() });
  const myPilot = pilots.find(p => p.created_by === user?.email);

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: () => base44.entities.Wallet.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });
  const wallet = wallets[0];

  const eurNum = parseFloat(amountEur) || 0;
  const gwAmount = eurToGw(eurNum);
  const isValid = eurNum >= MIN_EUR;

  const deposit = useMutation({
    mutationFn: async () => {
      // 1. Create deposit request
      const dep = await base44.entities.DepositRequest.create({
        user_id: user.id,
        pilot_id: myPilot?.id,
        amount_eur: eurNum,
        gw_equivalent: gwAmount,
        method,
        status: 'completed', // sandbox: auto-complete
        tx_id: `SANDBOX-${Date.now()}`,
      });

      // 2. Update wallet
      const newBonus = (wallet.gw_bonus || 0);
      const newDisp = (wallet.gw_disponibili || 0) + gwAmount;
      await base44.entities.Wallet.update(wallet.id, {
        gw_disponibili: newDisp,
        last_updated: new Date().toISOString(),
      });

      // 3. Create transaction record
      const tx = await base44.entities.WalletTransaction.create({
        wallet_id: wallet.id,
        user_id: user.id,
        type: 'deposit',
        amount: gwAmount,
        causale: `Ricarica ${formatEur(eurNum)} via ${method} (SANDBOX)`,
        balance_disponibili_after: newDisp,
        balance_bonus_after: newBonus,
        balance_bloccati_after: wallet.gw_bloccati || 0,
        reference_id: dep.id,
        reference_type: 'deposit',
        status: 'completed',
      });

      return { dep, tx, newDisp };
    },
    onSuccess: ({ newDisp }) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-tx'] });
      setDone({ eurNum, gwAmount, newDisp });
      toast.success(`Ricarica riuscita! Ricevuti ${formatGW(gwAmount)}`);
    },
  });

  if (done) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="font-heading text-2xl text-foreground">Ricarica Completata</h2>
        <p className="text-muted-foreground">Hai ricevuto <span className="text-primary font-bold">{formatGW(done.gwAmount)}</span></p>
        <p className="text-xs text-muted-foreground">Saldo GW Disponibili: {formatGW(done.newDisp)}</p>
        <p className="text-[10px] text-accent font-bold uppercase tracking-widest">SANDBOX — nessun addebito reale</p>
        <div className="flex gap-3 justify-center mt-4">
          <Link to="/wallet"><Button className="bg-primary text-primary-foreground">Torna al Wallet</Button></Link>
          <Button variant="outline" onClick={() => { setDone(null); setAmountEur(''); }}>Nuova Ricarica</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md">
      <div className="flex items-center gap-3">
        <Link to="/wallet"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="font-heading text-2xl text-foreground flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-primary" /> Ricarica Wallet
          </h1>
          <p className="text-muted-foreground text-sm">1 € = {formatGW(EUR_TO_GW_RATE)}</p>
        </div>
      </div>

      <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5 text-xs">
        🧪 MODALITÀ SANDBOX — Nessun pagamento reale
      </Badge>

      <div className="racing-card bg-card p-5 space-y-5">
        {/* Preset amounts */}
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Importi rapidi</Label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_AMOUNTS.map(a => (
              <button key={a} onClick={() => setAmountEur(String(a))}
                className={cn("px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all",
                  amountEur === String(a) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground hover:border-primary/50')}>
                €{a}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <Label>Importo in Euro</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">€</span>
            <Input
              type="number" min={MIN_EUR} step="0.01"
              value={amountEur}
              onChange={(e) => setAmountEur(e.target.value)}
              placeholder={`Minimo €${MIN_EUR}`}
              className="pl-8 bg-background border-border"
            />
          </div>
        </div>

        {/* Conversion preview */}
        {eurNum >= MIN_EUR && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Importo</span>
              <span className="text-foreground font-semibold">{formatEur(eurNum)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tasso conversione</span>
              <span className="text-foreground font-mono">1 € = {formatGW(EUR_TO_GW_RATE)}</span>
            </div>
            <div className="border-t border-primary/20 pt-2 flex justify-between">
              <span className="text-sm font-semibold text-foreground">Ricevi</span>
              <span className="font-heading text-xl text-primary font-black">{formatGW(gwAmount)}</span>
            </div>
          </div>
        )}

        {/* Payment method */}
        <div>
          <Label>Metodo di pagamento</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="bg-background border-border mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="test_sandbox">🧪 Sandbox (test gratuito)</SelectItem>
              <SelectItem value="card" disabled>Carta (non disponibile in sandbox)</SelectItem>
              <SelectItem value="paypal" disabled>PayPal (non disponibile in sandbox)</SelectItem>
              <SelectItem value="bank_transfer" disabled>Bonifico (non disponibile in sandbox)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => deposit.mutate()}
          disabled={!isValid || deposit.isPending || !wallet}
          className="w-full bg-primary text-primary-foreground h-11"
        >
          {deposit.isPending ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Elaborazione...</> : `Conferma Ricarica ${isValid ? formatEur(eurNum) : ''}`}
        </Button>

        {!wallet && <p className="text-xs text-destructive text-center">Attiva prima il wallet dalla pagina principale</p>}
      </div>
    </div>
  );
}