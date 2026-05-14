import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Devis } from '../../types';
import api from '../../services/api';
import { dedupeRequest } from '../../services/requestCache';

// ─── Helpers ────────────────────────────────
const normalizeQuotation = (q: any): Devis => ({
  ...q,
  client: q.client?.name || q.client || '—',
});

// ─── Thunks ─────────────────────────────────

export const fetchQuotations = createAsyncThunk('devis/fetchAll', async () => {
  return dedupeRequest('quotations', async () => {
    const response = await api.get<{ success: boolean; data: any[] }>('/quotations');
    return (response.data.data || []).map(normalizeQuotation);
  });
});

export const createQuotation = createAsyncThunk('devis/create', async (payload: any) => {
  const response = await api.post<{ success: boolean; data: any }>('/quotations', payload);
  return normalizeQuotation(response.data.data);
});

export const editQuotation = createAsyncThunk('devis/update', async (payload: any) => {
  const response = await api.put<{ success: boolean; data: any }>(`/quotations/${payload.id}`, payload);
  return normalizeQuotation(response.data.data);
});

export const removeQuotation = createAsyncThunk('devis/delete', async (id: string) => {
  await api.delete(`/quotations/${id}`);
  return id;
});

// ── Transitions de statut ───────────────────

export const sendQuotation = createAsyncThunk(
  'devis/send',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: any }>(`/quotations/${id}/send`);
      return normalizeQuotation(response.data.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || "Erreur lors de l'envoi");
    }
  },
);

export const acceptQuotation = createAsyncThunk(
  'devis/accept',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: any }>(`/quotations/${id}/accept`);
      return normalizeQuotation(response.data.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || "Erreur lors de l'acceptation");
    }
  },
);

export const refuseQuotation = createAsyncThunk(
  'devis/refuse',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.post<{ success: boolean; data: any }>(`/quotations/${id}/refuse`);
      return normalizeQuotation(response.data.data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Erreur lors du refus');
    }
  },
);

export const convertQuotation = createAsyncThunk(
  'devis/convert',
  async (
    payload: { id: string; invoiceIssueDate: string; invoiceDueDate: string; notes?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post<{ success: boolean; data: any }>(
        `/quotations/${payload.id}/convert`,
        {
          invoiceIssueDate: payload.invoiceIssueDate,
          invoiceDueDate: payload.invoiceDueDate,
          notes: payload.notes,
        },
      );
      // Retourne l'id du devis pour le marquer CONVERTED dans le store
      return { quotationId: payload.id, invoice: response.data.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Erreur lors de la conversion');
    }
  },
);

// ─── Slice ──────────────────────────────────

const devisSlice = createSlice({
  name: 'devis',
  initialState: [] as Devis[],
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotations.fulfilled, (_, action) => action.payload)
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.unshift(action.payload);
      })
      .addCase(editQuotation.fulfilled, (state, action) => {
        const index = state.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) state[index] = action.payload;
      })
      .addCase(removeQuotation.fulfilled, (state, action) =>
        state.filter((d) => d.id !== action.payload),
      )
      // Transitions de statut
      .addCase(sendQuotation.fulfilled, (state, action) => {
        const index = state.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) state[index] = action.payload;
      })
      .addCase(acceptQuotation.fulfilled, (state, action) => {
        const index = state.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) state[index] = action.payload;
      })
      .addCase(refuseQuotation.fulfilled, (state, action) => {
        const index = state.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) state[index] = action.payload;
      })
      .addCase(convertQuotation.fulfilled, (state, action) => {
        const index = state.findIndex((d) => d.id === action.payload.quotationId);
        if (index !== -1) state[index] = { ...state[index], status: 'CONVERTED' };
      });
  },
});

export default devisSlice.reducer;