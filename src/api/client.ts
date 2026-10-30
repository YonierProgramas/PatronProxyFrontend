import type {
  Batch,
  Filters,
  LogPage,
  OperationResult,
  ServiceId,
  ServiceSummary,
} from "../types/api";
export class ApiError extends Error {
  constructor(
    message: string,
    public result?: OperationResult,
  ) {
    super(message);
  }
}
function origin() {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (!configured)
    throw new ApiError(
      "Falta configurar VITE_API_BASE_URL con el origen de la API.",
    );
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new ApiError("VITE_API_BASE_URL debe ser una URL válida.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new ApiError(
      "VITE_API_BASE_URL debe contener solo el origen de la API.",
    );
  return url.origin;
}
async function request<T>(
  path: string,
  signal?: AbortSignal,
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${origin()}/api${path}`, {
      signal,
      method: body === undefined ? "GET" : "POST",
      ...(body === undefined
        ? {}
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
    });
  } catch (error) {
    if (
      error instanceof ApiError ||
      (error instanceof Error && error.name === "AbortError")
    )
      throw error;
    throw new ApiError(
      "Sin conexión con el backend. Verifica que la API esté disponible.",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiError("La respuesta del backend no tiene un formato JSON válido.");
  }
  if (!response.ok)
    throw new ApiError(
      data.errorMessage || `La API respondió con error ${response.status}.`,
      data,
    );
  return data as T;
}
export const api = {
  summary: (signal: AbortSignal) =>
    request<ServiceSummary[]>("/metrics/summary", signal),
  logs: (filters: Filters, signal: AbortSignal) => {
    const query = new URLSearchParams({
      page: String(filters.page),
      size: "10",
    });
    for (const key of ["service", "status"] as const)
      if (filters[key]) query.set(key, filters[key]);
    for (const key of ["from", "to"] as const)
      if (filters[key]) query.set(key, new Date(filters[key]).toISOString());
    return request<LogPage>(`/metrics/logs?${query}`, signal);
  },
  simulate: (signal: AbortSignal) =>
    request<Batch>("/metrics/simulate-load", signal, {}),
  execute: (
    service: ServiceId,
    operation: string,
    params: unknown[],
    signal: AbortSignal,
  ) =>
    request<OperationResult>(`/services/${service}/${operation}`, signal, {
      params,
    }),
};
