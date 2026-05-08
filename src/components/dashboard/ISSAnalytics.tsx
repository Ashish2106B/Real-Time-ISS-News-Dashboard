import React from 'react';
import { useISSData } from '../../hooks/useISSData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { RefreshCw, Satellite, Activity, MapPin, Clock } from 'lucide-react';

export const ISSAnalytics: React.FC = () => {
  const { trajectory, currentData, loading, error, lastUpdated, refresh } = useISSData();

  const formatSpeed = (speed: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(speed);
  };

  const chartData = trajectory.map((point) => ({
    time: new Date(point.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    speed: Math.round(point.speed)
  })).slice(1); // Remove the first point since speed is 0

  return (
    <div className="w-full space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Satellite className="text-cyan-400 w-8 h-8" />
          <h2 className="text-2xl font-bold text-white tracking-wider">ISS Telemetry</h2>
          
          {/* Live Status Indicator */}
          <div className="flex items-center ml-4 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="relative flex h-2.5 w-2.5 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Live</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refresh}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </motion.button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Coordinate Card: Latitude */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <MapPin className="w-16 h-16" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Latitude</p>
          <p className="text-2xl font-bold text-white font-mono">
            {currentData ? currentData.latitude.toFixed(4) : '---.----'}°
          </p>
        </motion.div>

        {/* Coordinate Card: Longitude */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <MapPin className="w-16 h-16" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Longitude</p>
          <p className="text-2xl font-bold text-white font-mono">
            {currentData ? currentData.longitude.toFixed(4) : '---.----'}°
          </p>
        </motion.div>

        {/* Speed Analytics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-16 h-16" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Orbital Speed</p>
          <p className="text-2xl font-bold text-cyan-400 font-mono">
            {currentData?.speed ? formatSpeed(currentData.speed) : '---'} <span className="text-sm text-cyan-600">km/h</span>
          </p>
        </motion.div>

        {/* Trajectory Counter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="w-16 h-16" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Trajectory Points</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-purple-400 font-mono">
              {trajectory.length}
            </p>
            <p className="text-sm text-slate-500">/ 15 stored</p>
          </div>
        </motion.div>
      </div>

      {/* Speed Chart Panel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl"
      >
        <h3 className="text-lg font-medium text-slate-300 mb-6 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-slate-400" />
          Velocity Fluctuations
        </h3>
        
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time" 
                  stroke="#475569" 
                  fontSize={12} 
                  tickMargin={10} 
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  stroke="#475569" 
                  fontSize={12} 
                  tickFormatter={(val) => `${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="speed" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#fff', stroke: '#06b6d4', strokeWidth: 2 }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center flex-col text-slate-500">
              <Activity className="w-8 h-8 mb-2 opacity-50" />
              <p>Waiting for velocity data...</p>
              <p className="text-xs mt-1">Requires at least two trajectory points</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
          <p>Updates automatically every 15 seconds</p>
          {lastUpdated && (
            <p>Last poll: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
