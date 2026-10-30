import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import type { Filters, LogPage, ServiceSummary } from "../types/api";
export function useDashboard(filters: Filters, revision: number) {
  const [summary, setSummary] = useState<ServiceSummary[]>([]);
  const [logs, setLogs] = useState<LogPage | null>(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    async function refresh() {
      // Wait for aborted older requests to settle before launching the new filter cycle.
      if (inFlight.current) await inFlight.current;
      if (!active) return;
      if (document.hidden) {
        timer = setTimeout(refresh, 3000);
        return;
      }
      setUpdating(true);
      const work = (async () => {
        try {
          const [nextSummary, nextLogs] = await Promise.allSettled([
            api.summary(controller.signal),
            api.logs(filters, controller.signal),
          ]);
          // Wait for both requests even if one fails, so the next cycle cannot overlap.
          if (nextSummary.status === "rejected") throw nextSummary.reason;
          if (nextLogs.status === "rejected") throw nextLogs.reason;
          if (active) {
            setSummary(nextSummary.value);
            setLogs(nextLogs.value);
            setUpdatedAt(new Date().toISOString());
            setError("");
          }
        } catch (error) {
          if (active)
            setError(
              error instanceof Error ? error.message : "No se pudo actualizar.",
            );
        } finally {
          if (active) {
            setUpdating(false);
            timer = setTimeout(refresh, 3000);
          }
        }
      })();
      inFlight.current = work;
      await work;
      if (inFlight.current === work) inFlight.current = null;
    }
    void refresh();
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [
    filters.service,
    filters.status,
    filters.from,
    filters.to,
    filters.page,
    revision,
  ]);
  return { summary, logs, error, updating, updatedAt };
}
