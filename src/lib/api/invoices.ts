import { apiClient } from "./client";
import { Invoice, InvoiceStatus } from "@/types/invoice";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
}

function readString(record: UnknownRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function readNumber(record: UnknownRecord, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function readBoolean(record: UnknownRecord, keys: string[]): boolean | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      if (value.toLowerCase() === "true") {
        return true;
      }

      if (value.toLowerCase() === "false") {
        return false;
      }
    }
  }

  return null;
}

function normalizeStatus(record: UnknownRecord): InvoiceStatus {
  const status = readString(record, ["status", "paymentStatus"]);
  if (status) {
    const normalized = status.trim().toLowerCase();
    if (normalized === "paid") {
      return "paid";
    }
    if (normalized === "unpaid") {
      return "unpaid";
    }
  }

  const paid = readBoolean(record, ["paid", "isPaid"]);
  return paid ? "paid" : "unpaid";
}

function normalizeInvoice(input: unknown): Invoice {
  const record = asRecord(input) ?? {};
  const id = readString(record, ["_id", "id"]) ?? "";
  const status = normalizeStatus(record);

  return {
    id,
    _id: id,
    issuedAt:
      readString(record, ["date", "issuedAt", "invoiceDate", "createdAt"]) ??
      "",
    totalAmount:
      readNumber(record, [
        "totalAmount",
        "amount",
        "total",
        "grandTotal",
        "total_amount",
      ]) ?? 0,
    currency: readString(record, ["currency"]) ?? "USD",
    status,
    paid: status === "paid",
    url:
      readString(record, ["url", "invoiceUrl", "hostedInvoiceUrl", "pdfUrl"]) ??
      null,
  };
}

function normalizeInvoiceCollection(input: unknown): Invoice[] {
  if (Array.isArray(input)) {
    return input.map(normalizeInvoice).filter((invoice) => invoice.id);
  }

  const record = asRecord(input);
  const nestedInvoices = record?.invoices;

  if (Array.isArray(nestedInvoices)) {
    return nestedInvoices
      .map(normalizeInvoice)
      .filter((invoice) => invoice.id);
  }

  return [];
}

export async function fetchStudentInvoices(
  studentId: string,
): Promise<Invoice[]> {
  const response = await apiClient.get<Invoice[]>(
    `/invoices/student/${studentId}`,
  );
  return response.data;
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
): Promise<Invoice> {
  const response = await apiClient.patch<unknown>(
    `/invoices/${invoiceId}/status`,
    {
      status,
      paid: status === "paid",
    },
  );

  return normalizeInvoice(asRecord(response.data)?.invoice ?? response.data);
}

export async function resendInvoiceEmail(
  invoiceId: string,
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    `/invoices/${invoiceId}/resend`,
  );
  return response.data;
}
