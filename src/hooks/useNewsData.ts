import { useState, useEffect, useCallback, useMemo } from 'react';
import { NewsService } from '../services/newsService';
import { useAppStore } from '../store/appStore';
import { toast } from 'react-hot-toast';

const CACHE_KEY = 'space_news_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface CacheEntry {
  data: import('../services/newsService').SpaceArticle[];
  timestamp: number;
}

export function useNewsData() {
  const articles = useAppStore((s) => s.articles);
  const newsSearchQuery = useAppStore((s) => s.newsSearchQuery);
  const newsCategory = useAppStore((s) => s.newsCategory);
  const newsSortBy = useAppStore((s) => s.newsSortBy);
  
  const setArticles = useAppStore((s) => s.setArticles);
  const setNewsSearchQuery = useAppStore((s) => s.setNewsSearchQuery);
  const setNewsCategory = useAppStore((s) => s.setNewsCategory);
  const setNewsSortBy = useAppStore((s) => s.setNewsSortBy);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    let filtered = articles || [];
    if (newsSearchQuery.trim()) {
      const q = newsSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.title?.toLowerCase() || '').includes(q) ||
          (a.summary?.toLowerCase() || '').includes(q) ||
          (a.news_site?.toLowerCase() || '').includes(q)
      );
    }
    if (newsCategory !== 'all') {
      filtered = filtered.filter((a) =>
        (a.news_site?.toLowerCase() || '').includes(newsCategory.toLowerCase())
      );
    }
    if (newsSortBy === 'source') {
      filtered = [...filtered].sort((a, b) => (a.news_site || '').localeCompare(b.news_site || ''));
    } else {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
      );
    }
    const seen = new Set<string>();
    return filtered.filter((a) => {
      if (!a.title || seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    });
  }, [articles, newsSearchQuery, newsCategory, newsSortBy]);

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

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

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
