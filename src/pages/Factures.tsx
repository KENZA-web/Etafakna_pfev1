// src/pages/Factures.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { updateInvoiceStatus } from '../store/slices/invoicesSlice';
import { openModal, addToast } from '../store/slices/uiSlice';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Search, Download, Send, CheckCircle, Sparkles, Eye, FileText, 
  Mail, Trash2, X, CreditCard, ChevronDown, RefreshCw, 
  ChevronLeft, ChevronRight, Calendar, DollarSign, Filter, Plus,
  Clock
} from 'lucide-react';
import type { Invoice } from '../types';
import { Chatbot } from '../components/ai/Chatbot';
import { sendInvoiceEmail } from '../services/emailService';
import { downloadPDFFromElement } from '../services/pdfService';

export const Factures: React.FC = () => {
  const dispatch = useDispatch();
  const invoices = useSelector((state: RootState) => state.invoices) as Invoice[];
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [paymentData, setPaymentData] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    reference: ''
  });

  // États pour le chatbot
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedInvoiceForChat, setSelectedInvoiceForChat] = useState<Invoice | null>(null);

  // Fonction pour filtrer par période
  const filterByPeriod = (invoiceDate: string): boolean => {
    const date = new Date(invoiceDate);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    switch (periodFilter) {
      case 'month':
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      case '3months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return date >= threeMonthsAgo;
      case 'year':
        return date.getFullYear() === currentYear;
      default:
        return true;
    }
  };

  // Filtrage complet
  const filteredInvoices: Invoice[] = invoices.filter((inv: Invoice) => {
    const matchesSearch = !searchTerm || 
      inv.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    const matchesPeriod = filterByPeriod(inv.date);
    const matchesCurrency = currencyFilter === 'all' || 
      (currencyFilter === 'TND' && !inv.id.includes('EUR')) ||
      (currencyFilter === 'EUR' && inv.id.includes('EUR'));
    return matchesSearch && matchesStatus && matchesPeriod && matchesCurrency;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
  };

  const formatAmount = (n: number): string => n.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const buildLifecycle = (lc: number): JSX.Element => {
    const steps = ['Brouillon', 'Émise', 'Signée', 'Payée'];
    return (
      <div className="flex items-center min-w-[120px]">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center">
              <div
                className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center text-[8px] font-bold transition-all ${
                  idx + 1 <= lc
                    ? 'bg-accent border-accent text-white'
                    : 'border-border bg-white text-ink-4'
                }`}
                title={step}
              >
                {idx + 1 <= lc ? '✓' : idx + 1}
              </div>
            </div>
            {idx < 3 && (
              <div className={`h-[2px] flex-1 mx-0.5 transition-all min-w-[10px] ${idx + 1 < lc ? 'bg-accent' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const handleEmit = (id: string): void => {
    dispatch(updateInvoiceStatus({ id, status: 'pending', lc: 2 }));
    dispatch(addToast({ message: `✅ ${id} émise avec succès !`, type: 'success' }));
    setOpenActionId(null);
  };

  const handleMarkPaid = (id: string): void => {
    if (!paymentData.amount) {
      dispatch(addToast({ message: `⚠️ Veuillez saisir le montant reçu`, type: 'error' }));
      return;
    }
    dispatch(updateInvoiceStatus({ id, status: 'paid', lc: 4 }));
    dispatch(addToast({ 
      message: `💰 ${id} marquée comme payée ! Montant: ${formatAmount(parseFloat(paymentData.amount))} TND - Ref: ${paymentData.reference || 'N/A'}`, 
      type: 'success' 
    }));
    setShowPaymentModal(null);
    setPaymentData({ date: new Date().toISOString().slice(0, 10), amount: '', reference: '' });
    setOpenActionId(null);
  };

  const handlePreview = (invoiceId: string): void => {
    dispatch(addToast({ message: `👁️ Aperçu PDF de ${invoiceId}`, type: 'info' }));
    setOpenActionId(null);
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      // On suppose que chaque ligne du tableau a un id="invoice-row-{invoice.id}"
      await downloadPDFFromElement(`invoice-row-${invoice.id}`, `facture_${invoice.id}.pdf`);
      dispatch(addToast({ message: `📥 PDF téléchargé pour ${invoice.id}`, type: 'success' }));
    } catch (error) {
      dispatch(addToast({ message: `❌ Erreur PDF pour ${invoice.id}`, type: 'error' }));
    }
    setOpenActionId(null);
  };

  const handleEmail = async (invoice: Invoice) => {
    try {
      // Pour le test, vous pouvez remplacer par votre propre adresse email
      const clientEmail = (invoice as any).clientEmail || 'kenza.hariga@esen.tn';
      await sendInvoiceEmail({
        to_email: clientEmail,
        to_name: invoice.client,
        invoice_id: invoice.id,
        invoice_amount: formatAmount(invoice.ttc),
        invoice_date: formatDate(invoice.date),
      });
      dispatch(addToast({ message: `📧 Email envoyé à ${invoice.client}`, type: 'success' }));
    } catch (error) {
      dispatch(addToast({ message: `❌ Échec de l'envoi à ${invoice.client}`, type: 'error' }));
    }
    setOpenActionId(null);
  };

  const handleDelete = (invoiceId: string, clientName: string): void => {
    if (window.confirm(`Supprimer la facture ${invoiceId} de ${clientName} ?`)) {
      dispatch(addToast({ message: `🗑️ Facture ${invoiceId} supprimée`, type: 'info' }));
      setOpenActionId(null);
    }
  };

  const openPaymentModal = (invoiceId: string, amount: number): void => {
    setPaymentData({ ...paymentData, amount: amount.toString() });
    setShowPaymentModal(invoiceId);
    setOpenActionId(null);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      dispatch(addToast({ message: `🔄 Données actualisées`, type: 'success' }));
    }, 1000);
  };

  const handleExport = () => {
    dispatch(addToast({ message: `📄 Export PDF en cours...`, type: 'info' }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPeriodFilter('all');
    setCurrencyFilter('all');
    setCurrentPage(1);
    dispatch(addToast({ message: `🔍 Filtres réinitialisés`, type: 'info' }));
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenActionId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Statistiques pour affichage
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.ttc, 0);
  const paidAmount = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.ttc, 0);
  const pendingAmount = filteredInvoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.ttc, 0);

  return (
    <div>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowPaymentModal(null)}
        >
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <CreditCard size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Enregistrer le paiement</h3>
                  <p className="text-xs text-white/80 mt-0.5">Facture {showPaymentModal}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentModal(null)} 
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-green-700 uppercase tracking-wide">Montant total</span>
                  <span className="text-xl font-black text-green-700 font-mono">{formatAmount(invoices.find(i => i.id === showPaymentModal)?.ttc || 0)} TND</span>
                </div>
                <div className="w-full h-1.5 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-ink-4 mb-2">📅 Date de paiement</label>
                <input
                  type="date"
                  value={paymentData.date}
                  onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-ink-4 mb-2">💰 Montant reçu (TND)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-4 font-bold">TND</span>
                  <input
                    type="number"
                    step="0.001"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    placeholder="0.000"
                    className="w-full pl-14 pr-4 py-3 border-2 border-border rounded-xl text-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all font-mono font-bold"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-ink-4 mb-2">🔖 Référence virement (optionnel)</label>
                <input
                  type="text"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                  placeholder="ex: VIREMENT-2026-001"
                  className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-6 pt-0">
              <Button variant="secondary" onClick={() => setShowPaymentModal(null)} className="flex-1">
                Annuler
              </Button>
              <Button variant="primary" onClick={() => handleMarkPaid(showPaymentModal)} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <CheckCircle size={14} className="mr-2" />
                Confirmer le paiement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header avec titre et actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-black text-ink">Factures</h1>
          <p className="text-[12px] text-ink-4 mt-0.5">Gérez vos factures et suivez les paiements</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg bg-surface-2 border border-border hover:bg-surface transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={14} className="text-ink-4" />
          </button>
          
          <button
            onClick={() => dispatch(openModal({ type: 'invoice', data: null }))}
            className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent via-accent to-purple-600 text-white text-[13px] font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(79,70,229,0.5)]" />
            <div className="relative flex items-center gap-2">
              <div className="p-0.5 rounded-full bg-white/20 group-hover:bg-white/30 transition-all">
                <Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <span className="font-bold">Nouvelle facture</span>
              <span className="px-1.5 py-0.5 bg-yellow-400 text-purple-900 text-[9px] font-black rounded-full animate-pulse">+</span>
            </div>
          </button>
        </div>
      </div>

      {/* Cartes de statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-xl p-3 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide">Total filtré</div>
              <div className="text-lg font-black text-indigo-700">{formatAmount(totalAmount)} TND</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-200 flex items-center justify-center">
              <DollarSign size={16} className="text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-3 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-green-600 font-bold uppercase tracking-wide">Payé</div>
              <div className="text-lg font-black text-green-700">{formatAmount(paidAmount)} TND</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-green-200 flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl p-3 border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">En attente</div>
              <div className="text-lg font-black text-amber-700">{formatAmount(pendingAmount)} TND</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center">
              <Clock size={16} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-white rounded-xl border border-border p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-accent" />
            <span className="text-[11px] font-bold text-ink-4 uppercase tracking-wide">Filtres avancés</span>
          </div>
          <button onClick={resetFilters} className="text-[10px] font-bold text-accent hover:underline">
            Réinitialiser
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Recherche */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
            <input
              type="text"
              placeholder="Rechercher client ou n° facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all bg-white"
            />
          </div>

          {/* Statut */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4">
              <span className="text-[11px]">📊</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all bg-white appearance-none cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              <option value="paid">✅ Payée</option>
              <option value="pending">⏳ En attente</option>
              <option value="draft">📝 Brouillon</option>
              <option value="refused">❌ Refusée</option>
              <option value="signed">✍️ Signée</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
          </div>

          {/* Période */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4">
              <Calendar size={12} />
            </div>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all bg-white appearance-none cursor-pointer"
            >
              <option value="all">📅 Toute la période</option>
              <option value="month">📆 Ce mois</option>
              <option value="3months">🗓️ 3 derniers mois</option>
              <option value="year">📅 Cette année</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
          </div>

          {/* Devise */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4">
              <DollarSign size={12} />
            </div>
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all bg-white appearance-none cursor-pointer"
            >
              <option value="all">💱 Toutes les devises</option>
              <option value="TND">🇹🇳 Dinar Tunisien (TND)</option>
              <option value="EUR">🇪🇺 Euro (EUR)</option>
              <option value="USD">🇺🇸 Dollar (USD)</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
          </div>
        </div>

        {/* Badges des filtres actifs */}
        <div className="flex flex-wrap gap-2 mt-3">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
              Recherche: {searchTerm}
              <button onClick={() => setSearchTerm('')} className="hover:text-red-500">×</button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
              Statut: {statusFilter === 'paid' ? 'Payée' : statusFilter === 'pending' ? 'En attente' : statusFilter === 'draft' ? 'Brouillon' : statusFilter === 'refused' ? 'Refusée' : 'Signée'}
              <button onClick={() => setStatusFilter('')} className="hover:text-red-500">×</button>
            </span>
          )}
          {periodFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
              Période: {periodFilter === 'month' ? 'Ce mois' : periodFilter === '3months' ? '3 derniers mois' : 'Cette année'}
              <button onClick={() => setPeriodFilter('all')} className="hover:text-red-500">×</button>
            </span>
          )}
          {currencyFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
              Devise: {currencyFilter}
              <button onClick={() => setCurrencyFilter('all')} className="hover:text-red-500">×</button>
            </span>
          )}
        </div>
      </div>

      {/* Résultat et export */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-[11px] text-ink-4">
          {filteredInvoices.length} facture{filteredInvoices.length > 1 ? 's' : ''} trouvée{filteredInvoices.length > 1 ? 's' : ''}
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download size={12} className="mr-1" />
          Exporter les résultats
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[10.5px] font-bold text-ink-4 uppercase tracking-wide bg-surface-2 border-b border-border">
                <th className="p-2.5 px-3.5">N° Facture</th>
                <th className="p-2.5 px-3.5">Client</th>
                <th className="p-2.5 px-3.5">Montant TTC</th>
                <th className="p-2.5 px-3.5">Date</th>
                <th className="p-2.5 px-3.5">Échéance</th>
                <th className="p-2.5 px-3.5">Statut</th>
                <th className="p-2.5 px-3.5">Cycle</th>
                <th className="p-2.5 px-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((inv: Invoice) => (
                <tr key={inv.id} id={`invoice-row-${inv.id}`} className="border-b border-border/50 hover:bg-surface-2 transition-colors group">
                  <td className="p-2.5 px-3.5 font-mono text-[11.5px] font-semibold text-accent">{inv.id}</td>
                  <td className="p-2.5 px-3.5">
                    <div className="font-semibold text-ink">{inv.client}</div>
                    <div className="text-[10px] text-ink-4">{inv.co}</div>
                  </td>
                  <td className="p-2.5 px-3.5 font-mono font-bold text-ink">{formatAmount(inv.ttc)} TND</td>
                  <td className="p-2.5 px-3.5 text-[11.5px] text-ink-4">{formatDate(inv.date)}</td>
                  <td className="p-2.5 px-3.5 text-[11.5px] text-ink-4">{formatDate(inv.due)}</td>
                  <td className="p-2.5 px-3.5">
                    <Badge status={inv.status} />
                  </td>
                  <td className="p-2.5 px-3.5">{buildLifecycle(inv.lc)}</td>
                  <td className="p-2.5 px-3.5 relative">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionId(openActionId === inv.id ? null : inv.id);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                          openActionId === inv.id 
                            ? 'bg-accent text-white shadow-md' 
                            : 'bg-accent/10 text-accent hover:bg-accent/20'
                        }`}
                      >
                        <span className="text-[11px] font-bold">Actions</span>
                        <ChevronDown size={12} className={openActionId === inv.id ? 'rotate-180' : ''} />
                      </button>
                      
                      {openActionId === inv.id && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-border w-64 z-20 overflow-hidden origin-top-right">
                          <div className="px-4 py-3 bg-gradient-to-r from-accent-pale to-violet-light border-b border-border">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                                <ChevronDown size={12} className="text-accent" />
                              </div>
                              <span className="text-[11px] font-bold text-accent uppercase tracking-wide">Actions disponibles</span>
                            </div>
                            <p className="text-[10px] text-ink-4 mt-1">Facture {inv.id}</p>
                          </div>
                          
                          <div className="py-1">
                            <button
                              onClick={() => handlePreview(inv.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-ink-2 hover:bg-indigo-50 transition-all duration-150 group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center">
                                <Eye size={14} className="text-indigo-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">Aperçu PDF</span>
                            </button>
                            
                            <button
                              onClick={() => handleDownload(inv)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-ink-2 hover:bg-blue-50 transition-all duration-150 group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center">
                                <FileText size={14} className="text-blue-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">Télécharger PDF</span>
                            </button>
                            
                            <button
                              onClick={() => handleEmail(inv)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-ink-2 hover:bg-emerald-50 transition-all duration-150 group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center">
                                <Mail size={14} className="text-emerald-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">Envoyer par email</span>
                            </button>
                            
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-1"></div>
                            
                            {inv.status !== 'paid' && inv.status !== 'draft' && (
                              <button
                                onClick={() => openPaymentModal(inv.id, inv.ttc)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-green-700 hover:bg-green-50 transition-all duration-150 group"
                              >
                                <div className="w-7 h-7 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center">
                                  <CreditCard size={14} className="text-green-600" />
                                </div>
                                <span className="flex-1 text-left font-medium">Marquer comme payée</span>
                              </button>
                            )}
                            
                            {inv.status === 'draft' && (
                              <button
                                onClick={() => handleEmit(inv.id)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-amber-700 hover:bg-amber-50 transition-all duration-150 group"
                              >
                                <div className="w-7 h-7 rounded-lg bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center">
                                  <Send size={14} className="text-amber-600" />
                                </div>
                                <span className="flex-1 text-left font-medium">Émettre la facture</span>
                              </button>
                            )}
                            
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-1"></div>
                            
                            <button
                              onClick={() => {
                                setSelectedInvoiceForChat(inv);
                                setShowChatbot(true);
                                setOpenActionId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-purple-700 hover:bg-purple-50 transition-all duration-150 group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300 flex items-center justify-center">
                                <Sparkles size={14} className="text-purple-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">Assistant IA</span>
                            </button>
                            
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-1"></div>
                            
                            <button
                              onClick={() => handleDelete(inv.id, inv.client)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-700 hover:bg-red-50 transition-all duration-150 group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center">
                                <Trash2 size={14} className="text-red-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">Supprimer</span>
                            </button>
                          </div>
                          
                          <div className="px-4 py-2 bg-surface-2 border-t border-border text-[10px] text-ink-4 flex items-center justify-between">
                            <span>Cliquez pour exécuter</span>
                            <span className="font-mono">esc pour fermer</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2">
            <div className="text-[10px] text-ink-4">
              Affichage {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredInvoices.length)} sur {filteredInvoices.length} factures
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-1.5 rounded border border-border transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}
              >
                <ChevronLeft size={14} className="text-ink-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = currentPage;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-accent text-white'
                        : 'border border-border hover:bg-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-1.5 rounded border border-border transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}
              >
                <ChevronRight size={14} className="text-ink-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Chatbot flottant */}
      {showChatbot && selectedInvoiceForChat && (
        <Chatbot
          documentContext={selectedInvoiceForChat}
          onClose={() => setShowChatbot(false)}
        />
      )}
    </div>
  );
};

export default Factures;