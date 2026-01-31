import { useEffect, useState } from "react";

export function useNow(intervalMs = 1000, enabled = true) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;

    const id = window.setInterval(() => setNowMs(Date.now()), intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs, enabled]);

  return nowMs;
}
