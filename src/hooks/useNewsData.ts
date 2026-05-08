import { useState, useEffect, useCallback } from 'react';
import { NewsService } from '../services/newsService';
import type { SpaceArticle } from '../services/newsService';
import { toast } from 'react-hot-toast';

const CACHE_KEY = 'space_news_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: SpaceArticle[];
  timestamp: number;
}

export function useNewsData() {
  const [articles, setArticles] = useState<SpaceArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (force = false) => {
    // Check cache first
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
      } catch (e) {
        // Ignore cache errors
      }
    }

    setLoading(true);
    setError(null);
    try {
      const data = await NewsService.fetchArticles();
      setArticles(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      if (force) toast.success('News feed refreshed');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch news');
      toast.error('Failed to load space news');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { articles, loading, error, refresh: () => fetchNews(true) };
}
