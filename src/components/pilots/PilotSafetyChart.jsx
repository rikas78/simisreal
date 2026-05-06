import React, { useMemo } from 'react';
import { Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

// Safety rating mapped to numeric scale for the chart
const SR_SCALE = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
const SR_LABEL = { 7: 'S', 6: 'A', 5: 'B', 4: 'C', 3: 'D', 2: 'E', 1: 'F' };

const srColor = (val) => {
  if (val >= 6) return '#00cc88'; // S/A
  if (val >= 5) return '#60a5fa'; // B
  if (val >= 4) return '#fbbf24'; // C
  if (val >= 3) return '#fb923c'; // D
  return '#ef4444';              // E/F
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-heading text-sm" style={{ color: srColor(val) }}>SR: {SR_LABEL[val]}</p>
    </div>
  );
}

export default function PilotSafetyChart({ pilot, results, races }) {
  const data = useMemo(() => {
    // Build a timeline of sportsmanship points per race to simulate SR evolution
    const sorted = [...results]
      .map(r => ({ r, race: races.find(rc => rc.id === r.race_id) }))
      .filter(({ race }) => race?.date)
      .sort((a, b) => new Date(a.race.date) - new Date(b.race.date));

    if (!sorted.length) return [];

    // Simulate safety rating change based on sportsmanship_points
    let currentSR = SR_SCALE['S'];
    return sorted.map(({ r, race }) => {
      const sp = r.sportsmanship_points ?? 10;
      if (sp >= 10) currentSR = Math.min(7, currentSR + 0.5);
      else if (sp >= 7) currentSR = Math.max(1, currentSR);
      else if (sp >= 4) currentSR = Math.max(1, currentSR - 0.5);
      else currentSR = Math.max(1, currentSR - 1);
      const snapped = Math.round(currentSR);
      return {
        label: format(parseISO(race.date), 'd MMM', { locale: it }),
        value: snapped,
        race: r.race_title || race.title,
      };
    });
  }, [results, races]);

  const currentSRNum = SR_SCALE[pilot.safety_rating || 'S'];

  return (
    <div className="racing-card bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Shield className="w-4 h-4" />Andamento Safety Rating
        </h2>
        <span className="font-heading text-lg" style={{ color: srColor(currentSRNum) }}>
          SR {pilot.safety_rating || 'S'}
        </span>
      </div>

      {data.length < 2 ? (
        <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
          Dati insufficienti (servono almeno 2 gare)
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 20% 20%)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(220 10% 55%)' }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[1, 7]} ticks={[1,2,3,4,5,6,7]}
              tickFormatter={v => SR_LABEL[v] || ''}
              tick={{ fontSize: 10, fill: 'hsl(220 10% 55%)' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone" dataKey="value"
              stroke="#00cc88" strokeWidth={2}
              dot={{ r: 4, fill: '#00cc88', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="flex gap-3 mt-3 flex-wrap">
        {Object.entries(SR_LABEL).sort((a,b) => b[0]-a[0]).map(([num, label]) => (
          <span key={label} className="text-[10px] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: srColor(+num) }} />
            <span className="text-muted-foreground">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}