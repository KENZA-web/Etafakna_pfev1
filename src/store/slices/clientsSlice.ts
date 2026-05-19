import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Client } from '../../types';
import api from '../../services/api';

// Plus de dedupeRequest pour être sûr de recevoir la vraie réponse
export const fetchClients = createAsyncThunk('clients/fetchAll', async () => {
  const response = await api.get<{ success: boolean; data: any[] }>('/clients');
  const raw = Array.isArray(response.data) ? response.data : response.data?.data || [];
  return raw.map((c: any) => ({
    ...c,
    factures: c.invoiceCount ?? c._count?.invoices ?? 0,
    ca: c.ca != null ? Number(c.ca).toFixed(3) : '0.000',
    color: c.color || '#4f46e5',
    co: c.co || '',
    city: c.city || '',
    country: c.country || c.countryCode || 'TN',
  }));
});

export const createClient = createAsyncThunk('clients/create', async (payload: Client) => {
  const response = await api.post<{ success: boolean; data: Client }>('/clients', payload);
  return response.data.data;
});

export const editClient = createAsyncThunk('clients/update', async (payload: Client) => {
  const response = await api.put<{ success: boolean; data: Client }>(`/clients/${payload.id}`, payload);
  return response.data.data;
});

export const removeClient = createAsyncThunk('clients/delete', async (id: string) => {
  await api.delete(`/clients/${id}`);
  return id;
});

const clientsSlice = createSlice({
  name: 'clients',
  initialState: [] as Client[],
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.fulfilled, (_, action) => action.payload)
      .addCase(createClient.fulfilled, (state, action) => {
        state.push(action.payload);
      })
      .addCase(editClient.fulfilled, (state, action) => {
        const index = state.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state[index] = { ...state[index], ...action.payload };
      })
      .addCase(removeClient.fulfilled, (state, action) => state.filter((c) => c.id !== action.payload));
  },
});

export default clientsSlice.reducer;