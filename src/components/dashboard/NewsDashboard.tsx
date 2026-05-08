import React from 'react';
import { useNewsData } from '../../hooks/useNewsData';
import { motion } from 'framer-motion';
import { Newspaper, RefreshCw, ExternalLink, Clock } from 'lucide-react';

const SkeletonCard: React.FC = () => (
  <div className="p-4 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl animate-pulse">
    <div className="h-40 bg-slate-800 rounded-lg mb-3" />
    <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
    <div className="h-3 bg-slate-800 rounded w-full mb-1" />
    <div className="h-3 bg-slate-800 rounded w-2/3" />
  </div>
);

export const NewsDashboard: React.FC = () => {
  const { articles, loading, error, refresh } = useNewsData();

  const timeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Newspaper className="text-purple-400 w-7 h-7" />
          <h2 className="text-2xl font-bold text-white tracking-wider">Space Intel Feed</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : articles.map((article, index) => (
              <motion.a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group block p-4 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl hover:border-purple-500/30 transition-colors overflow-hidden"
              >
                {article.image_url && (
                  <div className="relative h-40 mb-3 rounded-lg overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-xs px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300">
                      {article.news_site}
                    </span>
                  </div>
                )}
                <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {timeAgo(article.published_at)}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
                </div>
              </motion.a>
            ))}
      </div>
    </div>
  );
};
