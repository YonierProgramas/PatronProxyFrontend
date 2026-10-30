import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ServiceCards } from "../src/components/ServiceCards";
import { AuditTable, emptyFilters } from "../src/components/AuditTable";
import { requiresAttention, statusName } from "../src/utils/format";
import type { AuditLog, ServiceSummary } from "../src/types/api";
const log: AuditLog = {
  serviceId: "inventory",
  operation: "getStock",
  durationMs: 2,
  status: "SUCCESS",
  requestId: "12345678-1234-1234-1234-123456789abc",
  timestamp: "2026-01-01T00:00:00Z",
  inputParams: [{ productId: "SKU-001" }],
  response: { stock: 30 },
  errorCode: null,
  errorMessage: null,
  stackTraceSummary: null,
};
const summary: ServiceSummary = {
  serviceId: "inventory",
  totalCalls: 20,
  successCount: 17,
  errorCount: 3,
  successRate: 85,
  errorRate: 15,
  averageDurationMs: 2,
  recentCalls: [log],
};
describe("service cards", () => {
  it("renders three cards and empty states", () => {
    render(<ServiceCards summary={[]} />);
    for (const name of ["Inventario", "Pedidos", "Pagos"])
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    expect(screen.getAllByText("Sin datos")).toHaveLength(9);
  });
  it("attention only above 15 percent", () => {
    expect(requiresAttention(15)).toBe(false);
    expect(requiresAttention(15.01)).toBe(true);
    expect(requiresAttention(null)).toBe(false);
    const view = render(<ServiceCards summary={[summary]} />);
    expect(screen.queryByText("Requiere atención")).not.toBeInTheDocument();
    view.rerender(<ServiceCards summary={[{ ...summary, errorRate: 16 }]} />);
    expect(screen.getByText("Requiere atención")).toBeInTheDocument();
  });
  it("translates statuses", () => {
    expect(statusName("SUCCESS")).toBe("Éxito");
    expect(statusName("ERROR")).toBe("Error");
  });
});
describe("audit table", () => {
  it("expands full JSON and request ID", () => {
    render(
      <AuditTable
        logs={{
          content: [log],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        }}
        filters={emptyFilters}
        onChange={() => {}}
        stale={false}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: `Ver detalle ${log.requestId}` }),
    );
    expect(
      screen.getByText(log.requestId, { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText(/"stock": 30/)).toBeInTheDocument();
    expect(screen.getByText(/"productId": "SKU-001"/)).toBeInTheDocument();
    expect(
      screen.getByText("Éxito", { selector: "span.badge" }),
    ).toBeInTheDocument();
  });
  it("combines filters and resets page", () => {
    const changed = vi.fn();
    render(
      <AuditTable
        logs={null}
        filters={{ ...emptyFilters, page: 2 }}
        onChange={changed}
        stale={false}
      />,
    );
    fireEvent.change(screen.getByLabelText("Servicio"), {
      target: { value: "payments" },
    });
    fireEvent.change(screen.getByLabelText("Estado"), {
      target: { value: "ERROR" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }));
    expect(changed).toHaveBeenCalledWith({
      ...emptyFilters,
      service: "payments",
      status: "ERROR",
    });
    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(changed).toHaveBeenLastCalledWith(emptyFilters);
  });
  it("validates date ranges", () => {
    const changed = vi.fn();
    render(
      <AuditTable
        logs={null}
        filters={emptyFilters}
        onChange={changed}
        stale={false}
      />,
    );
    fireEvent.change(screen.getByLabelText("Desde"), {
      target: { value: "2026-01-03T12:00" },
    });
    fireEvent.change(screen.getByLabelText("Hasta"), {
      target: { value: "2026-01-01T12:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(changed).not.toHaveBeenCalled();
  });
  it("changes page and shows empty filtered state", () => {
    const changed = vi.fn();
    render(
      <AuditTable
        logs={{
          content: [],
          page: 1,
          size: 10,
          totalElements: 25,
          totalPages: 3,
        }}
        filters={{ ...emptyFilters, page: 1 }}
        onChange={changed}
        stale={false}
      />,
    );
    expect(
      screen.getByText("Sin resultados para los filtros"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(changed).toHaveBeenCalledWith({ ...emptyFilters, page: 2 });
  });
  it("shows summarized errors in detail", () => {
    render(
      <AuditTable
        logs={{
          content: [
            {
              ...log,
              status: "ERROR",
              errorCode: "SIMULATED_FAILURE",
              errorMessage: "Fallo académico",
              stackTraceSummary: "PaymentService.execute:10",
            },
          ],
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        }}
        filters={emptyFilters}
        onChange={() => {}}
        stale={false}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: `Ver detalle ${log.requestId}` }),
    );
    expect(
      screen.getByText("Error", { selector: "span.badge" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Fallo académico")).toBeInTheDocument();
    expect(screen.getByText("PaymentService.execute:10")).toBeInTheDocument();
  });
});
