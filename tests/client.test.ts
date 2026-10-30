// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { api, ApiError } from "../src/api/client";
const emptyFilters = { service: "", status: "", from: "", to: "", page: 0 };
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("shows a configuration error without making requests when the origin is missing", async () => {
  vi.stubEnv("VITE_API_BASE_URL", "");
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  await expect(api.summary(new AbortController().signal)).rejects.toThrow(
    "Falta configurar VITE_API_BASE_URL",
  );
  expect(fetchMock).not.toHaveBeenCalled();
});
it("centralizes api paths, converts dates to UTC and preserves filters", async () => {
  vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ content: [] }) });
  vi.stubGlobal("fetch", fetchMock);
  await api.logs(
    {
      ...emptyFilters,
      service: "payments",
      status: "ERROR",
      from: "2026-01-01T00:00",
      page: 2,
    },
    new AbortController().signal,
  );
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.pathname).toBe("/api/metrics/logs");
  expect(url.searchParams.get("page")).toBe("2");
  expect(url.searchParams.get("service")).toBe("payments");
  expect(url.searchParams.get("status")).toBe("ERROR");
  expect(url.searchParams.get("from")).toBe(
    new Date("2026-01-01T00:00").toISOString(),
  );
});
it("preserves typed error and operation requestId", async () => {
  vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          requestId: "test-id",
          errorCode: "SIMULATED_FAILURE",
          errorMessage: "Fallo simulado",
        }),
      }),
  );
  try {
    await api.execute(
      "payments",
      "processPayment",
      [{ orderId: "DEMO", amount: 5 }],
      new AbortController().signal,
    );
    throw new Error("Expected failure");
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).result?.requestId).toBe("test-id");
  }
});
it("reports a network disconnection", async () => {
  vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network")));
  await expect(api.summary(new AbortController().signal)).rejects.toThrow(
    "Sin conexión con el backend",
  );
});

it("shows a Spanish error for an invalid backend JSON response", async () => {
  vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError("Unexpected token"); } }));
  await expect(api.summary(new AbortController().signal)).rejects.toThrow("La respuesta del backend no tiene un formato JSON válido.");
});
