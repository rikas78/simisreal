import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Upload, CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getKycStatusLabel, getKycStatusColor } from '@/lib/walletUtils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const DOC_TYPES = [
  { key: 'id_front', label: 'Documento d\'identità — Fronte', desc: 'Carta d\'identità o passaporto (fronte)', required: true },
  { key: 'id_back', label: 'Documento d\'identità — Retro', desc: 'Carta d\'identità (retro)', required: true },
  { key: 'selfie', label: 'Selfie con documento', desc: 'Tieni il documento accanto al viso', required: true },
  { key: 'iban_proof', label: 'Prova IBAN', desc: 'Screenshot estratto conto o carta intestata (sandbox: qualsiasi immagine)', required: false },
];

const statusConfig = {
  pending: { icon: Clock, color: 'text-accent', label: 'In revisione' },
  approved: { icon: CheckCircle, color: 'text-green-400', label: 'Approvato' },
  rejected: { icon: XCircle, color: 'text-destructive', label: 'Rifiutato' },
};

export default function KYC() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState({});

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: pilots = [] } = useQuery({ queryKey: ['pilots'], queryFn: () => base44.entities.Pilot.list() });
  const myPilot = pilots.find(p => p.created_by === user?.email);

  const { data: kycDocs = [] } = useQuery({
    queryKey: ['kyc-docs', user?.id],
    queryFn: () => base44.entities.KYCDocument.filter({ user_id: user.id }),
    enabled: !!user?.id,
  });

  const uploadDoc = useMutation({
    mutationFn: async ({ docType, file }) => {
      setUploading(u => ({ ...u, [docType]: true }));
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const existing = kycDocs.find(d => d.doc_type === docType);
      if (existing) {
        return base44.entities.KYCDocument.update(existing.id, { file_url, status: 'pending', rejected_reason: null });
      }
      return base44.entities.KYCDocument.create({
        user_id: user.id,
        pilot_id: myPilot?.id,
        doc_type: docType,
        file_url,
        status: 'pending',
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['kyc-docs'] });
      setUploading(u => ({ ...u, [vars.docType]: false }));
      toast.success('Documento caricato — in attesa di revisione');
      // If all required docs are uploaded, set pilot kyc_status to pending
      checkAndUpdatePilotKyc();
    },
    onError: (_, vars) => {
      setUploading(u => ({ ...u, [vars.docType]: false }));
    }
  });

  const checkAndUpdatePilotKyc = async () => {
    const required = DOC_TYPES.filter(d => d.required).map(d => d.key);
    const uploaded = [...kycDocs.map(d => d.doc_type)];
    const allUploaded = required.every(r => uploaded.includes(r));
    if (allUploaded && myPilot && myPilot.kyc_status === 'not_started') {
      await base44.entities.Pilot.update(myPilot.id, { kyc_status: 'pending' });
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
    }
  };

  const handleFileChange = (docType, e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadDoc.mutate({ docType, file });
  };

  const kyc_status = myPilot?.kyc_status || 'not_started';
  const requiredUploaded = DOC_TYPES.filter(d => d.required).every(d => kycDocs.find(k => k.doc_type === d.key));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-primary" /> Verifica KYC
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Verifica obbligatoria per prelievi e gare con montepremi reale
        </p>
      </div>

      {/* Status overview */}
      <div className="racing-card bg-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Stato verifica identità</p>
            <p className="text-xs text-muted-foreground mt-0.5">Modalità SANDBOX — nessun dato reale elaborato</p>
          </div>
          <Badge variant="outline" className={cn("text-sm px-3 py-1", getKycStatusColor(kyc_status))}>
            {getKycStatusLabel(kyc_status)}
          </Badge>
        </div>

        {kyc_status === 'approved' && (
          <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>KYC completato — puoi partecipare a gare con premio e richiedere prelievi</span>
          </div>
        )}
        {kyc_status === 'rejected' && (
          <div className="mt-4 flex items-center gap-2 text-destructive text-sm">
            <XCircle className="w-4 h-4" />
            <span>Verifica rifiutata — ricarica i documenti corretti</span>
          </div>
        )}
        {kyc_status === 'pending' && (
          <div className="mt-4 flex items-center gap-2 text-accent text-sm">
            <Clock className="w-4 h-4" />
            <span>In revisione (tempo medio: 24–72 ore lavorative)</span>
          </div>
        )}
        {kyc_status === 'not_started' && (
          <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Carica tutti i documenti obbligatori per avviare la verifica</span>
          </div>
        )}
      </div>

      {/* Document upload cards */}
      <div className="space-y-3">
        {DOC_TYPES.map(doc => {
          const uploaded = kycDocs.find(k => k.doc_type === doc.key);
          const sc = uploaded ? statusConfig[uploaded.status] : null;
          const Icon = sc?.icon || FileText;
          return (
            <div key={doc.key} className={cn("racing-card-sm bg-card p-4 border",
              uploaded?.status === 'approved' ? 'border-green-400/20' :
              uploaded?.status === 'rejected' ? 'border-destructive/20' :
              uploaded?.status === 'pending' ? 'border-accent/20' : 'border-border'
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className={cn("w-4 h-4", sc?.color || 'text-muted-foreground')} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{doc.label}</p>
                      {doc.required && <span className="text-[9px] text-destructive font-bold uppercase">Obbligatorio</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{doc.desc}</p>
                    {uploaded?.rejected_reason && (
                      <p className="text-xs text-destructive mt-1">Motivo rifiuto: {uploaded.rejected_reason}</p>
                    )}
                    {uploaded?.approved_at && (
                      <p className="text-xs text-green-400 mt-1">
                        Approvato: {format(new Date(uploaded.approved_at), 'd MMM yyyy', { locale: it })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {uploaded?.status === 'approved' ? (
                    <Badge variant="outline" className="text-green-400 border-green-400/30 text-[10px]">✓ Approvato</Badge>
                  ) : (
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*,application/pdf" className="hidden"
                        onChange={(e) => handleFileChange(doc.key, e)}
                        disabled={uploading[doc.key]} />
                      <Button size="sm" variant="outline" className="h-7 text-xs pointer-events-none" disabled={uploading[doc.key]}>
                        <Upload className="w-3 h-3 mr-1" />
                        {uploading[doc.key] ? 'Caricamento...' : uploaded ? 'Ricarica' : 'Carica'}
                      </Button>
                    </label>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {requiredUploaded && kyc_status === 'not_started' && (
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 text-sm text-primary">
          Tutti i documenti obbligatori caricati — la verifica partirà automaticamente. Tempo stimato: 24–72 ore.
        </div>
      )}
    </div>
  );
}