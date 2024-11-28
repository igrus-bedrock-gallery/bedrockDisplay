import { useEffect } from 'react';

export function usePolling(callback: () => void, interval: number) {
  useEffect(() => {
    const intervalId = setInterval(callback, interval);
    return () => clearInterval(intervalId);
  }, [callback, interval]);
}