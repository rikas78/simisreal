import React from 'react';
import { Activity, UserPlus, Trophy, AlertTriangle, Flag, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const typeConfig = {
  registration: { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10' },
  result: { icon: Trophy, color: 'text-accent', bg: 'bg-accent/10' },
  complaint_resolved: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  new_race: { icon: Flag, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  team_created: { icon: Building2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
};

export default function ActivityFeed({ activities }) {
  return (
    <div className="racing-card bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-heading text-sm uppercase tracking-wider text-foreground">Attività Recenti</h3>
      </div>

      {activities.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nessuna attività recente</p>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 8).map((activity) => {
            const config = typeConfig[activity.type] || typeConfig.registration;
            const Icon = config.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.bg)}>
                  <Icon className={cn("w-4 h-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true, locale: it })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}