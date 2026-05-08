import React from 'react';
import { Newspaper } from 'lucide-react';
import { useNewsData } from '../../hooks/useNewsData';
import { NewsCard } from './NewsCard';
import { NewsControls } from './NewsControls';

const SkeletonCard = () => (
  <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-hidden animate-pulse">
    <div className="h-40 bg-slate-800" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-slate-800 rounded w-3/4" />
      <div className="h-3 bg-slate-800 rounded w-full" />
      <div className="h-3 bg-slate-800 rounded w-2/3" />
    </div>
  </div>
);

export const NewsDashboard: React.FC = () => {
  const {
    articles, loading, error,
    newsSearchQuery, newsCategory, newsSortBy,
    setNewsSearchQuery, setNewsCategory, setNewsSortBy,
    refresh,
  } = useNewsData();

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Newspaper className="text-purple-400 w-7 h-7" />
        <h2 className="text-2xl font-bold text-white tracking-wider">Space Intel Feed</h2>
        {!loading && (
          <span className="px-2 py-0.5 text-xs bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400">
            {articles.length} articles
          </span>
        )}
      </div>

      <NewsControls
        searchQuery={newsSearchQuery}
        onSearchChange={setNewsSearchQuery}
        sortBy={newsSortBy}
        onSortChange={setNewsSortBy}
        category={newsCategory}
        onCategoryChange={setNewsCategory}
        onRefresh={refresh}
        loading={loading}
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {!loading && articles.length === 0 && !error && (
        <div className="py-16 flex flex-col items-center text-slate-600">
          <Newspaper className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No articles found for your search.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : articles.map((article, i) => <NewsCard key={article.id} article={article} index={i} />)}
      </div>
    </div>
  );
};
