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

  // Initialise le token depuis les variables d'environnement si absent du localStorage
  useEffect(() => {
    const stored = localStorage.getItem('access_token');
    if (!stored) {
      const envToken = import.meta.env.VITE_ACCESS_TOKEN;
      if (envToken) {
        localStorage.setItem('access_token', envToken);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasLoaded.current) {
        hasLoaded.current = true;
        dispatch(fetchInvoices());
        dispatch(fetchQuotations());
        dispatch(fetchClients());
      }
    }, 1000);
    return () => clearTimeout(timer);
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
      // ── Pages formulaire (remplacent les popups) ──
      case 'nouvelle-facture':
        return <InvoiceModal editData={null} />;
      case 'modifier-facture':
        return <InvoiceModal editData={modalData} />;
      case 'nouveau-devis':
        return <DevisModal editData={null} />;
      case 'modifier-devis':
        return <DevisModal editData={modalData} />;
      default:
        return <Dashboard />;
    }
  };

  const isFullPage = ['nouvelle-facture', 'modifier-facture', 'nouveau-devis', 'modifier-devis'].includes(currentPage);

  return (
    <div className="module">
      <Toolbar />
      <div className={isFullPage ? 'flex-1 flex flex-col overflow-hidden' : 'mod-content'}>
        {renderPage()}
      </div>
      <SideMenu />
      <Toast />
      {/* Seul le modal client reste en popup */}
      {isModalOpen && modalType === 'client' && <ClientModal editData={modalData} />}
    </div>
  );
}

export default App;
