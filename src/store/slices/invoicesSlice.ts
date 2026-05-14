import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Invoice, InvoiceStatus } from '../../types';
import api from '../../services/api';

// ─── Helpers ────────────────────────────────
const normalizeInvoice = (invoice: any): Invoice => ({
  ...invoice,
  client: invoice.client?.name || invoice.client || '—',
});

// ─── Thunks ─────────────────────────────────

export const fetchInvoices = createAsyncThunk('invoices/fetchAll', async () => {
  const response = await api.get<{ success: boolean; data: any[]; meta?: any }>('/invoices');
  return (response.data.data || []).map(normalizeInvoice);
});

export const createInvoice = createAsyncThunk('invoices/create', async (payload: any) => {
  const response = await api.post<{ success: boolean; data: any }>('/invoices', payload);
  return normalizeInvoice(response.data.data);
});

export const editInvoice = createAsyncThunk('invoices/update', async (payload: any) => {
  const response = await api.put<{ success: boolean; data: any }>(`/invoices/${payload.id}`, payload);
  return normalizeInvoice(response.data.data);
});

export const removeInvoice = createAsyncThunk('invoices/delete', async (id: string) => {
  await api.delete(`/invoices/${id}`);
  return id;
});

// ── Transitions de statut ───────────────────

export const validateInvoice = createAsyncThunk(
  'invoices/validate',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: any }>(`/invoices/${id}/validate`);
      return normalizeInvoice(response.data.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Erreur lors de la validation');
    }
  },
);

export const payInvoice = createAsyncThunk(
  'invoices/pay',
  async (payload: { id: string; paidDate: string; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: any }>(`/invoices/${payload.id}/pay`, {
        paidDate: payload.paidDate,
        notes: payload.notes,
      });
      return normalizeInvoice(response.data.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Erreur lors du paiement');
    }
  },
);

export const cancelInvoice = createAsyncThunk(
  'invoices/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: any }>(`/invoices/${id}/cancel`);
      return normalizeInvoice(response.data.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || "Erreur lors de l'annulation");
    }
  },
);

// ─── Slice ──────────────────────────────────

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState: [] as Invoice[],
  reducers: {
    // Gardé pour compatibilité avec le code existant
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
        const index = state.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) state[index] = action.payload;
      })
      .addCase(removeInvoice.fulfilled, (state, action) =>
        state.filter((i) => i.id !== action.payload),
      )
      // Transitions de statut — mise à jour du store avec la réponse API
      .addCase(validateInvoice.fulfilled, (state, action) => {
        const index = state.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) state[index] = action.payload;
      })
      .addCase(payInvoice.fulfilled, (state, action) => {
        const index = state.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) state[index] = action.payload;
      })
      .addCase(cancelInvoice.fulfilled, (state, action) => {
        const index = state.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) state[index] = action.payload;
      });
  },
});

export const { updateInvoiceStatus } = invoicesSlice.actions;
export default invoicesSlice.reducer;
