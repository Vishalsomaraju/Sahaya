import { useState, useEffect } from 'react';

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

export const useVitalsPolling = (patientId: string = 'demo-patient', intervalMs: number = 3000) => {
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchVitals = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/patient/${patientId}/latest-vitals`);
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
  }, [patientId, intervalMs]);

  return { vitals, isMock, loading, error };
};
