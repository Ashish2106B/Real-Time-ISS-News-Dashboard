import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Gauge, MapPin } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import { useAppStore } from '../../store/appStore';
import { useAstronautsData } from '../../hooks/useAstronautsData';

// ── Animated counter ──────────────────────────────────────────
const StatCard = memo(({ icon: Icon, label, value, unit, color }: {
  icon: any;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="flex items-center space-x-4 p-4 glass-card"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-[var(--text-primary)] font-mono">
        {value}{unit && <span className="text-sm text-[var(--text-muted)] ml-1">{unit}</span>}
      </p>
    </div>
  </motion.div>
));

// ── Custom tooltip ────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 bg-[var(--card-bg-solid)] border border-[var(--border-color)] rounded-lg shadow-xl">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="text-sm font-bold text-cyan-500">{Math.round(payload[0].value).toLocaleString()} km/h</p>
    </div>
  );
};

// ── News distribution data ────────────────────────────────────
const NEWS_COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export const RealtimeCharts = memo(() => {
  const trajectory = useAppStore((s) => s.trajectory) || [];
  const articles = useAppStore((s) => s.articles) || [];
  const { astronautCount } = useAstronautsData();

  const speedHistory = useMemo(() => 
    trajectory.map(p => ({ speed: p.speed, timestamp: p.timestamp })),
    [trajectory]
  );

  const avgSpeed = useMemo(() => {
    const valid = trajectory.filter(p => p.speed > 0);
    return valid.length ? valid.reduce((s, p) => s + p.speed, 0) / valid.length : 0;
  }, [trajectory]);

  const maxSpeed = useMemo(() => 
    trajectory.reduce((max, p) => Math.max(max, p.speed), 0),
    [trajectory]
  );

  const chartData = useMemo(() =>
    (speedHistory || [])
      .filter((p) => p && p.speed > 0)
      .slice(-30)
      .map((p) => ({
        time: p.timestamp ? new Date(p.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        speed: Math.round(p.speed || 0),
      })),
    [speedHistory]
  );

  const miniTrendData = useMemo(() =>
    chartData.slice(-10).map((d, i) => ({ ...d, index: i })),
    [chartData]
  );

  const newsDist = useMemo(() => {
    const counts: Record<string, number> = {};
    (articles || []).forEach((a) => {
      const site = a?.news_site || 'Unknown';
      counts[site] = (counts[site] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [articles]);

  const fmt = (n: number) => n > 0 ? Math.round(n).toLocaleString() : '—';

  return (
    <div className="space-y-6">
      {/* ── Bottom stat cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Gauge} label="Avg Speed" value={fmt(avgSpeed)} unit="km/h" color="bg-gradient-to-br from-cyan-500 to-blue-600" />
        <StatCard icon={TrendingUp} label="Max Speed" value={fmt(maxSpeed)} unit="km/h" color="bg-gradient-to-br from-purple-500 to-pink-600" />
        <StatCard icon={MapPin} label="Positions" value={trajectory.length} color="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard icon={Activity} label="In Space" value={astronautCount || '—'} color="bg-gradient-to-br from-amber-500 to-orange-600" />
      </div>

      {/* ── ISS Speed Line Chart ──────────────────────────── */}
      <div className="p-5 glass-card">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-cyan-500" />
          ISS Orbital Velocity — Last 30 Points
        </h3>
        <div className="h-56">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={224}>
              <LineChart data={chartData}>
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickMargin={8} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotoneX"
                  dataKey="speed"
                  stroke="var(--accent-cyan)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: 'var(--accent-cyan)', strokeWidth: 0 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
              Collecting data — needs 2+ trajectory points
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── News Distribution Donut ──────────────────────── */}
        <div className="p-5 glass-card">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
            News Source Distribution
          </h3>
          <div className="h-48">
            {newsDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                <PieChart>
                  <Pie data={newsDist} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                    {newsDist.map((_, i) => (
                      <Cell key={i} fill={NEWS_COLORS[i % NEWS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--card-bg-solid)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-[var(--text-muted)]">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">Loading news data…</div>
            )}
          </div>
        </div>

        {/* ── Mini Speed Trend (Area) ──────────────────────── */}
        <div className="p-5 glass-card">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 flex items-center">
            <Gauge className="w-4 h-4 mr-2 text-emerald-400" />
            Speed Trend (Last 10 Points)
          </h3>
          <div className="h-48">
            {miniTrendData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                <AreaChart data={miniTrendData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="speed"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#areaGrad)"
                    dot={false}
                    isAnimationActive
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
                Collecting trend data…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
