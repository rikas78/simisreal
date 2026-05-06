import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Flag, Trophy, Users, Building2, User, Shield,
  Menu, X, Zap, MessageSquare, Calendar, Tv, Wifi,
  Settings, Star, Megaphone, Gavel, Vote, Coins, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  { label: 'Competizioni', items: [
    { path: '/', label: 'Home', icon: Home },
    { path: '/races', label: 'Gare', icon: Flag },
    { path: '/calendar', label: 'Calendario', icon: Calendar },
    { path: '/standings', label: 'Classifica', icon: Trophy },
    { path: '/career', label: 'Carriera', icon: Star },
  ]},
  { label: 'Community', items: [
    { path: '/pilots', label: 'Piloti', icon: Users },
    { path: '/teams', label: 'Scuderie', icon: Building2 },
    { path: '/messages', label: 'Messaggi', icon: MessageSquare },
    { path: '/announcements', label: 'Annunci', icon: Megaphone },
  ]},
  { label: 'Piattaforma', items: [
    { path: '/governance', label: 'Governance', icon: Vote },
    { path: '/disputes', label: 'Dispute', icon: Gavel },
    { path: '/streamwall', label: 'Streamwall', icon: Tv },
    { path: '/connection-test', label: 'Test Rete', icon: Wifi },
    { path: '/setup', label: 'Setup', icon: Settings },
  ]},
  { label: 'Wallet & KYC', items: [
    { path: '/wallet', label: 'Wallet GW', icon: Coins },
    { path: '/kyc', label: 'Verifica KYC', icon: ShieldCheck },
  ]},
  { label: 'Account', items: [
    { path: '/profile', label: 'Profilo', icon: User },
    { path: '/admin', label: 'Admin', icon: Shield },
    { path: '/admin/escrow', label: 'Escrow Admin', icon: Shield },
  ]},
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-border z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-heading text-sm text-foreground">SIM is REAL</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="text-foreground p-1">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Overlay menu */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm pt-14 overflow-y-auto">
          <nav className="p-4 space-y-4">
            {navGroups.map(group => (
              <div key={group.label}>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground px-4 mb-1">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}