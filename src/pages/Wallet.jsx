import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Coins, ArrowUpRight, ArrowDownLeft, ShieldCheck, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import WalletBalanceCard from '@/components/wallet/WalletBalanceCard';
import WalletRecentTx from '@/components/wallet/WalletRecentTx';
import { getKycStatusLabel, getKycStatusColor, canWithdraw, WELCOME_BONUS_GW, WELCOME_BONUS_DAYS, formatGW } from '@/lib/walletUtils';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Wallet() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: pilots = [] } = useQuery({ queryKey: ['pilots'], queryFn: () => base44.entities.Pilot.list() });
  const myPilot = pilots.find(p => p.created_by === user?.email);

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallet', myPilot?.id],
    queryFn: () => base44.entities.Wallet.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });
  const wallet = wallets[0];

  const { data: transactions = [] } = useQuery({
    queryKey: ['wallet-tx', wallet?.id],
    queryFn: () => base44.entities.WalletTransaction.filter({ wallet_id: wallet.id }, '-created_date', 10),
    enabled: !!wallet?.id,
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => base44.entities.Complaint.filter({ submitted_by: myPilot?.username }),
    enabled: !!myPilot?.username,
  });
  const activeFreezes = disputes.some(d => d.status === 'reviewing');

  // Create wallet + welcome bonus on first visit
  const createWallet = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const expiresAt = addDays(now, WELCOME_BONUS_DAYS).toISOString();
      const w = await base44.entities.Wallet.create({
        user_id: user.id,
        pilot_id: myPilot?.id,
        gw_disponibili: 0,
        gw_bonus: WELCOME_BONUS_GW,
        gw_bloccati: 0,
        bonus_expires_at: expiresAt,
        last_updated: now.toISOString(),
      });
      await base44.entities.WalletTransaction.create({
        wallet_id: w.id,
        user_id: user.id,
        type: 'welcome_bonus',
        amount: WELCOME_BONUS_GW,
        causale: 'Bonus di benvenuto S.R.F. (scadenza 60 giorni)',
        balance_disponibili_after: 0,
        balance_bonus_after: WELCOME_BONUS_GW,
        balance_bloccati_after: 0,
        reference_type: 'system',
        status: 'completed',
      });
      // Update pilot wallet_id
      if (myPilot?.id) {
        await base44.entities.Pilot.update(myPilot.id, { wallet_id: w.id });
      }
      return w;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      toast.success(`Wallet creato! Ricevuti ${formatGW(WELCOME_BONUS_GW)} di benvenuto.`);
    },
  });

  const kyc_status = myPilot?.kyc_status || 'not_started';
  const { allowed: canW, reasons: blockReasons } = canWithdraw(wallet, kyc_status, activeFreezes);

  if (!myPilot) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <Coins className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-foreground font-semibold">Crea prima il tuo profilo pilota</p>
        <p className="text-sm text-muted-foreground mt-1">Vai al Profilo per completare la registrazione</p>
        <Link to="/profile"><Button className="mt-4 bg-primary text-primary-foreground">Vai al Profilo</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <Coins className="w-7 h-7 text-primary" /> Wallet GW
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Golden Wheels — Valuta ufficiale S.R.F.</p>
        </div>
        {/* KYC status badge */}
        <Badge variant="outline" className={getKycStatusColor(kyc_status)}>
          <ShieldCheck className="w-3 h-3 mr-1" />
          KYC: {getKycStatusLabel(kyc_status)}
        </Badge>
      </div>

      {/* No wallet yet */}
      {!wallet ? (
        <div className="racing-card bg-card p-8 text-center space-y-4">
          <Coins className="w-12 h-12 text-primary/40 mx-auto" />
          <div>
            <p className="font-heading text-lg text-foreground">Attiva il tuo Wallet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ricevi subito <span className="text-accent font-bold">750.000 GW</span> di benvenuto (≈ €18,75)
            </p>
          </div>
          <Button onClick={() => createWallet.mutate()} disabled={createWallet.isPending} className="bg-primary text-primary-foreground">
            {createWallet.isPending ? 'Attivazione...' : 'Attiva Wallet — Ricevi Bonus'}
 