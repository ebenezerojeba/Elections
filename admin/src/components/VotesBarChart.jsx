import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { partyBar } from '../utils/partyColors.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lift px-4 py-3">
      <p className="font-mono font-bold text-ink-900 text-sm">{label}</p>
      <p className="text-vote-600 font-mono text-sm mt-0.5">
        {payload[0].value.toLocaleString()} votes
      </p>
    </div>
  );
};

export default function VotesBarChart({ parties = [] }) {
  const data = [...parties]
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .map((p) => ({ name: p.party, votes: p.totalVotes }));

  if (!data.length) return null;

  return (
    <div className="card">
      <h2 className="font-display font-bold text-ink-900 mb-6">Vote distribution</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barCategoryGap="30%" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 700, fill: '#677489' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: '#9aa5b4' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8f9fb' }} />
          <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={partyBar(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}