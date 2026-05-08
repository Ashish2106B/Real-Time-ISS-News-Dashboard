import React, { memo } from 'react';
import type { Astronaut } from '../../services/astronautsService';
import { motion } from 'framer-motion';

const CRAFT_COLORS: Record<string, string> = {
  'ISS': 'cyan',
  'Tiangong': 'purple',
};

function getCraftColor(craft: string): string {
  for (const [key, color] of Object.entries(CRAFT_COLORS)) {
    if (craft.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return 'indigo';
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

interface AstronautCardProps {
  astronaut: Astronaut;
  index: number;
}

export const AstronautCard = memo(({ astronaut, index }: AstronautCardProps) => {
  const color = getCraftColor(astronaut.craft);
  const colorMap: Record<string, string> = {
    cyan: 'from-cyan-500 to-blue-600 shadow-cyan-500/20',
    purple: 'from-purple-500 to-pink-600 shadow-purple-500/20',
    indigo: 'from-indigo-500 to-blue-600 shadow-indigo-500/20',
  };
  const badgeMap: Record<string, string> = {
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      className="flex-shrink-0 flex flex-col items-center space-y-2 p-4 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-colors w-28"
    >
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg text-sm font-bold text-white`}>
        {getInitials(astronaut.name)}
      </div>
      {/* Name */}
      <p className="text-xs font-medium text-white text-center leading-tight line-clamp-2">
        {astronaut.name}
      </p>
      {/* Craft badge */}
      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${badgeMap[color]}`}>
        {astronaut.craft}
      </span>
    </motion.div>
  );
});
