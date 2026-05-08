import { useState, useEffect, useCallback, useRef } from 'react';
import { ISSService } from '../services/issService';
import type { Coordinates } from '../utils/geo';
import { calculateSpeed } from '../utils/geo';
import { useAppStore } from '../store/appStore';
import { toast } from 'react-hot-toast';

export interface ISSTrajectoryPoint extends Coordinates {
  speed: number;
}

const STORAGE_KEY = 'iss_trajectory_history';
const MAX_POINTS = 30;
const POLL_INTERVAL = 15_000;

export function useISSData() {
  const setTrajectory = useAppStore((s) => s.setTrajectory);
  const trajectory = useAppStore((s) => s.trajectory) as ISSTrajectoryPoint[];

  const [loading, setLoading] = useState(trajectory.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist trajectory separately (Zustand persist also handles this, but belt-and-suspenders)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trajectory)); } catch {}
  }, [trajectory]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await ISSService.fetchPosition();
      const newCoord: Coordinates = {
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        timestamp: data.timestamp,
      };

      setTrajectory(
        (() => {
          const prev = useAppStore.getState().trajectory as ISSTrajectoryPoint[];
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            if (last.latitude === newCoord.latitude && last.longitude === newCoord.longitude) return prev;
          }
          const speed = prev.length > 0 ? calculateSpeed(prev[prev.length - 1], newCoord) : 0;
          const point: ISSTrajectoryPoint = { ...newCoord, speed };
          return [...prev, point].slice(-MAX_POINTS);
        })()
      );
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch ISS data';
      setError(msg);
      toast.error('ISS location update failed');
    } finally {
      setLoading(false);
    }
  }, [setTrajectory]);

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchData]);

  const currentData = trajectory.length > 0 ? trajectory[trajectory.length - 1] : null;
  return { trajectory, currentData, loading, error, lastUpdated, refresh: fetchData };
}
