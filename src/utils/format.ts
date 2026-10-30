import type { ServiceId } from "../types/api";
export const names: Record<ServiceId, string> = {
  inventory: "Inventario",
  orders: "Pedidos",
  payments: "Pagos",
};
export const colors: Record<ServiceId, string> = {
  inventory: "#6354df",
  orders: "#159f9a",
  payments: "#d18a20",
};
export const requiresAttention = (rate: number | null) =>
  rate !== null && rate > 15;
export const percent = (value: number | null) =>
  value === null ? "Sin datos" : `${value.toFixed(1)} %`;
export const duration = (value: number | null) =>
  value === null ? "Sin datos" : `${value.toFixed(2)} ms`;
export const dateTime = (value: string) =>
  new Date(value).toLocaleString("es-CO");
export const statusName = (value: string) =>
  value === "SUCCESS" ? "Éxito" : "Error";
export const json = (value: unknown) =>
  JSON.stringify(value, null, 2) ?? "Sin respuesta";
