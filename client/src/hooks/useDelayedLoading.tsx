import { useState, useEffect } from 'react';

interface DelayedLoadingOptions {
  delay?: number;
  enabled?: boolean;
}

export function useDelayedLoading({ delay = 1000, enabled = true }: DelayedLoadingOptions = {}) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setShouldLoad(false);
      return;
    }

    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, enabled]);

  return shouldLoad;
}