import { renderHook, act } from "@testing-library/react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { useDashboard } from "../src/hooks/useDashboard";
import { emptyFilters } from "../src/components/AuditTable";
import { api } from "../src/api/client";
vi.mock("../src/api/client", () => ({
  api: { summary: vi.fn(), logs: vi.fn() },
}));
beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(api.summary).mockResolvedValue([]);
  vi.mocked(api.logs).mockResolvedValue({
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});
it("polls every 3000 ms, preserves page and cleans up", async () => {
  const { unmount } = renderHook(() =>
    useDashboard({ ...emptyFilters, page: 2 }, 0),
  );
  await act(async () => {});
  expect(api.logs).toHaveBeenCalledTimes(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
  expect(api.logs).toHaveBeenCalledTimes(2);
  expect(vi.mocked(api.logs).mock.calls[1][0].page).toBe(2);
  const signal = vi.mocked(api.logs).mock.calls[1][1];
  unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(9000);
  });
  expect(api.logs).toHaveBeenCalledTimes(2);
});
it("does not overlap slow requests", async () => {
  let resolve!: (value: []) => void;
  vi.mocked(api.summary).mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  const { unmount } = renderHook(() => useDashboard(emptyFilters, 0));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(12000);
  });
  expect(api.summary).toHaveBeenCalledTimes(1);
  await act(async () => {
    resolve([]);
  });
  unmount();
});
it("ignores old filter responses", async () => {
  let resolve!: (value: []) => void;
  vi.mocked(api.summary).mockImplementationOnce(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  const { result, rerender, unmount } = renderHook(
    ({ filters }) => useDashboard(filters, 0),
    { initialProps: { filters: emptyFilters } },
  );
  rerender({ filters: { ...emptyFilters, service: "payments" } });
  await act(async () => {
    resolve([]);
  });
  expect(vi.mocked(api.logs).mock.calls.at(-1)?.[0].service).toBe("payments");
  expect(result.current.error).toBe("");
  unmount();
});
it("reports connection errors and keeps old data", async () => {
  const { result, unmount } = renderHook(() => useDashboard(emptyFilters, 0));
  await act(async () => {});
  expect(result.current.updatedAt).not.toBeNull();
  vi.mocked(api.logs).mockRejectedValue(
    new Error("Sin conexión con el backend"),
  );
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
  expect(result.current.error).toBe("Sin conexión con el backend");
  expect(result.current.logs).not.toBeNull();
  unmount();
});

it("waits for the other request when one rejects before scheduling another cycle", async () => {
  let resolve!: (value: Awaited<ReturnType<typeof api.logs>>) => void;
  vi.mocked(api.summary).mockRejectedValue(new Error("Sin conexión"));
  vi.mocked(api.logs).mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  const { unmount } = renderHook(() => useDashboard(emptyFilters, 0));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(9000);
  });
  expect(api.summary).toHaveBeenCalledTimes(1);
  expect(api.logs).toHaveBeenCalledTimes(1);
  await act(async () => {
    resolve({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });
  });
  unmount();
});
