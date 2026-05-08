import { useState, useEffect, useCallback, useRef } from 'react';
import { AstronautsService } from '../services/astronautsService';
import { useAppStore } from '../store/appStore';
import { toast } from 'react-hot-toast';
import type { Astronaut } from '../services/astronautsService';

const POLL_INTERVAL = 60_000;

export function useAstronautsData() {
  const setAstronauts = useAppStore((s) => s.setAstronauts);
  const astronauts = useAppStore((s) => s.astronauts);
  const astronautCount = useAppStore((s) => s.astronautCount);

  const [loading, setLoading] = useState(astronauts.length === 0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await AstronautsService.fetchAstronauts();
      setAstronauts(data.people, data.number);
      if (!silent) toast.success(`${data.number} people currently in space`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch astronauts';
      setError(msg);
      if (!silent) toast.error('Failed to load astronaut data');
    } finally {
      setLoading(false);
    }
  }, [setAstronauts]);

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(() => fetchData(true), POLL_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchData]);

  return { astronauts: astronauts as Astronaut[], astronautCount, loading, error, refresh: () => fetchData() };
}
