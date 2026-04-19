"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import PortalGuard from "@/components/auth/PortalGuard";
import ConfirmActionModal from "@/components/portal/ConfirmActionModal";
import PortalShell from "@/components/portal/PortalShell";
import { fetchStudentById } from "@/lib/api/users";
import {
  fetchStudentInvoices,
  resendInvoiceEmail,
  updateInvoiceStatus,
} from "@/lib/api/invoices";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import { AuthUser } from "@/types/user";

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    const rawMessage = data?.message;

    if (Array.isArray(rawMessage)) {
      return rawMessage.join(", ") || fallback;
    }

    return rawMessage || fallback;
  }

  return fallback;
}

function getStudentDisplayName(student: AuthUser | null) {
  if (!student) {
    return "Student";
  }

  return student.firstName?.trim() || student.email || "Student";
}

function formatInvoiceDate(date: string) {
  if (!date) {
    return "N/A";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

function formatInvoiceAmount(invoice: Invoice) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: invoice.currency || "USD",
    }).format(invoice.totalAmount);
  } catch {
    return `${invoice.currency || "USD"} ${invoice.totalAmount.toFixed(2)}`;
  }
}

export default function StudentInvoicesPage() {
  const params = useParams<{ id: string }>();
  const studentId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [student, setStudent] = useState<AuthUser | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedResendInvoice, setSelectedResendInvoice] =
    useState<Invoice | null>(null);
  const [confirmResendOpen, setConfirmResendOpen] = useState(false);

  useEffect(() => {
    if (!studentId) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setResendSuccess(null);

        const [studentData, invoiceData] = await Promise.all([
          fetchStudentById(studentId),
          fetchStudentInvoices(studentId),
        ]);

        setStudent(studentData);
        setInvoices(invoiceData);
      } catch (error) {
        setError(getApiErrorMessage(error, "Failed to load invoices"));
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [studentId]);

  const title = useMemo(
    () => `${getStudentDisplayName(student)}'s invoices`,
    [student],
  );

  const handleToggleStatus = async () => {
    if (!selectedInvoice) {
      return;
    }

    const nextStatus: InvoiceStatus =
      selectedInvoice.status === "paid" ? "unpaid" : "paid";

    try {
      setStatusLoadingId(selectedInvoice.id);
      setError(null);

      const updatedInvoice = await updateInvoiceStatus(
        selectedInvoice.id,
        nextStatus,
      );

      setInvoices((previous) =>
        previous.map((invoice) =>
          invoice.id === selectedInvoice.id
            ? {
                ...invoice,
                ...updatedInvoice,
                status: updatedInvoice.status || nextStatus,
                paid: (updatedInvoice.status || nextStatus) === "paid",
              }
            : invoice,
        ),
      );

      setSelectedInvoice(null);
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to update invoice status"));
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleResendInvoice = async () => {
    if (!selectedResendInvoice) return;

    try {
      setResendLoading(true);
      setError(null);
      setResendSuccess(null);

      const response = await resendInvoiceEmail(selectedResendInvoice.id);

      setResendSuccess(response.message || "Invoice email resent successfully");
      setConfirmResendOpen(false);
      setSelectedResendInvoice(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as
          | { message?: string | string[] }
          | undefined;
        const rawMessage = data?.message;
        const message = Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : rawMessage || "Failed to resend invoice email";

        setError(message);
      } else {
        setError("Failed to resend invoice email");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <PortalGuard allowedRoles={["teacher", "admin"]}>
      <PortalShell title={title}>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Review invoice history and update payment status for this
                student.
              </p>
            </div>

            <Link
              href="/portal/students"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Back to students
            </Link>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {resendSuccess ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {resendSuccess}
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
            </div>

            <div className="max-h-[560px] overflow-auto">
              {loading ? (
                <div className="p-6 text-sm text-gray-500">
                  Loading invoices...
                </div>
              ) : invoices.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">
                  No invoices found for this student.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {invoices.map((invoice) => {
                      const isPaid = invoice.paid;
                      const isUpdating = statusLoadingId === invoice.id;

                      return (
                        <tr key={invoice.id}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {formatInvoiceDate(invoice.invoiceDate)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            {formatInvoiceAmount(invoice)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                isPaid
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {isPaid ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => setSelectedInvoice(invoice)}
                                className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                                  isPaid
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700"
                                }`}
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : isPaid
                                    ? "Mark Unpaid"
                                    : "Mark Paid"}
                              </button>

                              {!invoice.paid ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedResendInvoice(invoice);
                                    setConfirmResendOpen(true);
                                    setResendSuccess(null);
                                  }}
                                  className="rounded-md border border-blue-300 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                                >
                                  Resend Invoice
                                </button>
                              ) : null}

                              {invoice.url ? (
                                <a
                                  href={invoice.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                                >
                                  View Invoice
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400"
                                >
                                  View Invoice
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <ConfirmActionModal
          open={!!selectedInvoice}
          title={
            selectedInvoice?.status === "paid"
              ? "Mark invoice as unpaid?"
              : "Mark invoice as paid?"
          }
          description={
            selectedInvoice?.status === "paid"
              ? "This invoice will be marked as unpaid."
              : "This invoice will be marked as paid."
          }
          confirmLabel={
            selectedInvoice?.status === "paid" ? "Mark Unpaid" : "Mark Paid"
          }
          confirmClassName={
            selectedInvoice?.status === "paid"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }
          loading={!!selectedInvoice && statusLoadingId === selectedInvoice.id}
          onClose={() => setSelectedInvoice(null)}
          onConfirm={() => {
            void handleToggleStatus();
          }}
        />

        <ConfirmActionModal
          open={confirmResendOpen}
          title="Resend invoice email?"
          description="This will resend the invoice email to the student using the existing stored invoice."
          confirmLabel="Resend invoice"
          loading={resendLoading}
          onClose={() => {
            setConfirmResendOpen(false);
            setSelectedResendInvoice(null);
          }}
          onConfirm={() => {
            void handleResendInvoice();
          }}
        />
      </PortalShell>
    </PortalGuard>
  );
}
