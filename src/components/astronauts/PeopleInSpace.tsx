import React from 'react';
import { motion } from 'framer-motion';
import { Users, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useAstronautsData } from '../../hooks/useAstronautsData';
import { AstronautCard } from './AstronautCard';

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-28 p-4 bg-slate-900/40 border border-slate-700/50 rounded-xl animate-pulse space-y-2">
    <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto" />
    <div className="h-3 bg-slate-800 rounded w-3/4 mx-auto" />
    <div className="h-3 bg-slate-800 rounded w-1/2 mx-auto" />
  </div>
);

export const PeopleInSpace: React.FC = () => {
  const { astronauts, astronautCount, loading, error, refresh } = useAstronautsData();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-indigo-400" />
          <h3 className="text-lg font-bold text-white tracking-wide">People in Space</h3>
          {!loading && !error && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400"
            >
              {astronautCount}
            </motion.span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {error ? (
            <WifiOff className="w-4 h-4 text-red-400" />
          ) : (
            <Wifi className="w-4 h-4 text-green-400" />
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refresh}
            disabled={loading}
            className="p-1.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Scrollable astronaut row */}
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
          : astronauts.map((a, i) => (
              <AstronautCard key={`${a.name}-${i}`} astronaut={a} index={i} />
            ))}
      </div>
    </div>
  );
};
