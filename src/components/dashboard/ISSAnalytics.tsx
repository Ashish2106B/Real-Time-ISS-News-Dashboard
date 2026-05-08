import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Satellite, Activity, MapPin, Clock, Zap } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useISSData } from '../../hooks/useISSData';
import { useAppStore, selectAvgSpeed, selectMaxSpeed } from '../../store/appStore';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

const StatCard = memo(({ label, value, unit, icon: Icon, accent }: {
  label: string;
  value: string;
  unit?: string;
  icon: React.ElementType;
  accent: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative p-5 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden"
  >
    <div className="absolute top-3 right-3 opacity-[0.07]">
      <Icon className="w-16 h-16" />
    </div>
    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-2xl font-bold font-mono ${accent}`}>
      {value}
      {unit && <span className="text-sm text-slate-500 ml-1">{unit}</span>}
    </p>
  </motion.div>
));

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 bg-slate-950/95 border border-slate-700/50 rounded-lg text-xs">
      <p className="text-slate-400 mb-0.5">{label}</p>
      <p className="font-bold text-cyan-400">{fmt(payload[0].value)} km/h</p>
    </div>
  );
};

export const ISSAnalytics = memo(() => {
  const { trajectory, currentData, loading, error, lastUpdated, refresh } = useISSData();
  const avgSpeed = useAppStore(selectAvgSpeed);
  const maxSpeed = useAppStore(selectMaxSpeed);

  const chartData = trajectory
    .filter((p) => p.speed > 0)
    .slice(-30)
    .map((p) => ({
      time: new Date(p.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      speed: Math.round(p.speed),
    }));

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <Satellite className="text-cyan-400 w-7 h-7" />
          <h2 className="text-2xl font-bold text-white tracking-wider">ISS Telemetry</h2>
          <div className="flex items-center px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[11px] font-semibold text-green-400 uppercase tracking-wider">Live · 15s</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={refresh} disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Latitude" value={currentData ? currentData.latitude.toFixed(4) : '—'} unit="°" icon={MapPin} accent="text-white" />
        <StatCard label="Longitude" value={currentData ? currentData.longitude.toFixed(4) : '—'} unit="°" icon={MapPin} accent="text-white" />
        <StatCard label="Current Speed" value={currentData?.speed ? fmt(currentData.speed) : '—'} unit="km/h" icon={Zap} accent="text-cyan-400" />
        <StatCard label="Avg Speed" value={avgSpeed > 0 ? fmt(avgSpeed) : '—'} unit="km/h" icon={Activity} accent="text-purple-400" />
      </div>

      {/* Speed chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="p-5 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-cyan-400" />
            Velocity History — Last 30 Points
          </h3>
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span>Max: <span className="text-purple-400 font-mono">{maxSpeed > 0 ? fmt(maxSpeed) : '—'} km/h</span></span>
            <span>Points: <span className="text-cyan-400 font-mono">{trajectory.length}/30</span></span>
          </div>
        </div>

        <div className="h-64">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={256}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="velGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#334155" fontSize={11} tickMargin={8} interval="preserveStartEnd" />
                <YAxis stroke="#334155" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} domain={['auto', 'auto']} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotoneX" dataKey="speed"
                  stroke="url(#velGrad)" strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#06b6d4', strokeWidth: 0 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <Activity className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Waiting for trajectory data…</p>
              <p className="text-xs mt-1">Requires 2+ polling cycles (30s)</p>
            </div>
          )}
        </div>

        {lastUpdated && (
          <div className="flex items-center justify-between mt-3 text-xs text-slate-600">
            <span>Auto-refreshes every 15 seconds</span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" /> Last: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
});
