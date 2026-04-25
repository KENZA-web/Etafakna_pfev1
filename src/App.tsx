import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store';
import Toolbar from './components/layout/Toolbar';
import SideMenu from './components/layout/SideMenu';
import Toast from './components/ui/Toast';
import InvoiceModal from './components/modals/InvoiceModal';
import DevisModal from './components/modals/DevisModal';
import { ClientModal } from './components/modals/ClientModal';
import Dashboard from './pages/Dashboard';
import Factures from './pages/Factures';
import Devis from './pages/Devis';
import Clients from './pages/Clients';
import { fetchInvoices } from './store/slices/invoicesSlice';
import { fetchQuotations } from './store/slices/devisSlice';
import { fetchClients } from './store/slices/clientsSlice';






function App() {
  const dispatch = useDispatch<AppDispatch>();
  const currentPage = useSelector((state: RootState) => state.ui.currentPage);
  const { isModalOpen, modalType, modalData } = useSelector((state: RootState) => state.ui);

  const hasLoaded = useRef(false);

useEffect(() => {
  const timer = setTimeout(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      dispatch(fetchInvoices());
      dispatch(fetchQuotations());
      dispatch(fetchClients());
    }
  }, 1000); // attendre 1 seconde avant d’appeler l’API

  return () => clearTimeout(timer); // nettoyage si le composant est démonté
}, [dispatch]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'factures':
        return <Factures />;
      case 'devis':
        return <Devis />;
      case 'clients':
        return <Clients />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="module">
      <Toolbar />
      <div className="mod-content">{renderPage()}</div>
      <SideMenu />
      <Toast />

      {/* Modals */}
      {isModalOpen && modalType === 'invoice' && <InvoiceModal editData={modalData} />}
      {isModalOpen && modalType === 'devis' && <DevisModal editData={modalData} />}
      {isModalOpen && modalType === 'client' && <ClientModal editData={modalData} />}
    </div>
  );
}

export default App;