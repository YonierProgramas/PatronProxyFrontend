import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { AuditLog, ServiceId, ServiceSummary } from "../types/api";
import { colors, names, dateTime, duration } from "../utils/format";
interface Point {
  time: number;
  log: AuditLog;
  inventory?: number;
  orders?: number;
  payments?: number;
}
export function DurationChart({ summary }: { summary: ServiceSummary[] }) {
  const data: Point[] = summary
    .flatMap((s) =>
      s.recentCalls.map((log) => ({
        time: Date.parse(log.timestamp),
        log,
        [s.serviceId]: log.durationMs,
      })),
    )
    .sort((a, b) => a.time - b.time);
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Tiempos de respuesta</h2>
          <p>
            Últimas 20 llamadas por servicio · duración real en milisegundos
          </p>
        </div>
        <span className="small-label">HISTORIAL RECIENTE</span>
      </div>
      {data.length ? (
        <div className="chart">
          <ResponsiveContainer width="100%" height={285}>
            <LineChart
              data={data}
              margin={{ left: 12, right: 20, top: 15, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 5"
                vertical={false}
                stroke="#eceef4"
              />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(v) => new Date(v).toLocaleTimeString("es-CO")}
                tick={{ fontSize: 11 }}
                minTickGap={40}
              />
              <YAxis unit=" ms" tick={{ fontSize: 11 }} width={70} />
              <Tooltip
                content={({ active, payload }) => {
                  const point = payload?.find((p) => p.payload?.log)
                    ?.payload as Point | undefined;
                  if (!active || !point) return null;
                  return (
                    <div className="chart-tooltip">
                      <strong>{names[point.log.serviceId]}</strong>
                      <div>{point.log.operation}</div>
                      <div>{dateTime(point.log.timestamp)}</div>
                      <div>{duration(point.log.durationMs)}</div>
                    </div>
                  );
                }}
              />
              <Legend />
              {(Object.keys(names) as ServiceId[]).map((id) => (
                <Line
                  key={id}
                  name={names[id]}
                  dataKey={id}
                  stroke={colors[id]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="empty">
          <span>⌁</span>
          <strong>Aún no hay llamadas</strong>
          <p>
            Ejecuta una operación o simula carga para ver los tiempos de
            respuesta.
          </p>
        </div>
      )}
    </section>
  );
}
