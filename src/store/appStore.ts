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
export const selectTrajectory = (state: AppStore) => state.trajectory || [];
export const selectArticles = (state: AppStore) => state.articles || [];
