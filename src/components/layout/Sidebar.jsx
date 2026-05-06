import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Flag, Trophy, Users, Building2, User, AlertTriangle, Shield,
  ChevronLeft, ChevronRight, Zap, MessageSquare, Calendar, Tv, Wifi,
  Settings, Star, Megaphone, Gavel, Vote, Coins, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Competizioni',
    items: [
      { path: '/', label: 'Home', icon: Home },
      { path: '/races', label: 'Gare', icon: Flag },
      { path: '/calendar', label: 'Calendario', icon: Calendar },
      { path: '/standings', label: 'Classifica', icon: Trophy },
      { path: '/world-ranking', label: 'World Ranking', icon: Trophy },
      { path: '/career', label: 'Carriera', icon: Star },
    ],
  },
  {
    label: 'Community',
    items: [
      { path: '/pilots', label: 'Piloti', icon: Users },
      { path: '/teams', label: 'Scuderie', icon: Building2 },
      { path: '/messages', label: 'Messaggi', icon: MessageSquare },
      { path: '/announcements', label: 'Annunci', icon: Megaphone },
    ],
  },
  {
    label: 'Piattaforma',
    items: [
      { path: '/governance', label: 'Governance', icon: Vote },
      { path: '/disputes', label: 'Dispute', icon: Gavel },
      { path: '/streamwall', label: 'Streamwall', icon: Tv },
      { path: '/connection-test', label: 'Test Rete', icon: Wifi },
      { path: '/setup', label: 'Setup', icon: Settings },
    ],
  },
  {
    label: 'Wallet & KYC',
    items: [
      { path: '/wallet', label: 'Wallet GW', icon: Coins },
      { path: '/kyc', label: 'Verifica KYC', icon: ShieldCheck },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/profile', label: 'Profilo', icon: User },
      { path: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
      { path: '/admin/escrow', label: 'Escrow Admin', icon: Shield, adminOnly: true },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-all duration-300",
      collapsed ? "w-[72px]" : "w-[240px]"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-heading text-sm text-foreground leading-tight tracking-tight">
                SIM is REAL
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Full Paddock
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground px-3 mb-1">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}