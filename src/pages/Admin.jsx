import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Shield, Flag, Users, AlertTriangle, Trophy, Lock, Gavel } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminRaces from '@/components/admin/AdminRaces';
import AdminResults from '@/components/admin/AdminResults';
import AdminPilots from '@/components/admin/AdminPilots';
import AdminComplaints from '@/components/admin/AdminComplaints';

export default function Admin() {
  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  // Only admin role can access
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Lock className="w-14 h-14 text-muted-foreground" />
        <h2 className="font-heading text-xl text-foreground">Accesso Negato</h2>
        <p className="text-muted-foreground text-sm">Questa area è riservata agli amministratori.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Gestione interna piattaforma SIM is REAL</p>
        </div>
      </div>

      <Tabs defaultValue="races">
        <TabsList className="bg-card border border-border flex-wrap h-auto">
          <TabsTrigger value="races" className="flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5" /> Gestione Gare
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> Risultati
          </TabsTrigger>
          <TabsTrigger value="pilots" className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Piloti
          </TabsTrigger>
          <TabsTrigger value="complaints" className="flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5" /> Centro Ricorsi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="races" className="mt-5">
          <AdminRaces />
        </TabsContent>
        <TabsContent value="results" className="mt-5">
          <AdminResults />
        </TabsContent>
        <TabsContent value="pilots" className="mt-5">
          <AdminPilots />
        </TabsContent>
        <TabsContent value="complaints" className="mt-5">
          <AdminComplaints />
        </TabsContent>
      </Tabs>
    </div>
  );
}