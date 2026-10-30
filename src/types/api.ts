export type ServiceId = "inventory" | "orders" | "payments";
export type Status = "SUCCESS" | "ERROR";
export interface AuditLog {
  serviceId: ServiceId;
  operation: string;
  durationMs: number;
  status: Status;
  requestId: string;
  timestamp: string;
  inputParams: unknown;
  response: unknown;
  errorCode: string | null;
  errorMessage: string | null;
  stackTraceSummary: string | null;
}
export interface ServiceSummary {
  serviceId: ServiceId;
  totalCalls: number;
  successCount: number;
  errorCount: number;
  successRate: number | null;
  errorRate: number | null;
  averageDurationMs: number | null;
  recentCalls: AuditLog[];
}
export interface LogPage {
  content: AuditLog[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface Filters {
  service: string;
  status: string;
  from: string;
  to: string;
  page: number;
}
export interface Batch {
  batchId: string;
  requestedCalls: number;
  completedCalls: number;
  successCount: number;
  errorCount: number;
  startedAt: string;
  finishedAt: string;
}
export interface OperationResult {
  requestId: string;
  response?: unknown;
  errorCode?: string;
  errorMessage?: string;
}
