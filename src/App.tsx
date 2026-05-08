import React, { useState, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar, Header } from './components/layout/Sidebar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useThemeStore } from './store/useThemeStore';
import { Loader2 } from 'lucide-react';
import './index.css';

// Lazy loaded page-level components
const ISSMap = lazy(() => import('./components/map/ISSMap').then(m => ({ default: m.ISSMap })));
const ISSAnalytics = lazy(() => import('./components/dashboard/ISSAnalytics').then(m => ({ default: m.ISSAnalytics })));
const NewsDashboard = lazy(() => import('./components/dashboard/NewsDashboard').then(m => ({ default: m.NewsDashboard })));
const AIAssistant = lazy(() => import('./components/chat/AIAssistant').then(m => ({ default: m.AIAssistant })));

const LoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
    <p className="text-sm text-slate-500 tracking-wider uppercase">Loading Module...</p>
  </div>
);

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
};

function App() {
  const [activeTab, setActiveTab] = useState('tracker');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark } = useThemeStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'tracker':
        return (
          <div className="space-y-6">
            <ErrorBoundary fallbackTitle="Map failed to load">
              <Suspense fallback={<LoadingFallback />}>
                <ISSMap />
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallbackTitle="Analytics failed to load">
              <Suspense fallback={<LoadingFallback />}>
                <ISSAnalytics />
              </Suspense>
            </ErrorBoundary>
          </div>
        );
      case 'analytics':
        return (
          <ErrorBoundary fallbackTitle="Analytics failed to load">
            <Suspense fallback={<LoadingFallback />}>
              <ISSAnalytics />
            </Suspense>
          </ErrorBoundary>
        );
      case 'news':
        return (
          <ErrorBoundary fallbackTitle="News feed failed to load">
            <Suspense fallback={<LoadingFallback />}>
              <NewsDashboard />
            </Suspense>
          </ErrorBoundary>
        );
      case 'assistant':
        return (
          <ErrorBoundary fallbackTitle="AI Assistant failed to load">
            <Suspense fallback={<LoadingFallback />}>
              <AIAssistant />
            </Suspense>
          </ErrorBoundary>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${isDark ? 'dark' : ''}`}>
      {/* Stars background */}
      <div className="stars-bg" />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#f8fafc',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#06b6d4', secondary: '#0f172a' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0f172a' },
          },
        }}
      />

      <div className="flex min-h-screen bg-space-gradient relative z-10">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Header */}
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

          {/* Page Content */}
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

          {/* Footer */}
          <footer className="px-4 lg:px-8 py-3 border-t border-slate-800/50 bg-slate-950/40 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <p>ORBITAL Space Intelligence Dashboard v1.0</p>
              <p>Data: open-notify.org • spaceflightnewsapi.net</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
