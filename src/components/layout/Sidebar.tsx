import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import {
  Satellite, Newspaper, Bot, BarChart3,
  Sun, Moon, Menu, X, Users, Map,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { id: 'tracker', label: 'ISS Tracker', icon: Map },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'astronauts', label: 'People in Space', icon: Users },
  { id: 'news', label: 'Intel Feed', icon: Newspaper },
  { id: 'assistant', label: 'NOVA AI', icon: Bot },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onToggle }) => {
  const { isDark, toggleTheme } = useAppStore();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onToggle} />
      )}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-slate-950/90 backdrop-blur-xl border-r border-slate-800/50 transition-transform duration-300 lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Satellite className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-widest">ORBITAL</h1>
              <p className="text-[9px] text-slate-600 uppercase tracking-[0.25em]">Space Intelligence</p>
            </div>
          </div>
          <button onClick={onToggle} className="lg:hidden text-slate-500 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { onTabChange(item.id); if (window.innerWidth < 1024) onToggle(); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  active
                    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-cyan-400' : 'text-slate-600'}`} style={{ width: 18, height: 18 }} />
                <span>{item.label}</span>
                {active && (
                  <motion.div layoutId="dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/60" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-slate-800/50 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <div className="px-4 py-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
            <div className="flex items-center space-x-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-green-400 font-medium">Systems Nominal</span>
            </div>
            <p className="text-[10px] text-slate-700">All subsystems operational</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export const Header: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => (
  <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
        <Satellite className="w-4 h-4 text-white" />
      </div>
      <h1 className="text-sm font-bold text-white tracking-widest">ORBITAL</h1>
    </div>
    <button onClick={onMenuToggle} className="text-slate-400 hover:text-white p-2">
      <Menu className="w-5 h-5" />
    </button>
  </header>
);
