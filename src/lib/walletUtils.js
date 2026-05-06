// Golden Wheels utility functions

export const GW_TO_EUR_RATE = 100000; // 100.000 GW = €2.50
export const EUR_TO_GW_RATE = 40000;  // 1 EUR = 40.000 GW
export const WITHDRAWAL_FEE = 0.10;   // 10%
export const MIN_WITHDRAWAL_EUR = 10; // €10 min
export const MIN_WITHDRAWAL_GW = MIN_WITHDRAWAL_EUR * EUR_TO_GW_RATE; // 400.000 GW
export const WELCOME_BONUS_GW = 750000;
export const WELCOME_BONUS_DAYS = 60;
export const SRF_COMMISSION = 0.15; // 15% su pool gara

export function gwToEur(gw) {
  return (gw / GW_TO_EUR_RATE) * 2.5;
}

export function eurToGw(eur) {
  return Math.floor(eur * EUR_TO_GW_RATE);
}

export function formatGW(gw) {
  if (!gw && gw !== 0) return '0 GW';
  return new Intl.NumberFormat('it-IT').format(gw) + ' GW';
}

export function formatEur(eur) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(eur || 0);
}

export function calcWithdrawal(gwGross) {
  const fee = Math.floor(gwGross * WITHDRAWAL_FEE);
  const net = gwGross - fee;
  const eurNet = gwToEur(net);
  return { fee, net, eurNet };
}

export function canWithdraw(wallet, kyc_status, hasActiveFreezes) {
  const reasons = [];
  if (kyc_status !== 'approved') reasons.push('KYC non completato');
  if ((wallet?.gw_disponibili || 0) < MIN_WITHDRAWAL_GW) reasons.push(`Saldo minimo richiesto: ${formatGW(MIN_WITHDRAWAL_GW)} (€${MIN_WITHDRAWAL_EUR})`);
  if (hasActiveFreezes) reasons.push('Premi congelati per contestazione attiva');
  return { allowed: reasons.length === 0, reasons };
}

export function canJoinPaidRace(kyc_status) {
  return kyc_status === 'approved';
}

export function getKycStatusLabel(status) {
  const map = {
    not_started: 'Non avviato',
    pending: 'In revisione',
    approved: 'Verificato',
    rejected: 'Rifiutato',
  };
  return map[status] || status;
}

export function getKycStatusColor(status) {
  const map = {
    not_started: 'text-muted-foreground bg-muted/30 border-border',
    pending: 'text-accent bg-accent/10 border-accent/30',
    approved: 'text-green-400 bg-green-400/10 border-green-400/30',
    rejected: 'text-destructive bg-destructive/10 border-destructive/30',
  };
  return map[status] || '';
}

export const TX_TYPE_LABELS = {
  deposit: 'Ricarica',
  withdrawal: 'Prelievo',
  prize: 'Premio Gara',
  bonus_credit: 'Credito Gara',
  freeze: 'Blocco (Contestazione)',
  unfreeze: 'Sblocco',
  refund_credit: 'Rimborso Credito',
  fee: 'Commissione',
  welcome_bonus: 'Bonus Benvenuto',
};

export const TX_TYPE_COLORS = {
  deposit: 'text-green-400',
  withdrawal: 'text-red-400',
  prize: 'text-primary',
  bonus_credit: 'text-accent',
  freeze: 'text-orange-400',
  unfreeze: 'text-blue-400',
  refund_credit: 'text-cyan-400',
  fee: 'text-muted-foreground',
  welcome_bonus: 'text-purple-400',
};