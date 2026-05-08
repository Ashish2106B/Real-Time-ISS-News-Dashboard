import React from 'react';
import { Search, SortAsc, RefreshCw, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface NewsControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: 'date' | 'source';
  onSortChange: (s: 'date' | 'source') => void;
  category: string;
  onCategoryChange: (c: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'NASA', label: 'NASA' },
  { id: 'SpaceX', label: 'SpaceX' },
  { id: 'ESA', label: 'ESA' },
  { id: 'Space', label: 'Space.com' },
];

export const NewsControls: React.FC<NewsControlsProps> = ({
  searchQuery, onSearchChange, sortBy, onSortChange,
  category, onCategoryChange, onRefresh, loading,
}) => (
  <div className="space-y-3">
    {/* Search + Sort + Refresh */}
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search articles..."
          className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
          </button>
        )}
      </div>

      <button
        onClick={() => onSortChange(sortBy === 'date' ? 'source' : 'date')}
        className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
        title={`Sort by ${sortBy === 'date' ? 'source' : 'date'}`}
      >
        <SortAsc className="w-4 h-4" />
        <span className="hidden sm:inline">{sortBy === 'date' ? 'Date' : 'Source'}</span>
      </button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRefresh}
        disabled={loading}
        className="p-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors disabled:opacity-40"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      </motion.button>
    </div>

    {/* Category filters */}
    <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            category === cat.id
              ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
              : 'bg-slate-800/30 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  </div>
);
