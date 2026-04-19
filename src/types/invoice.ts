export type InvoiceStatus = "paid" | "unpaid";

export interface Invoice {
  id: string;
  _id: string;
  issuedAt: string;
  invoiceDate: string;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  paid: boolean;
  url: string | null;
}
