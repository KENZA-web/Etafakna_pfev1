import { useSelector } from 'react-redux';
import { RootState } from './store';
import Toolbar from './components/layout/Toolbar';
import SideMenu from './components/layout/SideMenu';
import Toast from './components/ui/Toast';
import InvoiceModal from './components/modals/InvoiceModal';
import DevisModal from './components/modals/DevisModal';
import Dashboard from './pages/Dashboard';
import Factures from './pages/Factures';
import Devis from './pages/Devis';
import Clients from './pages/Clients';

function App() {
  const currentPage = useSelector((state: RootState) => state.ui.currentPage);
  const { isModalOpen, modalType } = useSelector((state: RootState) => state.ui);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'factures': return <Factures />;
      case 'devis': return <Devis />;
      case 'clients': return <Clients />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="module">
      <Toolbar />
      <div className="mod-content">
        {renderPage()}
      </div>
      <SideMenu />
      <Toast />
      
      {/* Modals */}
      {isModalOpen && modalType === 'invoice' && <InvoiceModal />}
      {isModalOpen && modalType === 'devis' && <DevisModal />}
    </div>
  );
}

export default App;