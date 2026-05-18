import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider } from "@/lib/AuthContext";
import PageNotFound from "@/lib/PageNotFound";

import Home from "@/pages/Home";
import Races from "@/pages/Races";
import RaceDetail from "@/pages/RaceDetail";
import Pilots from "@/pages/Pilots";
import PilotProfile from "@/pages/PilotProfile";
import Teams from "@/pages/Teams";
import Standings from "@/pages/Standings";
import Profile from "@/pages/Profile";
import Wallet from "@/pages/Wallet";
import WalletMovimenti from "@/pages/WalletMovimenti";
import WalletRicarica from "@/pages/WalletRicarica";
import WalletPrelievo from "@/pages/WalletPrelievo";
import KYC from "@/pages/KYC";
import Complaints from "@/pages/Complaints";
import DisputeCenter from "@/pages/DisputeCenter";
import Governance from "@/pages/Governance";
import Messages from "@/pages/Messages";
import Announcements from "@/pages/Announcements";
import Calendar from "@/pages/Calendar";
import Career from "@/pages/Career";
import WorldRanking from "@/pages/WorldRanking";
import Streamwall from "@/pages/Streamwall";
import SetupMacchine from "@/pages/SetupMacchine";
import Admin from "@/pages/Admin";
import AdminEscrow from "@/pages/AdminEscrow";
import ConnectionTest from "@/pages/ConnectionTest";

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/races" element={<Races />} />
            <Route path="/races/:id" element={<RaceDetail />} />
            <Route path="/pilots" element={<Pilots />} />
            <Route path="/pilots/:id" element={<PilotProfile />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/wallet/movimenti" element={<WalletMovimenti />} />
            <Route path="/wallet/ricarica" element={<WalletRicarica />} />
            <Route path="/wallet/prelievo" element={<WalletPrelievo />} />
            <Route path="/kyc" element={<KYC />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/dispute-center" element={<DisputeCenter />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/career" element={<Career />} />
            <Route path="/world-ranking" element={<WorldRanking />} />
            <Route path="/streamwall" element={<Streamwall />} />
            <Route path="/setup-macchine" element={<SetupMacchine />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-escrow" element={<AdminEscrow />} />
            <Route path="/connection-test" element={<ConnectionTest />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>

          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}