import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UiState {
  currentPage: 'dashboard' | 'factures' | 'devis' | 'clients' | 'nouvelle-facture' | 'modifier-facture' | 'nouveau-devis' | 'modifier-devis';
  isMenuOpen: boolean;
  isModalOpen: boolean;
  modalType: 'client' | 'invoice' | 'devis' | null;
  modalData: any | null;
  isAIModalOpen: boolean;
  aiDocRef: { id: string; type: 'invoice' | 'devis' } | null;
  toasts: Toast[];
}

const initialState: UiState = {
  currentPage: 'dashboard',
  isMenuOpen: false,
  isModalOpen: false,
  modalType: null,
  modalData: null,
  isAIModalOpen: false,
  aiDocRef: null,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<UiState['currentPage']>) => {
      state.currentPage = action.payload;
    },
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen;
    },
    setMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMenuOpen = action.payload;
    },
    openModal: (state, action: PayloadAction<{ type: UiState['modalType']; data?: any }>) => {
      state.isModalOpen = true;
      state.modalType = action.payload.type;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.modalType = null;
      state.modalData = null;
    },
    openAIModal: (state, action: PayloadAction<{ id: string; type: 'invoice' | 'devis' }>) => {
      state.isAIModalOpen = true;
      state.aiDocRef = action.payload;
    },
    closeAIModal: (state) => {
      state.isAIModalOpen = false;
      state.aiDocRef = null;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = Date.now().toString();
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  setCurrentPage,
  toggleMenu,
  setMenuOpen,
  openModal,
  closeModal,
  openAIModal,
  closeAIModal,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;