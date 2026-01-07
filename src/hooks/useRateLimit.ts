import { useState, useEffect } from "react";

const RATE_LIMIT_KEY_PREFIX = "mojvis-rate-limit-";
const MAX_SUBMISSIONS_PER_DAY = 3;

interface RateLimitState {
  count: number;
  date: string;
}

export function useRateLimit(type: "feedback" | "click_fix") {
  const storageKey = `${RATE_LIMIT_KEY_PREFIX}${type}`;
  
  const [state, setState] = useState<RateLimitState>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RateLimitState;
        const today = new Date().toDateString();
        // Reset if it's a new day
        if (parsed.date !== today) {
          return { count: 0, date: today };
        }
        return parsed;
      } catch {
        return { count: 0, date: new Date().toDateString() };
      }
    }
    return { count: 0, date: new Date().toDateString() };
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const remaining = Math.max(0, MAX_SUBMISSIONS_PER_DAY - state.count);
  const canSubmit = remaining > 0;

  const recordSubmission = () => {
    const today = new Date().toDateString();
    setState(prev => {
      // Reset if new day
      if (prev.date !== today) {
        return { count: 1, date: today };
      }
      return { count: prev.count + 1, date: today };
    });
  };

  const reset = () => {
    setState({ count: 0, date: new Date().toDateString() });
  };

  return {
    remaining,
    max: MAX_SUBMISSIONS_PER_DAY,
    canSubmit,
    recordSubmission,
    reset,
  };
}
