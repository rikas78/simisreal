import React, { useState, useEffect } from 'react';
import { Flag, Clock, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

function getTimeLeft(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="racing-card-sm bg-background/50 px-3 py-2 min-w-[52px] text-center">
        <span className="font-heading text-xl text-primary">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export default function NextRaceWidget({ race }) {
  const [timeLeft, setTimeLeft] = useState(race ? getTimeLeft(race.date) : null);

  useEffect(() => {
    if (!race) return;
    const interval = setInterval(() => setTimeLeft(getTimeLeft(race.date)), 1000);
    return () => clearInterval(interval);
  }, [race]);

  if (!race) {
    return (
      <div className="racing-card bg-card p-6 glow-primary">
        <div className="flex items-center gap-2 mb-4">
          <Flag className="w-5 h-5 text-primary" />
          <h3 className="font-heading text-sm uppercase tracking-wider text-foreground">Prossima Gara</h3>
        </div>
        <p className="text-muted-foreground text-sm">Nessuna gara in programma</p>
      </div>
    );
  }

  return (
    <div className="racing-card bg-card p-6 glow-primary relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-primary" />
            <h3 className="font-heading text-sm uppercase tracking-wider text-foreground">Prossima Gara</h3>
          </div>
          <span className="text-xs text-accent font-semibold tracking-wide">
            €{race.prize_pool || 0} MONTEPREMI
          </span>
        </div>

        <h2 className="font-heading text-lg text-foreground mb-1">{race.title}</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            {race.simulator}
          </span>
          <span>{race.track}</span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {race.current_participants || 0}/{race.max_participants || '∞'}
          </span>
        </div>

        {timeLeft && (
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-primary" />
            <div className="flex gap-2">
              <CountdownUnit value={timeLeft.days} label="Giorni" />
              <CountdownUnit value={timeLeft.hours} label="Ore" />
              <CountdownUnit value={timeLeft.minutes} label="Min" />
              <CountdownUnit value={timeLeft.seconds} label="Sec" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}