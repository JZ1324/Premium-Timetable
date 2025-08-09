// Debounced localStorage persistence hook
// Purpose: reduce write amplification & main-thread jank from rapid state updates (e.g., timers, drag/drop)
// Usage: useDebouncedLocalStorage('key', value, 800)
import { useEffect, useRef } from 'react';

/**
 * Debounce & batch writes to localStorage for frequently changing values.
 * Flushes on unmount, page hide, and before unload to avoid data loss.
 *
 * @param {string} key - localStorage key
 * @param {*} value - value to persist (will be serialized)
 * @param {number} delay - debounce delay in ms
 * @param {object} options
 * @param {(val:any)=>string} [options.serialize=JSON.stringify] - serializer fn
 * @param {boolean} [options.enabled=true] - allow disabling without removing hook
 */
export function useDebouncedLocalStorage(key, value, delay = 800, { serialize = JSON.stringify, enabled = true } = {}) {
  const timerRef = useRef(null);
  const latestSerializedRef = useRef(undefined);
  const hasPendingWriteRef = useRef(false);

  // Schedule debounced persistence when value changes
  useEffect(() => {
    if (!enabled) return; // early out if disabled

    let serialized;
    try {
      serialized = serialize(value);
    } catch (e) {
      console.error('[useDebouncedLocalStorage] serialize failed for key', key, e);
      return;
    }

    // Skip if no change in serialized form
    if (serialized === latestSerializedRef.current) return;
    latestSerializedRef.current = serialized;
    hasPendingWriteRef.current = true;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, serialized);
        hasPendingWriteRef.current = false;
      } catch (e) {
        console.error('[useDebouncedLocalStorage] setItem failed for key', key, e);
      }
    }, delay);
  }, [key, value, delay, serialize, enabled]);

  // Flush logic (used on unmount / visibility change / before unload)
  useEffect(() => {
    if (!enabled) return;

    const flush = () => {
      if (hasPendingWriteRef.current && latestSerializedRef.current != null) {
        try {
          localStorage.setItem(key, latestSerializedRef.current);
          hasPendingWriteRef.current = false;
        } catch (e) {
          console.error('[useDebouncedLocalStorage] flush failed for key', key, e);
        }
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (timerRef.current) clearTimeout(timerRef.current);
      flush(); // final attempt to persist
    };
  }, [key, enabled]);
}

export default useDebouncedLocalStorage;
