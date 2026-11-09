import { useEffect, useRef } from 'react';

export function usePolling(callback, delayMs, resetKey) {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback;
  });

  useEffect(() => {
    saved.current();
    const timer = setInterval(() => {
      if (!document.hidden) saved.current();
    }, delayMs);
    return () => clearInterval(timer);
  }, [delayMs, resetKey]);
}
