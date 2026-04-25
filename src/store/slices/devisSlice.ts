import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Devis } from '../../types';
import api from '../../services/api';
import { dedupeRequest } from '../../services/requestCache';

// ─── Thunks ─────────────────────────────────

// Fetch : transformation comme pour les invoices
export const fetchQuotations = createAsyncThunk('devis/fetchAll', async () => {
  return dedupeRequest('quotations', async () => {
    const response = await api.get<{ success: boolean; data: any[] }>('/quotations');
    const rawData = response.data.data;
    const transformedData = rawData.map((q: any) => ({
      ...q,
      client: q.client?.name || q.client || '—',
    }));
    return transformedData;
  });
});

// Create : normaliser le client avant d'ajouter au state
export const createQuotation = createAsyncThunk('devis/create', async (payload: any) => {
  const response = await api.post<{ success: boolean; data: any }>('/quotations', payload);
  const quotation = response.data.data;
  const normalized = {
    ...quotation,
    client: quotation.client?.name || quotation.client || '—',
  };
  return normalized;
});

// Edit : pareil
export const editQuotation = createAsyncThunk('devis/update', async (payload: Devis) => {
  const response = await api.put<{ success: boolean; data: any }>(`/quotations/${payload.id}`, payload);
  const quotation = response.data.data;
  const normalized = {
    ...quotation,
    client: quotation.client?.name || quotation.client || '—',
  };
  return normalized;
});

// Delete : inchangé
export const removeQuotation = createAsyncThunk('devis/delete', async (id: string) => {
  await api.delete(`/quotations/${id}`);
  return id;
});

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
      .addCase(removeQuotation.fulfilled, (state, action) => state.filter((d) => d.id !== action.payload));
  },
});

export default devisSlice.reducer;