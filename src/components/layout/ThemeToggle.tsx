import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useAppStore();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl">
      <div className="flex items-center space-x-3">
        {isDark ? (
          <Moon className="w-4 h-4 text-indigo-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-400" />
        )}
        <span className="text-sm font-medium text-slate-300">
          {isDark ? 'Dark Theme' : 'Light Theme'}
        </span>
      </div>
      
      <button
        onClick={toggleTheme}
        className={`theme-toggle-btn ${isDark ? 'is-dark' : 'is-light'}`}
        aria-label="Toggle theme"
      >
        <motion.div
          className="theme-toggle-thumb"
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5" />
          ) : (
            <Sun className="w-3.5 h-3.5" />
          )}
        </motion.div>
      </button>
    </div>
  );
};
