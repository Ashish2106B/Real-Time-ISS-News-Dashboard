import { useState, useEffect, useCallback, useRef } from 'react';
import { ISSService } from '../services/issService';
import type { Coordinates } from '../utils/geo';
import { calculateSpeed } from '../utils/geo';
import { toast } from 'react-hot-toast';

export interface ISSTrajectoryPoint extends Coordinates {
  speed: number;
}

const STORAGE_KEY = 'iss_trajectory_history';
const MAX_POINTS = 15;
const POLL_INTERVAL = 15000;

export function useISSData() {
  const [trajectory, setTrajectory] = useState<ISSTrajectoryPoint[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist to local storage whenever trajectory changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trajectory));
  }, [trajectory]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await ISSService.fetchPosition();
      
      const newCoord: Coordinates = {
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        timestamp: data.timestamp
      };

      setTrajectory(prev => {
        let speed = 0;
        
        // Detect anomaly: skip if coordinates are identically exactly the same as last fetch
        if (prev.length > 0) {
          const lastCoord = prev[prev.length - 1];
          if (lastCoord.latitude === newCoord.latitude && lastCoord.longitude === newCoord.longitude) {
            console.warn('Anomaly detected: Identical coordinates fetched.');
            return prev;
          }
          speed = calculateSpeed(lastCoord, newCoord);
          
          // Speed anomaly check: ISS typically moves at ~28,000 km/h (approx 7.6 km/s)
          // If speed is abnormally high (e.g., > 50,000 km/h) or low (e.g. 0), log anomaly
          if (speed > 50000 || (speed < 10000 && speed > 0)) {
            console.warn(`Speed anomaly detected: ${speed} km/h`);
          }
        }
        
        const newPoint: ISSTrajectoryPoint = { ...newCoord, speed };
        return [...prev, newPoint].slice(-MAX_POINTS);
      });
      
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ISS data');
      toast.error('Failed to update ISS location');
    } finally {
      setLoading(false);
    }
  }, []);

  const startPolling = useCallback(() => {
    fetchData(); // Initial fetch
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
    }
    timeoutRef.current = setInterval(fetchData, POLL_INTERVAL);
  }, [fetchData]);

  const stopPolling = useCallback(() => {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  return {
    trajectory,
    currentData: trajectory.length > 0 ? trajectory[trajectory.length - 1] : null,
    loading,
    error,
    lastUpdated,
    refresh: fetchData
  };
}
