import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ISSTrajectoryPoint } from '../hooks/useISSData';
import type { Astronaut } from '../services/astronautsService';
import type { SpaceArticle } from '../services/newsService';
import type { AIMessage } from '../services/aiService';

// ─── ISS Slice ────────────────────────────────────────────────
interface ISSSlice {
  trajectory: ISSTrajectoryPoint[];
  setTrajectory: (t: ISSTrajectoryPoint[]) => void;
}

// ─── Astronauts Slice ─────────────────────────────────────────
interface AstronautsSlice {
  astronauts: Astronaut[];
  astronautCount: number;
  setAstronauts: (people: Astronaut[], count: number) => void;
}

// ─── News Slice ───────────────────────────────────────────────
interface NewsSlice {
  articles: SpaceArticle[];
  newsSearchQuery: string;
  newsCategory: string;
  newsSortBy: 'date' | 'source';
  setArticles: (articles: SpaceArticle[]) => void;
  setNewsSearchQuery: (q: string) => void;
  setNewsCategory: (c: string) => void;
  setNewsSortBy: (s: 'date' | 'source') => void;
}

// ─── Chat Slice ───────────────────────────────────────────────
interface ChatSlice {
  messages: AIMessage[];
  addMessage: (msg: AIMessage) => void;
  clearMessages: () => void;
}

// ─── Theme Slice ──────────────────────────────────────────────
interface ThemeSlice {
  isDark: boolean;
  toggleTheme: () => void;
}

// ─── Combined Store ───────────────────────────────────────────
type AppStore = ISSSlice & AstronautsSlice & NewsSlice & ChatSlice & ThemeSlice;

const MAX_MESSAGES = 30;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // ISS
      trajectory: [],
      setTrajectory: (trajectory) => set({ trajectory }),

      // Astronauts
      astronauts: [],
      astronautCount: 0,
      setAstronauts: (astronauts, astronautCount) => set({ astronauts, astronautCount }),

      // News
      articles: [],
      newsSearchQuery: '',
      newsCategory: 'all',
      newsSortBy: 'date',
      setArticles: (articles) => set({ articles }),
      setNewsSearchQuery: (newsSearchQuery) => set({ newsSearchQuery }),
      setNewsCategory: (newsCategory) => set({ newsCategory }),
      setNewsSortBy: (newsSortBy) => set({ newsSortBy }),

      // Chat
      messages: [],
      addMessage: (msg) =>
        set((state) => ({
          messages: [...state.messages, msg].slice(-MAX_MESSAGES),
        })),
      clearMessages: () => set({ messages: [] }),

      // Theme
      isDark: true,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: 'orbital-dashboard-store',
      partialize: (state) => ({
        isDark: state.isDark,
        messages: state.messages,
        trajectory: state.trajectory,
      }),
    }
  )
);

// ─── Derived selectors (prevent unnecessary rerenders) ────────
export const selectCurrentISS = (state: AppStore) =>
  state.trajectory.length > 0 ? state.trajectory[state.trajectory.length - 1] : null;

export const selectSpeedHistory = (state: AppStore) =>
  state.trajectory.map((p) => ({ speed: p.speed, timestamp: p.timestamp }));

export const selectAvgSpeed = (state: AppStore) => {
  const valid = state.trajectory.filter((p) => p.speed > 0);
  if (!valid.length) return 0;
  return valid.reduce((sum, p) => sum + p.speed, 0) / valid.length;
};

export const selectMaxSpeed = (state: AppStore) =>
  state.trajectory.reduce((max, p) => Math.max(max, p.speed), 0);

export const selectFilteredArticles = (state: AppStore) => {
  let filtered = state.articles;
  if (state.newsSearchQuery.trim()) {
    const q = state.newsSearchQuery.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.news_site.toLowerCase().includes(q)
    );
  }
  if (state.newsCategory !== 'all') {
    filtered = filtered.filter((a) =>
      a.news_site.toLowerCase().includes(state.newsCategory.toLowerCase())
    );
  }
  if (state.newsSortBy === 'source') {
    filtered = [...filtered].sort((a, b) => a.news_site.localeCompare(b.news_site));
  } else {
    filtered = [...filtered].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }
  // Deduplicate by title
  const seen = new Set<string>();
  return filtered.filter((a) => {
    if (seen.has(a.title)) return false;
    seen.add(a.title);
    return true;
  });
};
