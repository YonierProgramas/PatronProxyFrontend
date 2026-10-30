import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { ServiceCards } from "../components/ServiceCards";
import { DurationChart } from "../components/DurationChart";
import { AuditTable, emptyFilters } from "../components/AuditTable";
import { OperationPanel } from "../components/OperationPanel";
import { useDashboard } from "../hooks/useDashboard";
import { dateTime } from "../utils/format";
import type { Batch } from "../types/api";
export function Dashboard() {
  const [filters, setFilters] = useState(emptyFilters);
  const [revision, setRevision] = useState(0);
  const { summary, logs, error, updating, updatedAt } = useDashboard(
    filters,
    revision,
  );
  const [simulating, setSimulating] = useState(false);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [simulationError, setSimulationError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function simulate() {
    if (simulating) return;
    setSimulating(true);
    setBatch(null);
    setSimulationError("");
    const current = new AbortController();
    controller.current = current;
    try {
      const value = await api.simulate(current.signal);
      if (!current.signal.aborted) setBatch(value);
    } catch (e) {
      if (!current.signal.aborted)
        setSimulationError(
          e instanceof Error ? e.message : "No se pudo simular la carga.",
        );
    } finally {
      if (!current.signal.aborted) {
        setSimulating(false);
        setRevision((r) => r + 1);
      }
    }
  }
  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">↗</span>
          <strong>
            proxy<span>monitor</span>
          </strong>
          <span className="brand-divider" />
          <span className="brand-subtitle">Observabilidad de servicios</span>
        </div>
        <span className="academic-label">PROYECTO ACADÉMICO</span>
      </header>
      <main>
        <div className="page-heading">
          <div>
            <div className="eyebrow">DASHBOARD / VISTA GENERAL</div>
            <h1>Monitor de microservicios</h1>
            <p>El estado de tus servicios, en un solo lugar.</p>
          </div>
          <button
            className="primary simulate"
            disabled={simulating}
            onClick={() => void simulate()}
          >
            <span aria-hidden="true">ϟ</span>
            {simulating ? "Simulación en curso…" : "Simular carga"}
          </button>
        </div>
        <div className="live-bar">
          <span>
            <i className={`live-dot ${error ? "offline" : ""}`} />
            {error
              ? "Sin conexión con el backend"
              : updatedAt
                ? "Monitoreo activo"
                : "Conectando con el backend…"}
          </span>
          <span role="status">
            {updating ? "Actualizando · " : ""}Última actualización:{" "}
            {updatedAt ? dateTime(updatedAt) : "Pendiente"}
            <span className="poll-label">Cada 3 segundos</span>
          </span>
        </div>
        {error && (
          <div className="notice error-notice" role="alert">
            {error}
          </div>
        )}
        {simulationError && (
          <div className="notice error-notice" role="alert">
            {simulationError}
          </div>
        )}
        {batch && (
          <div className="notice" role="status">
            Simulación completada: {batch.completedCalls} llamadas ·{" "}
            {batch.successCount} éxitos · {batch.errorCount} errores.
            <small>Lote: {batch.batchId}</small>
          </div>
        )}
        <ServiceCards summary={summary} />
        <DurationChart summary={summary} />
        <AuditTable
          logs={logs}
          filters={filters}
          onChange={setFilters}
          stale={updating}
        />
        <OperationPanel onComplete={() => setRevision((r) => r + 1)} />
        <footer>
          <span>Patrón Proxy · Auditoría de llamadas reales</span>
          <span>Inventario / Pedidos / Pagos</span>
        </footer>
      </main>
    </>
  );
}
