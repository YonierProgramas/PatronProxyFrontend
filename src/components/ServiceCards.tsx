import type { ServiceSummary, ServiceId } from "../types/api";
import { names, percent, duration, requiresAttention } from "../utils/format";
export function ServiceCards({ summary }: { summary: ServiceSummary[] }) {
  return (
    <section className="cards" aria-label="Resumen por servicio">
      {(Object.keys(names) as ServiceId[]).map((id, index) => {
        const item = summary.find((s) => s.serviceId === id);
        const attention = requiresAttention(item?.errorRate ?? null);
        return (
          <article
            key={id}
            className={`service-card ${attention ? "attention" : ""}`}
          >
            <div className="card-heading">
              <span className={`service-icon icon-${id}`}>
                {["▦", "▤", "◇"][index]}
              </span>
              <h2>{names[id]}</h2>
              <span className={`badge ${attention ? "error" : "neutral"}`}>
                {attention
                  ? "Requiere atención"
                  : item?.totalCalls
                    ? "Con actividad"
                    : "Sin llamadas"}
              </span>
            </div>
            <div className="call-count">
              {item?.totalCalls.toLocaleString("es-CO") ?? "0"}
              <span>Total de llamadas</span>
            </div>
            <div className="card-stats">
              <div>
                <span>Tasa de éxito</span>
                <strong className="success-text">
                  {percent(item?.successRate ?? null)}
                </strong>
              </div>
              <div>
                <span>Tiempo promedio</span>
                <strong>{duration(item?.averageDurationMs ?? null)}</strong>
              </div>
            </div>
            <div className="error-rate">
              <span>Tasa de error</span>
              <strong>{percent(item?.errorRate ?? null)}</strong>
            </div>
          </article>
        );
      })}
    </section>
  );
}
