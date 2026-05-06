import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Flag, X, Clock, Zap } from 'lucide-react';
import { differenceInMinutes, differenceInSeconds, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const ALERT_WINDOW_MINUTES = 10; // show alert when <= 10 min to start

export default function RaceCountdownAlert() {
  const [dismissed, setDismissed] = useState({}); // { raceId: true }
  const [ticks, setTicks] = useState(0);
  const notifiedRef = useRef({}); // track which races we've already browser-notified

  const { data: races = [] } = useQuery({
    queryKey: ['races'],
    queryFn: () => base44.entities.Race.list('-date', 50),
    refetchInterval: 30_000,
  });

  // Tick every second to keep countdown live
  useEffect(() => {
    const iv = setInterval(() => setTicks(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // Request browser notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Find upcoming races within the alert window
  const alertRaces = races.filter(r => {
    if (r.status !== 'upcoming') return false;
    if (dismissed[r.id]) return false;
    const minsLeft = differenceInMinutes(parseISO(r.date), new Date());
    return minsLeft >= 0 && minsLeft <= ALERT_WINDOW_MINUTES;
  });

  // Fire browser notification (once per race)
  useEffect(() => {
    alertRaces.forEach(r => {
      if (!notifiedRef.current[r.id] && 'Notification' in window && Notification.permission === 'granted') {
        notifiedRef.current[r.id] = true;
        new Notification('🏁 Gara tra 10 minuti!', {
          body: r.title,
          icon: '/favicon.ico',
        });
      }
    });
  }, [alertRaces.length]);

  if (alertRaces.length === 0) return null;

  return (
    <div className="fixed top-16 lg:top-4 right-4 z-[200] flex flex-col gap-3 max-w-sm w-full">
      {alertRaces.map(race => {
        const secsLeft = differenceInSeconds(parseISO(race.date), new Date());
        const mins = Math.floor(secsLeft / 60);
        const secs = secsLeft % 60;
        const isUrgent = mins < 3;

        return (
          <div
            key={race.id}
            className={cn(
              "relative overflow-hidden border-l-4 shadow-2xl animate-in slide-in-from-right-8 duration-500",
              isUrgent
                ? "bg-destructive border-destructive text-white"
                : "bg-card border-primary text-foreground"
            )}
          >
            {/* Progress bar */}
            <div
              className={cn("absolute bottom-0 left-0 h-0.5 transition-all duration-1000", isUrgent ? "bg-white/40" : "bg-primary")}
              style={{ width: `${((ALERT_WINDOW_MINUTES * 60 - secsLeft) / (ALERT_WINDOW_MINUTES * 60)) * 100}%` }}
            />

            <div className="p-4 pr-10">
              <div className="flex items-center gap-2 mb-1">
                <div className={cn("w-2 h-2 rounded-full live-pulse", isUrgent ? "bg-white" : "bg-primary")} />
                <span className={cn("text-[9px] font-black uppercase tracking-[0.4em]", isUrgent ? "text-white/70" : "text-destructive")}>
                  {isUrgent ? "⚠ PARTENZA IMMINENTE" : "🏁 GARA TRA POCO"}
                </span>
              </div>

              <p className={cn("font-heading text-base font-black uppercase italic leading-tight tracking-tight mb-2", isUrgent ? "text-white" : "text-foreground")}>
                {race.title}
              </p>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Clock className={cn("w-3.5 h-3.5", isUrgent ? "text-white/70" : "text-muted-foreground")} />
                  <span className={cn("font-heading text-lg font-black tabular-nums", isUrgent ? "text-white" : "text-primary")}>
                    {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                  </span>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest", isUrgent ? "text-white/50" : "text-muted-foreground")}>
                    al via
                  </span>
                </div>

                <Link
                  to={`/races/${race.id}`}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-black uppercase italic tracking-widest transition-all",
                    isUrgent
                      ? "bg-white text-destructive hover:bg-white/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  VAI →
                </Link>
              </div>

              {race.simulator && (
                <div className={cn("flex items-center gap-1.5 mt-2", isUrgent ? "text-white/50" : "text-muted-foreground")}>
                  <Zap className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">{race.simulator} · {race.track || 'TBD'}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setDismissed(d => ({ ...d, [race.id]: true }))}
              className={cn("absolute top-3 right-3 p-0.5 rounded transition-colors", isUrgent ? "text-white/50 hover:text-white" : "text-muted-foreground hover:text-foreground")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}