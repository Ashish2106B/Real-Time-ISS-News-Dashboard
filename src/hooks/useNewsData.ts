import { useState, useEffect, useCallback } from 'react';
import { NewsService } from '../services/newsService';
import { useAppStore, selectFilteredArticles } from '../store/appStore';
import { toast } from 'react-hot-toast';

const CACHE_KEY = 'space_news_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface CacheEntry {
  data: import('../services/newsService').SpaceArticle[];
  timestamp: number;
}

export function useNewsData() {
  const setArticles = useAppStore((s) => s.setArticles);
  const filteredArticles = useAppStore(selectFilteredArticles);
  const newsSearchQuery = useAppStore((s) => s.newsSearchQuery);
  const newsCategory = useAppStore((s) => s.newsCategory);
  const newsSortBy = useAppStore((s) => s.newsSortBy);
  const setNewsSearchQuery = useAppStore((s) => s.setNewsSearchQuery);
  const setNewsCategory = useAppStore((s) => s.setNewsCategory);
  const setNewsSortBy = useAppStore((s) => s.setNewsSortBy);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (force = false) => {
    if (!force) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          if (Date.now() - entry.timestamp < CACHE_TTL) {
            setArticles(entry.data);
            setLoading(false);
            return;
          }
        }
      } catch { /* ignore */ }
    }
    setLoading(true);
    setError(null);
    try {
      const data = await NewsService.fetchArticles();
      setArticles(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      if (force) toast.success('News feed refreshed');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch news';
      setError(msg);
      toast.error('Failed to load space news');
    } finally {
      setLoading(false);
    }
  }, [setArticles]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  return {
    articles: filteredArticles,
    loading,
    error,
    newsSearchQuery,
    newsCategory,
    newsSortBy,
    setNewsSearchQuery,
    setNewsCategory,
    setNewsSortBy,
    refresh: () => fetchNews(true),
  };
}
