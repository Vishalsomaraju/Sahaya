import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../lib/api';

export interface VitalsData {
  heartRate?: number;
  spo2?: number;
  temperature?: number;
  bloodPressure?: string;
  steps?: number;
  distance?: number;
  calories?: number;
  sleepMinutes?: number;
  restingHeartRate?: number;
  device?: string;
  recordedAt?: string;
}

const DEFAULT_PATIENT_ID = (import.meta.env.VITE_DEFAULT_PATIENT_ID as string) || 'demo-patient';
const DEFAULT_INTERVAL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS) || 6000;
const POLLING_ENABLED = import.meta.env.VITE_ENABLE_WEARABLE_POLLING !== 'false';

export const useVitalsPolling = (
  patientId: string = DEFAULT_PATIENT_ID, 
  intervalMs: number = DEFAULT_INTERVAL_MS,
  enabled: boolean = POLLING_ENABLED
) => {
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !patientId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchVitals = async () => {
      // Avoid polling when tab is in background
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/patient/${encodeURIComponent(patientId)}/latest-vitals`);
        if (!response.ok) throw new Error('Failed to fetch vitals');
        
        const data = await response.json();
        if (mounted && data.data) {
          setVitals(data.data);
          setIsMock(!!data.isMock);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Error fetching vitals');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchVitals(); // Initial fetch
    
    const interval = setInterval(fetchVitals, intervalMs);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [patientId, intervalMs, enabled]);

  return { vitals, isMock, loading, error };
};
