import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Invoice } from '../../types';

const initialInvoices: Invoice[] = [
  // Payées (4)
  { id: 'FAC-2026-034', client: 'TechCorp SARL', co: 'Entreprise tech', ht: 3200, ttc: 3987.5, date: '2026-03-20', due: '2026-04-20', status: 'paid', lc: 4, desc: 'Prestation conseil juridique — Mars 2026', payDate: '2026-03-28' },
  { id: 'FAC-2026-032', client: 'StartupHub Tunisia', co: 'Incubateur', ht: 950, ttc: 1131.5, date: '2026-03-15', due: '2026-04-15', status: 'paid', lc: 4, desc: 'Formation équipe RH', payDate: '2026-03-22' },
  { id: 'FAC-2026-029', client: 'StartupHub Tunisia', co: 'Incubateur', ht: 780, ttc: 929.2, date: '2026-02-28', due: '2026-03-28', status: 'paid', lc: 4, desc: 'Veille réglementaire', payDate: '2026-03-05' },
  { id: 'FAC-2026-028', client: 'Avocats Associés', co: 'Cabinet juridique', ht: 3400, ttc: 4047, date: '2026-02-20', due: '2026-03-20', status: 'paid', lc: 4, desc: 'Médiation contrat commercial', payDate: '2026-03-02' },
  // En attente (1)
  { id: 'FAC-2026-033', client: 'Avocats Associés', co: 'Cabinet juridique', ht: 1800, ttc: 2143, date: '2026-03-18', due: '2026-04-18', status: 'pending', lc: 2, desc: 'Mission audit contrats' },
  // Signée (1)
  { id: 'FAC-2026-035', client: 'Digital Solutions', co: 'Agence digitale', ht: 2500, ttc: 2975, date: '2026-03-25', due: '2026-04-25', status: 'signed', lc: 3, desc: 'Consultation stratégique', payDate: undefined },
  // Refusée (1)
  { id: 'FAC-2026-036', client: 'TechCorp SARL', co: 'Entreprise tech', ht: 1200, ttc: 1428, date: '2026-03-28', due: '2026-04-28', status: 'refused', lc: 1, desc: 'Devis non conforme', payDate: undefined },
];

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState: initialInvoices,
  reducers: {
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.unshift(action.payload);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.findIndex(invoice => invoice.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    updateInvoiceStatus: (state, action: PayloadAction<{ id: string; status: Invoice['status']; lc: number }>) => {
      const invoice = state.find(i => i.id === action.payload.id);
      if (invoice) {
        invoice.status = action.payload.status;
        invoice.lc = action.payload.lc;
        if (action.payload.status === 'paid') {
          invoice.payDate = new Date().toISOString().slice(0, 10);
        }
      }
    },
  },
});

export const { addInvoice, updateInvoice, updateInvoiceStatus } = invoicesSlice.actions;
export default invoicesSlice.reducer;