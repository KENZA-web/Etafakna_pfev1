import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Invoice, InvoiceStatus } from '../../types';
import api from '../../services/api';

export const fetchInvoices = createAsyncThunk('invoices/fetchAll', async () => {
  const response = await api.get<{ success: boolean; data: any[]; meta?: any }>('/invoices');
  console.log('✅ API Response (invoices):', response);
  console.log('📦 response.data:', response.data);
  const rawData = response.data.data;
  // Transforme l'objet client en son nom pour éviter les erreurs React "Objects are not valid as a React child"
  const transformedData = rawData.map((invoice: any) => ({
    ...invoice,
    client: invoice.client?.name || invoice.client || '—',
  }));
  console.log('📤 Retourné au reducer:', transformedData);
  return transformedData;
});

export const createInvoice = createAsyncThunk('invoices/create', async (payload: Invoice) => {
  const response = await api.post<{ success: boolean; data: Invoice }>('/invoices', payload);
  return response.data.data;
});

export const editInvoice = createAsyncThunk('invoices/update', async (payload: Invoice) => {
  const response = await api.put<{ success: boolean; data: Invoice }>(`/invoices/${payload.id}`, payload);
  return response.data.data;
});

export const removeInvoice = createAsyncThunk('invoices/delete', async (id: string) => {
  await api.delete(`/invoices/${id}`);
  return id;
});

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState: [] as Invoice[],
  reducers: {
    updateInvoiceStatus: (state, action: PayloadAction<{ id: string; status: InvoiceStatus; lc: number }>) => {
      const invoice = state.find((i) => i.id === action.payload.id);
      if (invoice) {
        invoice.status = action.payload.status;
        invoice.lc = action.payload.lc;
        if (action.payload.status === 'PAID') {
          invoice.paidDate = new Date().toISOString().slice(0, 10);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.fulfilled, (_, action) => action.payload)
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.unshift(action.payload);
      })
      .addCase(editInvoice.fulfilled, (state, action) => {
        const index = state.findIndex((invoice) => invoice.id === action.payload.id);
        if (index !== -1) state[index] = action.payload;
      })
      .addCase(removeInvoice.fulfilled, (state, action) => state.filter((i) => i.id !== action.payload));
  },
});

export const { updateInvoiceStatus } = invoicesSlice.actions;
export default invoicesSlice.reducer;