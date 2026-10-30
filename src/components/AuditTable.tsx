import { Fragment, useState } from "react";
import type { Filters, LogPage, ServiceId } from "../types/api";
import { names, dateTime, duration, json, statusName } from "../utils/format";
export const emptyFilters: Filters = {
  service: "",
  status: "",
  from: "",
  to: "",
  page: 0,
};
export function AuditTable({
  logs,
  filters,
  onChange,
  stale,
}: {
  logs: LogPage | null;
  filters: Filters;
  onChange: (filters: Filters) => void;
  stale: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [draft, setDraft] = useState(filters);
  const [validation, setValidation] = useState("");
  function apply(event: React.FormEvent) {
    event.preventDefault();
    if (draft.from && draft.to && new Date(draft.from) > new Date(draft.to)) {
      setValidation("La fecha inicial debe ser anterior a la final.");
      return;
    }
    setValidation("");
    onChange({ ...draft, page: 0 });
  }
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Registro de auditoría</h2>
          <p>Explora cada solicitud, sus parámetros y su resultado.</p>
        </div>
        <span className="count-label">
          {logs?.totalElements ?? 0} registros
        </span>
      </div>
      <form className="filters" onSubmit={apply}>
        <label>
          Servicio
          <select
            value={draft.service}
            onChange={(e) => setDraft({ ...draft, service: e.target.value })}
          >
            <option value="">Todos los servicios</option>
            {Object.entries(names).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="SUCCESS">Éxito</option>
            <option value="ERROR">Error</option>
          </select>
        </label>
        <label>
          Desde
          <input
            type="datetime-local"
            value={draft.from}
            onChange={(e) => setDraft({ ...draft, from: e.target.value })}
          />
        </label>
        <label>
          Hasta
          <input
            type="datetime-local"
            value={draft.to}
            onChange={(e) => setDraft({ ...draft, to: e.target.value })}
          />
        </label>
        <button className="secondary" type="submit">
          Filtrar
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setDraft(emptyFilters);
            setValidation("");
            onChange(emptyFilters);
          }}
        >
          Limpiar filtros
        </button>
      </form>
      {validation && (
        <p role="alert" className="error-text">
          {validation}
        </p>
      )}
      <p className="filter-note">
        Los filtros afectan solo esta tabla. Fechas en tu zona horaria; la API
        recibe UTC.
      </p>
      {stale && (
        <p role="status" className="filter-note">
          Actualizando resultados; se conservan los registros de la consulta
          anterior.
        </p>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>ID de solicitud</th>
              <th>Servicio</th>
              <th>Operación</th>
              <th>Duración</th>
              <th>Estado</th>
              <th>
                <span className="sr-only">Detalle</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {logs?.content.map((log) => (
              <Fragment key={log.requestId}>
                <tr
                  className="log-row"
                  onClick={() =>
                    setExpanded(
                      expanded === log.requestId ? null : log.requestId,
                    )
                  }
                >
                  <td>{dateTime(log.timestamp)}</td>
                  <td>
                    <code title={log.requestId}>
                      {log.requestId.slice(0, 8)}…
                    </code>
                  </td>
                  <td>
                    <span className={`service-dot dot-${log.serviceId}`} />
                    {names[log.serviceId as ServiceId]}
                  </td>
                  <td>
                    <code>{log.operation}</code>
                  </td>
                  <td>{duration(log.durationMs)}</td>
                  <td>
                    <span
                      className={`badge ${log.status === "SUCCESS" ? "success" : "error"}`}
                    >
                      {statusName(log.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="detail-button"
                      aria-expanded={expanded === log.requestId}
                      aria-label={`Ver detalle ${log.requestId}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(
                          expanded === log.requestId ? null : log.requestId,
                        );
                      }}
                    >
                      {expanded === log.requestId ? "−" : "+"}
                    </button>
                  </td>
                </tr>
                {expanded === log.requestId && (
                  <tr>
                    <td colSpan={7}>
                      <div className="log-detail">
                        <p>
                          <strong>ID de solicitud:</strong> {log.requestId}
                        </p>
                        <div className="detail-grid">
                          <div>
                            <h3>Parámetros de entrada</h3>
                            <pre>{json(log.inputParams)}</pre>
                          </div>
                          <div>
                            <h3>Respuesta completa</h3>
                            <pre>{json(log.response)}</pre>
                          </div>
                        </div>
                        {log.errorCode && (
                          <div className="error-detail">
                            <h3>{log.errorCode}</h3>
                            <p>{log.errorMessage}</p>
                            <pre>{log.stackTraceSummary}</pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {!logs?.content.length && (
        <div className="empty compact">
          <strong>
            {logs ? "Sin resultados para los filtros" : "Cargando registros…"}
          </strong>
          <p>
            {logs
              ? "Prueba otros filtros o ejecuta una operación."
              : "Esperando la respuesta del backend."}
          </p>
        </div>
      )}
      <div className="pagination">
        <span>
          Página {(logs?.page ?? 0) + 1} de {Math.max(logs?.totalPages ?? 0, 1)}
        </span>
        <div>
          <button
            className="secondary"
            disabled={stale || filters.page === 0}
            onClick={() => onChange({ ...filters, page: filters.page - 1 })}
          >
            Anterior
          </button>
          <button
            className="secondary"
            disabled={stale || !logs || filters.page + 1 >= logs.totalPages}
            onClick={() => onChange({ ...filters, page: filters.page + 1 })}
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
}
