import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TX_TYPE_LABELS, TX_TYPE_COLORS, formatGW, gwToEur, formatEur } from '@/lib/walletUtils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function WalletMovimenti() {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: wallets = [] } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: () => base44.entities.Wallet.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });
  const wallet = wallets[0];

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['wallet-tx-all', wallet?.id],
    queryFn: () => base44.entities.WalletTransaction.filter({ wallet_id: wallet.id }, '-created_date', 200),
    enabled: !!wallet?.id,
  });

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
      return true;
    });
  }, [transactions, filterType, filterStatus]);

  const handleExportCSV = () => {
    const header = 'Data,Tipo,Causale,Importo GW,Importo EUR,Stato\n';
    const rows = filtered.map(tx =>
      `"${tx.created_date ? format(new Date(tx.created_date), 'd/MM/yyyy HH:mm') : ''}","${TX_TYPE_LABELS[tx.type] || tx.type}","${tx.causale}","${tx.amount}","${gwToEur(tx.amount).toFixed(4)}","${tx.status}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'movimenti_wallet_srf.csv'; a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/wallet"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="font-heading text-2xl text-foreground">Storico Movimenti</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} transazioni</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" /> Esporta CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="bg-card border-border w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            {Object.entries(TX_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-card border-border w-40"><SelectValue placeholder="Stato" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="completed">Completato</SelectItem>
            <SelectItem value="pending">In attesa</SelectItem>
            <SelectItem value="failed">Fallito</SelectItem>
            <SelectItem value="reversed">Stornato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="racing-card bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Data', 'Tipo', 'Causale', 'Importo', 'Saldo Disp. After', 'Stato'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Caricamento...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nessun movimento</td></tr>
              ) : filtered.map(tx => (
                <tr key={tx.id} className="border-b border-border/40 hover:bg-secondary/10 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {tx.created_date ? format(new Date(tx.created_date), 'd MMM yy HH:mm', { locale: it }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-semibold", TX_TYPE_COLORS[tx.type])}>
                      {TX_TYPE_LABELS[tx.type] || tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{tx.causale}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className={cn("font-heading font-black text-sm", tx.amount > 0 ? 'text-green-400' : 'text-red-400')}>
                      {tx.amount > 0 ? '+' : ''}{formatGW(tx.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatEur(gwToEur(Math.abs(tx.amount)))}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-primary font-mono">{formatGW(tx.balance_disponibili_after || 0)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-[9px]",
                      tx.status === 'completed' ? 'text-green-400 border-green-400/30' :
                      tx.status === 'pending' ? 'text-accent border-accent/30' :
                      tx.status === 'failed' ? 'text-destructive border-destructive/30' : 'text-muted-foreground'
                    )}>
                      {tx.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}