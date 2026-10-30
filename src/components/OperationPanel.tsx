import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "../api/client";
import type { ServiceId, OperationResult } from "../types/api";
import { names, json } from "../utils/format";
export const operations: Record<ServiceId, Record<string, string[]>> = {
  inventory: {
    listProducts: [],
    getStock: ["productId"],
    addStock: ["productId", "quantity"],
    removeStock: ["productId", "quantity"],
  },
  orders: {
    createOrder: ["productId", "quantity"],
    getOrder: ["orderId"],
    listOrders: [],
  },
  payments: {
    processPayment: ["orderId", "amount"],
    getPayment: ["paymentId"],
  },
};
const labels: Record<string, string> = {
  productId: "ID de producto",
  quantity: "Cantidad",
  orderId: "ID de pedido",
  amount: "Importe ficticio",
  paymentId: "ID de pago",
};
const operationNames: Record<string, string> = {
  listProducts: "Listar productos",
  getStock: "Consultar existencias",
  addStock: "Agregar existencias",
  removeStock: "Retirar existencias",
  createOrder: "Crear pedido",
  getOrder: "Consultar pedido",
  listOrders: "Listar pedidos",
  processPayment: "Procesar pago ficticio",
  getPayment: "Consultar pago",
};
export function OperationPanel({ onComplete }: { onComplete: () => void }) {
  const [service, setService] = useState<ServiceId>("inventory");
  const [operation, setOperation] = useState("listProducts");
  const [values, setValues] = useState<Record<string, string>>({
    productId: "SKU-001",
    quantity: "1",
    orderId: "DEMO-ORDER",
    amount: "12.50",
    paymentId: "",
  });
  const [result, setResult] = useState<OperationResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function execute(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    const current = new AbortController();
    controller.current = current;
    const params = Object.fromEntries(
      operations[service][operation].map((key) => [
        key,
        ["quantity", "amount"].includes(key)
          ? Number(values[key])
          : values[key],
      ]),
    );
    try {
      const response = await api.execute(
        service,
        operation,
        Object.keys(params).length ? [params] : [],
        current.signal,
      );
      if (!current.signal.aborted) setResult(response);
    } catch (e) {
      if (!current.signal.aborted) {
        setError(e instanceof Error ? e.message : "La operación falló.");
        if (e instanceof ApiError && e.result) setResult(e.result);
      }
    } finally {
      if (!current.signal.aborted) {
        setBusy(false);
        onComplete();
      }
    }
  }
  return (
    <section className="panel operation-panel">
      <div className="section-heading">
        <div>
          <h2>Probar operación</h2>
          <p>Datos ficticios · todas las llamadas pasan por LoggingProxy</p>
        </div>
        <span className="small-label">DEMOSTRACIÓN</span>
      </div>
      <form className="operation-form" onSubmit={execute}>
        <label>
          Servicio
          <select
            disabled={busy}
            value={service}
            onChange={(e) => {
              const id = e.target.value as ServiceId;
              setService(id);
              setOperation(Object.keys(operations[id])[0]);
              setResult(null);
              setError("");
            }}
          >
            {Object.entries(names).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Operación
          <select
            disabled={busy}
            value={operation}
            onChange={(e) => {
              setOperation(e.target.value);
              setResult(null);
              setError("");
            }}
          >
            {Object.keys(operations[service]).map((op) => (
              <option key={op} value={op}>
                {operationNames[op]}
              </option>
            ))}
          </select>
        </label>
        {operations[service][operation].map((key) => (
          <label key={key}>
            {labels[key]}
            <input
              required
              disabled={busy}
              type={["quantity", "amount"].includes(key) ? "number" : "text"}
              min={
                ["quantity", "amount"].includes(key)
                  ? key === "amount"
                    ? "0.01"
                    : "1"
                  : undefined
              }
              step={
                key === "amount" ? "0.01" : key === "quantity" ? "1" : undefined
              }
              maxLength={100}
              value={values[key]}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
            />
          </label>
        ))}
        <button className="primary" disabled={busy}>
          {busy ? "Ejecutando…" : "Ejecutar"}
        </button>
      </form>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
      {result && (
        <div className="operation-result">
          <p>
            ID de solicitud: <code>{result.requestId}</code>
          </p>
          <pre>{json(result)}</pre>
        </div>
      )}
    </section>
  );
}
