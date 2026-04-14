import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import invoicesReducer from './slices/invoicesSlice';
import devisReducer from './slices/devisSlice';
import clientsReducer from './slices/clientsSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    invoices: invoicesReducer,
    devis: devisReducer,
    clients: clientsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;