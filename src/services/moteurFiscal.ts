import api from './api';

export interface FiscalAnalysis {
  subtotal: number;
  tvaRate: number;
  tvaAmount: number;
  timbreAmount: number;
  rasRate: number;
  rasAmount: number;
  total: number;
  suggestions?: string[];
}

export async function analyzeFiscal(invoiceId: string): Promise<FiscalAnalysis> {
  const { data } = await api.get<FiscalAnalysis>(`/invoices/${invoiceId}/validate-taxes`);
  return data;
}