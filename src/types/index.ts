export interface Client {
  id: string;
  name: string;
  co: string;
  email: string;
  phone: string;
  taxId: string;
  addr: string;
  city: string;
  country?: string;
  notes?: string;
  color: string;
  factures: number;
  ca: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export interface Invoice {
  id: string;
  client: string;
  co: string;
  ht: number;
  ttc: number;
  date: string;
  due: string;
  status: 'paid' | 'pending' | 'draft' | 'refused' | 'signed';
  lc: number;
  desc: string;
  payDate?: string;
  lines?: LineItem[];
}

export interface Devis {
  id: string;
  client: string;
  co: string;
  ttc: number;
  date: string;
  status: 'draft' | 'pending' | 'signed' | 'refused';
  desc: string;
  converted: boolean;
  convertedTo?: string;
  lines?: LineItem[];
}

export interface ConversionHistory {
  devId: string;
  facId: string;
  client: string;
  amt: number;
  date: string;
}