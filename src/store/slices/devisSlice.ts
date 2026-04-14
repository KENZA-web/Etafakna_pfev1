import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Devis } from '../../types';

const initialDevis: Devis[] = [
  { id: 'DEV-2026-018', client: 'TechCorp SARL', co: 'Entreprise tech', ttc: 3332, date: '2026-03-22', status: 'pending', desc: 'Audit conformité fiscale', converted: false, lines: [] },
  { id: 'DEV-2026-017', client: 'StartupHub Tunisia', co: 'Incubateur', ttc: 1428, date: '2026-03-18', status: 'draft', desc: 'Formation droit du travail', converted: false, lines: [] },
  { id: 'DEV-2026-016', client: 'Avocats Associés', co: 'Cabinet juridique', ttc: 6545, date: '2026-03-10', status: 'signed', desc: 'Contrats partenariat long terme', converted: true, convertedTo: 'FAC-2026-027', lines: [] },
];

const devisSlice = createSlice({
  name: 'devis',
  initialState: initialDevis,
  reducers: {
    addDevis: (state, action: PayloadAction<Devis>) => {
      state.unshift(action.payload);
    },
    convertDevis: (state, action: PayloadAction<{ id: string; invoiceId: string }>) => {
      const devis = state.find(d => d.id === action.payload.id);
      if (devis && !devis.converted) {
        devis.converted = true;
        devis.convertedTo = action.payload.invoiceId;
      }
    },
  },
});

export const { addDevis, convertDevis } = devisSlice.actions;
export default devisSlice.reducer;