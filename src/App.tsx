import React, { useState, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar, Header } from './components/layout/Sidebar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useAppStore } from './store/appStore';
import { Loader2 } from 'lucide-react';
import './index.css';

// ── Lazy loaded modules ───────────────────────────────────────
const ISSMap        = lazy(() => import('./components/map/ISSMap').then(m => ({ default: m.ISSMap })));
const ISSAnalytics  = lazy(() => import('./components/dashboard/ISSAnalytics').then(m => ({ default: m.ISSAnalytics })));
const NewsDashboard = lazy(() => import('./components/dashboard/NewsDashboard').then(m => ({ default: m.NewsDashboard })));
const AIAssistant   = lazy(() => import('./components/chat/AIAssistant').then(m => ({ default: m.AIAssistant })));
const PeopleInSpace = lazy(() => import('./components/astronauts/PeopleInSpace').then(m => ({ default: m.PeopleInSpace })));
const RealtimeCharts = lazy(() => import('./components/charts/RealtimeCharts').then(m => ({ default: m.RealtimeCharts })));

const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
    <p className="text-xs text-slate-600 tracking-widest uppercase">Loading Module…</p>
  </div>
);

const wrap = (el: React.ReactNode, title: string) => (
  <ErrorBoundary fallbackTitle={title}>
    <Suspense fallback={<Loader />}>{el}</Suspense>
  </ErrorBoundary>
);

const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -8, scale: 0.98 },
};

function App() {
  const [activeTab, setActiveTab] = useState('tracker');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDark = useAppStore((s) => s.isDark);

  const renderContent = () => {
    switch (activeTab) {
      case 'tracker':
        return (
          <div className="space-y-6">
            {wrap(<ISSMap />, 'Map failed to load')}
            {wrap(<ISSAnalytics />, 'Telemetry failed to load')}
            {wrap(<PeopleInSpace />, 'Astronaut data unavailable')}
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            {wrap(<ISSAnalytics />, 'Telemetry failed to load')}
            {wrap(<RealtimeCharts />, 'Charts failed to load')}
          </div>
        );
      case 'astronauts':
        return wrap(<PeopleInSpace />, 'Astronaut data unavailable');
      case 'news':
        return wrap(<NewsDashboard />, 'News feed unavailable');
      case 'assistant':
        return wrap(<AIAssistant />, 'AI assistant unavailable');
      default:
        return null;
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="stars-bg" />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15,23,42,0.95)',
            color: '#f8fafc',
            border: '1px solid rgba(51,65,85,0.5)',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#06b6d4', secondary: '#0f172a' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
        }}
      />

      <div className="flex min-h-screen bg-space-gradient relative z-10">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />

        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />

          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="px-4 lg:px-8 py-2.5 border-t border-slate-800/50 bg-slate-950/40 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700">
              <p>ORBITAL Space Intelligence v2.0</p>
              <p>open-notify.org · spaceflightnewsapi.net</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
