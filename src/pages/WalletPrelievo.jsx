import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight, AlertTriangle, CheckCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  formatGW, formatEur, gwToEur, calcWithdrawal, canWithdraw,
  MIN_WITHDRAWAL_GW, MIN_WITHDRAWAL_EUR, WITHDRAWAL_FEE
} from '@/lib/walletUtils';
import { toast } from 'sonner';

export default function WalletPrelievo() {
  const queryClient = useQueryClient();
  const [amountGw, setAmountGw] = useState('');
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

  const { data: disputes = [] } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => base44.entities.Complaint.filter({ submitted_by: myPilot?.username }),
    enabled: !!myPilot?.username,
  });

  const kyc_status = myPilot?.kyc_status || 'not_started';
  const activeFreezes = disputes.some(d => d.status === 'reviewing');
  const { allowed, reasons } = canWithdraw(wallet, kyc_status, activeFreezes);

  const gwNum = parseInt(amountGw) || 0;
  const { fee, net, eurNet } = calcWithdrawal(gwNum);
  const isValid = allowed && gwNum >= MIN_WITHDRAWAL_GW && gwNum <= (wallet?.gw_disponibili || 0);

  const withdraw = useMutation({
    mutationFn: async () => {
      const newDisp = (wallet.gw_disponibili || 0) - gwNum;
      // 1. Create withdrawal request
      const wr = await base44.entities.WithdrawalRequest.create({
        user_id: user.id,
        pilot_id: myPilot?.id,
        amount_gw: gwNum,
        fee_gw: fee,
        amount_gw_net: net,
        amount_eur_net: eurNet,
        method,
        status: 'pending',
        kyc_verified: kyc_status === 'approved',
        tx_id: `SANDBOX-WD-${Date.now()}`,
      });
      // 2. Update wallet
      await base44.entities.Wallet.update(wallet.id, {
        gw_disponibili: newDisp,
        last_updated: new Date().toISOString(),
      });
      // 3. Transaction records: withdrawal + fee
      await base44.entities.WalletTransaction.create({
        wallet_id: wallet.id,
        user_id: user.id,
        type: 'withdrawal',
        amount: -gwNum,
        causale: `Prelievo ${formatGW(gwNum)} via ${method} — lordo`,
        balance_disponibili_after: newDisp,
        balance_bonus_after: wallet.gw_bonus || 0,
        balance_bloccati_after: wallet.gw_bloccati || 0,
        reference_id: wr.id,
        reference_type: 'withdrawal',
        status: 'completed',
      });
      await base44.entities.WalletTransaction.create({
        wallet_id: wallet.id,
        user_id: user.id,
        type: 'fee',
        amount: -fee,
        causale: `Commissione S.R.F. 10% su prelievo`,
        balance_disponibili_after: newDisp,
        balance_bonus_after: wallet.gw_bonus || 0,
        balance_bloccati_after: wallet.gw_bloccati || 0,
        reference_id: wr.id,
        reference_type: 'withdrawal',
        status: 'completed',
      });
      return { wr, eurNet, net };
    },
    onSuccess: ({ eurNet, net }) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-tx'] });
      setDone({ gwNum, fee, net, eurNet });
      toast.success('Richiesta prelievo inviata!');
    },
  });

  if (done) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-heading text-2xl text-foreground">Richiesta Inviata</h2>
        <div className="racing-card bg-card p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">GW richiesti</span><span>{formatGW(done.gwNum)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Commissione 10%</span><span className="text-red-400">-{formatGW(done.fee)}</span></div>
          <div className="flex justify-between border-t border-border pt-2"><span className="font-semibold">Ricevi (netto)</span><span className="text-primary font-bold">{formatEur(done.eurNet)}</span></div>
        </div>
        <p className="text-xs text-muted-foreground">Erogazione entro 7 giorni lavorativi (sandbox: simulata)</p>
        <Link to="/wallet"><Button className="bg-primary text-primary-foreground mt-2">Torna al Wallet</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md">
      <div className="flex items-center gap-3">
        <Link to="/wallet"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="font-heading text-2xl text-foreground flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-primary" /> Prelievo GW
          </h1>
          <p className="text-muted-foreground text-sm">Commissione S.R.F.: {WITHDRAWAL_FEE * 100}%</p>
        </div>
      </div>

      {/* Blockers */}
      {!allowed && (
        <div className="space-y-2">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-destructive/20 bg-destructive/5">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{r}</p>
            </div>
          ))}
          {kyc_status !== 'approved' && (
            <Link to="/kyc">
              <Button variant="outline" className="w-full border-primary/30 text-primary mt-2">
                <ShieldCheck className="w-4 h-4 mr-2" /> Completa KYC
              </Button>
            </Link>
          )}
        </div>
      )}

      <div className={cn("racing-card bg-card p-5 space-y-5", !allowed && "opacity-50 pointer-events-none")}>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>GW Disponibili</span>
          <span className="text-primary font-bold">{formatGW(wallet?.gw_disponibili || 0)}</span>
        </div>

        <div>
          <Label>Importo da prelevare (in GW)</Label>
          <Input
            type="number" min={MIN_WITHDRAWAL_GW} step={10000}
            value={amountGw}
            onChange={e => setAmountGw(e.target.value)}
            placeholder={`Minimo ${formatGW(MIN_WITHDRAWAL_GW)}`}
            className="bg-background border-border mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">Soglia minima: {formatGW(MIN_WITHDRAWAL_GW)} = €{MIN_WITHDRAWAL_EUR}</p>
        </div>

        {gwNum >= MIN_WITHDRAWAL_GW && (
          <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">GW lordi</span><span>{formatGW(gwNum)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Commissione S.R.F. 10%</span><span className="text-red-400">-{formatGW(fee)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">GW netti</span><span>{formatGW(net)}</span></div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-bold text-foreground">Ricevi in Euro</span>
              <span className="font-heading text-xl text-primary font-black">{formatEur(eurNet)}</span>
            </div>
          </div>
        )}

        <div>
          <Label>Metodo</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="bg-background border-border mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="test_sandbox">🧪 Sandbox (test)</SelectItem>
              <SelectItem value="bank_transfer" disabled>Bonifico IBAN (non disponibile in sandbox)</SelectItem>
              <SelectItem value="paypal" disabled>PayPal (non disponibile in sandbox)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => withdraw.mutate()}
          disabled={!isValid || withdraw.isPending}
          className="w-full bg-primary text-primary-foreground h-11"
        >
          {withdraw.isPending ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Elaborazione...</> : `Richiedi Prelievo ${gwNum >= MIN_WITHDRAWAL_GW ? formatEur(eurNet) + ' netti' : ''}`}
        </Button>
      </div>
    </div>
  );
}