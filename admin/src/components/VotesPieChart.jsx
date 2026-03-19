import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { partyBar, partyColor } from '../utils/partyColors.js';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lift px-4 py-3">
      <p className="font-mono font-bold text-ink-900 text-sm">{d.name}</p>
      <p className="font-mono text-sm mt-0.5" style={{ color: partyBar(d.name) }}>
        {d.value.toLocaleString()} votes · {d.payload.pct}%
      </p>
    </div>
  );
};

const renderLegend = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-3 mt-4">
    {payload.map((entry) => (
      <div key={entry.value} className="flex items-center gap-1.5 text-xs">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
        <span className="font-mono font-bold text-ink-700">{entry.value}</span>
      </div>
    ))}
  </div>
);

export default function VotesPieChart({ parties = [], grandTotal = 0 }) {
  const data = parties.map((p) => ({
    name: p.party,
    value: p.totalVotes,
    pct: grandTotal > 0 ? ((p.totalVotes / grandTotal) * 100).toFixed(1) : '0.0',
  }));

  if (!data.length) return null;

  return (
    <div className="card">
      <h2 className="font-display font-bold text-ink-900 mb-2">Vote share</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={64}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={700}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={partyBar(entry.name)} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}