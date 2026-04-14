import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Client } from '../../types';

const initialClients: Client[] = [
  { id: 'c1', name: 'TechCorp SARL', co: 'Entreprise technologique', email: 'contact@techcorp.tn', phone: '+216 71 100 001', taxId: '1234567A/PM/000', addr: '12 Rue de la Technologie', city: 'Tunis', factures: 12, ca: '18 400', color: '#4f46e5', notes: 'Client prioritaire' },
  { id: 'c2', name: 'Avocats Associés', co: 'Cabinet juridique', email: 'info@avocats.tn', phone: '+216 71 200 002', taxId: '9876543B/PM/000', addr: '45 Av. H. Bourguiba', city: 'Sfax', factures: 8, ca: '12 600', color: '#7c3aed', notes: '' },
  { id: 'c3', name: 'StartupHub Tunisia', co: 'Incubateur de startups', email: 'hello@startuphub.tn', phone: '+216 71 300 003', taxId: '5432109C/PM/000', addr: '8 Rue Innovation', city: 'Sousse', factures: 5, ca: '7 200', color: '#059669', notes: '' },
  { id: 'c4', name: 'Digital Solutions', co: 'Agence digitale & Web', email: 'contact@digital.tn', phone: '+216 71 400 004', taxId: '3210987D/PM/000', addr: '22 Rue du Commerce', city: 'Bizerte', factures: 3, ca: '4 500', color: '#d97706', notes: 'Paiements parfois en retard' },
];

const clientsSlice = createSlice({
  name: 'clients',
  initialState: initialClients,
  reducers: {
    addClient: (state, action: PayloadAction<Client>) => {
      state.push(action.payload);
    },
    updateClient: (state, action: PayloadAction<Client>) => {
      const index = state.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    deleteClient: (state, action: PayloadAction<string>) => {
      const index = state.findIndex(c => c.id === action.payload);
      if (index !== -1) {
        state.splice(index, 1);
      }
    },
  },
});

export const { addClient, updateClient, deleteClient } = clientsSlice.actions;
export default clientsSlice.reducer;