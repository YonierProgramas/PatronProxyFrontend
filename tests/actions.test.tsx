import { render, screen, fireEvent, act } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { OperationPanel } from "../src/components/OperationPanel";
import { Dashboard } from "../src/pages/Dashboard";
import { api } from "../src/api/client";
vi.mock("../src/api/client", () => ({
  api: { execute: vi.fn(), simulate: vi.fn() },
  ApiError: class extends Error {},
}));
vi.mock("../src/hooks/useDashboard", () => ({
  useDashboard: () => ({
    summary: [],
    logs: null,
    error: "",
    updating: false,
    updatedAt: null,
  }),
}));
vi.mock("../src/components/DurationChart", () => ({
  DurationChart: () => null,
}));
it("executes a manual operation through the API and displays its ID", async () => {
  vi.mocked(api.execute).mockResolvedValue({
    requestId: "manual-id",
    response: [],
  });
  const completed = vi.fn();
  render(<OperationPanel onComplete={completed} />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar" }));
  });
  expect(api.execute).toHaveBeenCalledWith(
    "inventory",
    "listProducts",
    [],
    expect.any(AbortSignal),
  );
  expect(screen.getByText("manual-id")).toBeInTheDocument();
  expect(completed).toHaveBeenCalledOnce();
});
it("simulates only on click, disables while running and displays counts", async () => {
  let resolve!: (value: Awaited<ReturnType<typeof api.simulate>>) => void;
  vi.mocked(api.simulate).mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  render(<Dashboard />);
  expect(api.simulate).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: /Simular carga/ }));
  expect(
    screen.getByRole("button", { name: /Simulación en curso/ }),
  ).toBeDisabled();
  await act(async () => {
    resolve({
      batchId: "batch-id",
      requestedCalls: 50,
      completedCalls: 50,
      successCount: 48,
      errorCount: 2,
      startedAt: "",
      finishedAt: "",
    });
  });
  expect(
    screen.getByText(/50 llamadas · 48 éxitos · 2 errores/),
  ).toBeInTheDocument();
});
