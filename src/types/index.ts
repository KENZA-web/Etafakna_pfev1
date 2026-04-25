export interface Client {
  id: string;
  name: string;
  co: string;
  email: string | null;
  phone: string;
  taxId: string;
  address: string;
  city: string;
  country?: string;
  notes?: string;
  color: string;
  factures: number;
  ca: string;
}

export type VatRate = 'ZERO' | 'SEVEN' | 'THIRTEEN' | 'NINETEEN';
export type Currency = 'TND' | 'EUR' | 'USD';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: VatRate;
  lineTotal: number;
}

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';

export interface Invoice {
  id: string;
  client: string;
  co: string;
  subtotal: number;
  total: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lc: number;
  notes: string;
  paidDate?: string;
  currency?: Currency;
  clientEmail?: string | null;
  lines?: LineItem[];
}

export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REFUSED' | 'CONVERTED';

export interface Devis {
  id: string;
  client: string;
  co: string;
  total: number;
  issueDate: string;
  status: QuotationStatus;
  notes: string;
  converted: boolean;
  convertedToInvoiceId?: string;
  currency?: Currency;
  lines?: LineItem[];
}

export interface ConversionHistory {
  devId: string;
  facId: string;
  client: string;
  amt: number;
  date: string;
}