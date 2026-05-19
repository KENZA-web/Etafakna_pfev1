// src/pages/Factures.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { removeInvoice, updateInvoiceStatus, validateInvoice, payInvoice, cancelInvoice } from '../store/slices/invoicesSlice';
import { openModal, addToast, setCurrentPage } from '../store/slices/uiSlice';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Search, Download, Send, CheckCircle, Sparkles, Eye, FileText, 
  Mail, Trash2, X, CreditCard, ChevronDown, RefreshCw, 
  ChevronLeft, ChevronRight, Calendar, DollarSign, Filter, Plus,
  Clock, AlertTriangle
} from 'lucide-react';
import type { Invoice } from '../types';
import { sendInvoiceEmail } from '../services/emailService';
import api from '../services/api';
import PDFViewerModal from '../components/modals/PDFViewerModal';

// Liste complète des devises
const CURRENCIES = {
  'TND': { symbol: 'DT', label: 'Dinar tunisien', country: '🇹🇳 Tunisie' },
  'DZD': { symbol: 'DA', label: 'Dinar algérien', country: '🇩🇿 Algérie' },
  'MAD': { symbol: 'DH', label: 'Dirham marocain', country: '🇲🇦 Maroc' },
  'LYD': { symbol: 'LD', label: 'Dinar libyen', country: '🇱🇾 Libye' },
  'EGP': { symbol: 'E£', label: 'Livre égyptienne', country: '🇪🇬 Égypte' },
  'SAR': { symbol: '﷼', label: 'Riyal saoudien', country: '🇸🇦 Arabie saoudite' },
  'AED': { symbol: 'د.إ', label: 'Dirham des Émirats', country: '🇦🇪 Émirats arabes unis' },
  'QAR': { symbol: '﷼', label: 'Riyal qatari', country: '🇶🇦 Qatar' },
  'OMR': { symbol: '﷼', label: 'Rial omanais', country: '🇴🇲 Oman' },
  'KWD': { symbol: 'KD', label: 'Dinar koweïtien', country: '🇰🇼 Koweït' },
  'BHD': { symbol: 'BD', label: 'Dinar bahreïni', country: '🇧🇭 Bahreïn' },
  'JOD': { symbol: 'JD', label: 'Dinar jordanien', country: '🇯🇴 Jordanie' },
  'LBP': { symbol: 'ل.ل', label: 'Livre libanaise', country: '🇱🇧 Liban' },
  'SYP': { symbol: '£S', label: 'Livre syrienne', country: '🇸🇾 Syrie' },
  'IQD': { symbol: 'ع.د', label: 'Dinar irakien', country: '🇮🇶 Irak' },
  'IRR': { symbol: '﷼', label: 'Rial iranien', country: '🇮🇷 Iran' },
  'YER': { symbol: '﷼', label: 'Rial yéménite', country: '🇾🇪 Yémen' },
  'EUR': { symbol: '€', label: 'Euro', country: '🇪🇺 Union européenne' },
  'USD': { symbol: '$', label: 'Dollar US', country: '🇺🇸 États-Unis' },
} as const;

// Fonction utilitaire pour obtenir le symbole
const getCurrencySymbol = (code: string): string => {
  return (CURRENCIES as Record<string, { symbol: string }>)[code]?.symbol || code;
};

// ── Dropdown rendu en position fixed (hors tableau) ───────
interface InvoiceActionDropdownProps {
  inv: Invoice;
  anchorRect: DOMRect;
  onClose: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onEmail: () => void;
  onPay: () => void;
  onEmit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onChat: () => void;
}
const InvoiceActionDropdown: React.FC<InvoiceActionDropdownProps> = ({
  inv, anchorRect, onClose,
  onPreview, onDownload, onEmail, onPay, onEmit, onCancel, onDelete, onChat,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const dropdownHeight = 300;
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const openUpward = spaceBelow < dropdownHeight;

  const posStyle: React.CSSProperties = openUpward
    ? {
        position: 'fixed',
        bottom: window.innerHeight - anchorRect.top + 4,
        right: window.innerWidth - anchorRect.right,
        zIndex: 9999,
      }
    : {
        position: 'fixed',
        top: anchorRect.bottom + 4,
        right: window.innerWidth - anchorRect.right,
        zIndex: 9999,
      };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  return (
    <div ref={ref} style={posStyle}
      className="bg-white rounded-xl shadow-xl border border-border w-52 overflow-hidden">
      <div className="py-1">
        <button onClick={onPreview} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-ink-2 hover:bg-indigo-50 transition-colors">
          <Eye size={13} className="text-indigo-500" />
          <span className="font-medium">Aperçu PDF</span>
        </button>
        <button onClick={onDownload} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-ink-2 hover:bg-blue-50 transition-colors">
          <FileText size={13} className="text-blue-500" />
          <span className="font-medium">Télécharger PDF</span>
        </button>
        <button onClick={onEmail} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-ink-2 hover:bg-emerald-50 transition-colors">
          <Mail size={13} className="text-emerald-500" />
          <span className="font-medium">Envoyer par email</span>
        </button>
        <div className="h-px bg-border my-0.5" />
        {inv.status !== 'PAID' && inv.status !== 'DRAFT' && (
          <button onClick={onPay} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-green-700 hover:bg-green-50 transition-colors">
            <CreditCard size={13} className="text-green-500" />
            <span className="font-medium">Marquer payée</span>
          </button>
        )}
        {inv.status === 'DRAFT' && (
          <button onClick={onEmit} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-amber-700 hover:bg-amber-50 transition-colors">
            <Send size={13} className="text-amber-500" />
            <span className="font-medium">Émettre</span>
          </button>
        )}
        <div className="h-px bg-border my-0.5" />
        <button onClick={onChat} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-purple-700 hover:bg-purple-50 transition-colors">
          <Sparkles size={13} className="text-purple-500" />
          <span className="font-medium">Résumé IA</span>
        </button>
        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
          <>
            <div className="h-px bg-border my-0.5" />
            <button onClick={onCancel} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-orange-700 hover:bg-orange-50 transition-colors">
              <X size={13} className="text-orange-500" />
              <span className="font-medium">Annuler</span>
            </button>
          </>
        )}
        {inv.status === 'DRAFT' && (
          <button onClick={onDelete} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-700 hover:bg-red-50 transition-colors">
            <Trash2 size={13} className="text-red-500" />
            <span className="font-medium">Supprimer</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const Factures: React.FC = () => {
  const dispatch = useDispatch();
  const invoices = useSelector((state: RootState) => state.invoices) as Invoice[];
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPageNum] = useState(1);
  const itemsPerPage = 10;
  const [paymentData, setPaymentData] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    reference: ''
  });

  const [aiSummaryInvoice, setAiSummaryInvoice] = useState<Invoice | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  // PDF Viewer
  const [pdfViewer, setPdfViewer] = useState<{ url: string; fileName: string; invoiceId: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState<string>('');

  const isOverdue = (invoice: Invoice): boolean => {
    if (!invoice.dueDate) return false;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && invoice.status !== 'PAID';
  };

  const filterByPeriod = (invoiceDate: string): boolean => {
    const date = new Date(invoiceDate);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    switch (periodFilter) {
      case 'month': return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      case '3months': const threeMonthsAgo = new Date(); threeMonthsAgo.setMonth(now.getMonth() - 3); return date >= threeMonthsAgo;
      case 'year': return date.getFullYear() === currentYear;
      default: return true;
    }
  };

  const getInvoiceCurrency = (invoice: Invoice): string => {
    if (invoice.currency && (CURRENCIES as Record<string, any>)[invoice.currency]) return invoice.currency;
    if (invoice.id.includes('EUR')) return 'EUR';
    if (invoice.id.includes('USD')) return 'USD';
    return 'TND';
  };

  const filteredInvoices: Invoice[] = invoices.filter((inv: Invoice) => {
    const matchesSearch = !searchTerm || inv.client.toLowerCase().includes(searchTerm.toLowerCase()) || (inv.invoiceNumber || inv.id).toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === 'overdue') matchesStatus = isOverdue(inv);
    else if (statusFilter) {
      const statusMap: Record<string, string> = { 'paid': 'PAID', 'pending': 'ISSUED', 'draft': 'DRAFT', 'refused': 'CANCELLED', 'signed': 'SIGNED' };
      const mappedStatus = statusMap[statusFilter] || statusFilter.toUpperCase();
      matchesStatus = inv.status === mappedStatus;
    }
    const matchesPeriod = filterByPeriod(inv.issueDate);
    const invCurrency = getInvoiceCurrency(inv);
    const matchesCurrency = currencyFilter === 'all' || invCurrency === currencyFilter;
    // Date range filter
    let matchesDate = true;
    if (dateFrom) matchesDate = matchesDate && inv.issueDate >= dateFrom;
    if (dateTo) matchesDate = matchesDate && inv.issueDate <= dateTo;
    return matchesSearch && matchesStatus && matchesPeriod && matchesCurrency && matchesDate;
  });

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

  const formatAmountWithCurrency = (amount: number, currencyCode?: string): string => {
    const code = currencyCode || 'TND';
    const symbol = getCurrencySymbol(code);
    return `${formatAmount(amount)} ${symbol}`;
  };

  const buildLifecycle = (lc: number): JSX.Element => {
    const steps = ['Brouillon', 'Émise', 'Signée', 'Payée'];
    return (
      <div className="flex items-center min-w-[120px]">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center">
              <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center text-[8px] font-bold transition-all ${idx + 1 <= lc ? 'bg-accent border-accent text-white' : 'border-border bg-white text-ink-4'}`} title={step}>
                {idx + 1 <= lc ? '✓' : idx + 1}
              </div>
            </div>
            {idx < 3 && <div className={`h-[2px] flex-1 mx-0.5 transition-all min-w-[10px] ${idx + 1 < lc ? 'bg-accent' : 'bg-border'}`} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const handleEmit = async (id: string) => {
    try {
      await (dispatch as any)(validateInvoice(id)).unwrap();
      dispatch(addToast({ message: `✅ Facture ${id} émise avec succès !`, type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: `❌ ${err || 'Erreur lors de la validation'}`, type: 'error' }));
    }
    setOpenActionId(null);
  };

  const handleMarkPaid = async (id: string) => {
    if (!paymentData.amount) {
      dispatch(addToast({ message: `⚠️ Veuillez saisir le montant reçu`, type: 'error' }));
      return;
    }
    try {
      await (dispatch as any)(payInvoice({
        id,
        paidDate: paymentData.date,
        notes: paymentData.reference ? `Réf: ${paymentData.reference}` : undefined,
      })).unwrap();
      const invoice = invoices.find(i => i.id === id);
      const currency = invoice ? getInvoiceCurrency(invoice) : 'TND';
      dispatch(addToast({ message: `💰 Facture ${id} marquée payée ! Montant: ${formatAmountWithCurrency(parseFloat(paymentData.amount), currency)}${paymentData.reference ? ` - Réf: ${paymentData.reference}` : ''}`, type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: `❌ ${err || 'Erreur lors du paiement'}`, type: 'error' }));
    }
    setShowPaymentModal(null);
    setPaymentData({ date: new Date().toISOString().slice(0, 10), amount: '', reference: '' });
    setOpenActionId(null);
  };

  const handleCancel = async (id: string) => {
    try {
      await (dispatch as any)(cancelInvoice(id)).unwrap();
      dispatch(addToast({ message: `🚫 Facture annulée`, type: 'info' }));
    } catch (err: any) {
      dispatch(addToast({ message: `❌ ${err || "Erreur lors de l'annulation"}`, type: 'error' }));
    }
    setOpenActionId(null);
  };
  const handlePreview = async (invoiceId: string) => {
    dispatch(addToast({ message: `📄 Chargement de l'aperçu...`, type: 'info' }));
    try {
      const response = await (await import('../services/api')).default.get(
        `/invoices/${invoiceId}/pdf`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const invoice = invoices.find(i => i.id === invoiceId);
      const fileName = `facture-${invoice?.invoiceNumber || invoiceId}.pdf`;
      setPdfViewer({ url, fileName, invoiceId });
    } catch {
      dispatch(addToast({ message: `❌ Erreur lors de la génération du PDF`, type: 'error' }));
    }
  };
  const handleDownload = async (invoice: Invoice) => {
    dispatch(addToast({ message: `📄 Génération du PDF...`, type: 'info' }));
    try {
      const response = await (await import('../services/api')).default.get(
        `/invoices/${invoice.id}/pdf`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${invoice.invoiceNumber || invoice.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      dispatch(addToast({ message: `✅ PDF téléchargé !`, type: 'success' }));
    } catch {
      dispatch(addToast({ message: `❌ Erreur PDF pour ${invoice.id}`, type: 'error' }));
    }
  };
  const handleEmail = async (invoice: Invoice) => { try { await sendInvoiceEmail(invoice.id); dispatch(addToast({ message: `📧 Email envoyé à ${invoice.client}`, type: 'success' })); } catch (error) { dispatch(addToast({ message: `❌ Échec de l'envoi à ${invoice.client}`, type: 'error' })); } setOpenActionId(null); };
  const handleDelete = (invoiceId: string, clientName: string) => { setDeleteConfirmId(invoiceId); setDeleteConfirmClient(clientName); setOpenActionId(null); };
  const confirmDelete = () => { if (deleteConfirmId) { dispatch(removeInvoice(deleteConfirmId) as any); dispatch(addToast({ message: `🗑️ Facture supprimée`, type: 'info' })); setDeleteConfirmId(null); } };
  const openPaymentModal = (invoiceId: string, amount: number) => { setPaymentData({ ...paymentData, amount: amount.toString() }); setShowPaymentModal(invoiceId); setOpenActionId(null); };
  const closeDropdown = () => { setOpenActionId(null); setAnchorRect(null); };
  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    if (openActionId === id) { closeDropdown(); return; }
    setAnchorRect(e.currentTarget.getBoundingClientRect());
    setOpenActionId(id);
  };

  const handleRefresh = () => { setIsRefreshing(true); setTimeout(() => { setIsRefreshing(false); dispatch(addToast({ message: `🔄 Données actualisées`, type: 'success' })); }, 1000); };
  const handleExport = () => { dispatch(addToast({ message: `📄 Export PDF en cours...`, type: 'info' })); };
  const resetFilters = () => { setSearchTerm(''); setStatusFilter(''); setPeriodFilter('all'); setCurrencyFilter('all'); setDateFrom(''); setDateTo(''); setCurrentPageNum(1); dispatch(addToast({ message: `🔍 Filtres réinitialisés`, type: 'info' })); };
  useEffect(() => { const handleClickOutside = () => setOpenActionId(null); document.addEventListener('click', handleClickOutside); return () => document.removeEventListener('click', handleClickOutside); }, []);

  // Écouter l'event d'aperçu PDF après création
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.url && detail?.fileName) {
        setPdfViewer({ url: detail.url, fileName: detail.fileName, invoiceId: '' });
      }
    };
    window.addEventListener('open-pdf-preview', handler);
    return () => window.removeEventListener('open-pdf-preview', handler);
  }, []);

  const activeInv = openActionId ? currentInvoices.find(i => i.id === openActionId) || invoices.find(i => i.id === openActionId) : null;

  return (
    <div>
      {/* PDF Viewer Modal */}
      {pdfViewer && (
        <PDFViewerModal
          url={pdfViewer.url}
          fileName={pdfViewer.fileName}
          onClose={() => {
            window.URL.revokeObjectURL(pdfViewer.url);
            setPdfViewer(null);
          }}
          onDownload={() => {
            const link = document.createElement('a');
            link.href = pdfViewer.url;
            link.setAttribute('download', pdfViewer.fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            dispatch(addToast({ message: `✅ PDF téléchargé !`, type: 'success' }));
          }}
        />
      )}
      {/* Dropdown rendu hors tableau (position fixed) */}
      {openActionId && activeInv && anchorRect && (
        <InvoiceActionDropdown
          inv={activeInv}
          anchorRect={anchorRect}
          onClose={closeDropdown}
          onPreview={() => { handlePreview(activeInv.id); closeDropdown(); }}
          onDownload={() => { handleDownload(activeInv); closeDropdown(); }}
          onEmail={() => { handleEmail(activeInv); closeDropdown(); }}
          onPay={() => { openPaymentModal(activeInv.id, activeInv.total); }}
          onEmit={() => { handleEmit(activeInv.id); }}
          onCancel={() => { handleCancel(activeInv.id); }}
          onDelete={() => { handleDelete(activeInv.id, activeInv.client); }}
          onChat={() => {
            setAiSummaryInvoice(activeInv);
            setAiSummary('');
            setAiLoading(true);
            closeDropdown();
            // Générer le résumé
            const inv = activeInv;
            const sym = (inv as any).currency || 'TND';
            const statusLabel: Record<string, string> = { DRAFT: 'Brouillon', ISSUED: 'Émise', PAID: 'Payée', CANCELLED: 'Annulée' };
            const lines = (inv.lines || []).map((l: any, i: number) => `${i+1}. ${l.description} — Qté: ${l.quantity} × ${Number(l.unitPrice).toFixed(3)} = ${Number(l.lineTotal).toFixed(3)} ${sym}`).join('\n');
            const overdue = inv.dueDate && new Date(inv.dueDate) < new Date() && inv.status !== 'PAID';
            const summary = [
              `📄 **${inv.invoiceNumber || inv.id}**`,
              `👤 Client : ${inv.client}${inv.co ? ` (${inv.co})` : ''}`,
              `📅 Émise le : ${inv.issueDate} | Échéance : ${inv.dueDate || '—'}${overdue ? ' ⚠️ EN RETARD' : ''}`,
              `💰 Total TTC : ${Number(inv.total).toFixed(3)} ${sym}`,
              `📊 Statut : ${statusLabel[inv.status] || inv.status}`,
              lines ? `\n🧾 Articles :\n${lines}` : '',
              inv.notes ? `\n📝 Notes : ${inv.notes}` : '',
            ].filter(Boolean).join('\n');
            setTimeout(() => { setAiSummary(summary); setAiLoading(false); }, 600);
          }}
        />
      )}
      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowPaymentModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-gradient-to-r bg-[#1C6AE4] px-6 py-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"><CreditCard size={22} className="text-white" /></div>
                <div><h3 className="text-lg font-extrabold text-white">Enregistrer le paiement</h3><p className="text-xs text-white/80 mt-0.5">Facture {showPaymentModal}</p></div>
              </div>
              <button onClick={() => setShowPaymentModal(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={16} className="text-white" /></button>
            </div>
            <div className="p-6 space-y-5">
              {(() => {
                const invoice = invoices.find(i => i.id === showPaymentModal);
                const currency = invoice ? getInvoiceCurrency(invoice) : 'TND';
                return (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-green-700 uppercase tracking-wide">Montant total</span>
                      <span className="text-xl font-black text-green-700 font-mono">{formatAmountWithCurrency(invoice?.total || 0, currency)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-green-100 rounded-full overflow-hidden"><div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div></div>
                  </div>
                );
              })()}
              <div><label className="block text-[11px] font-bold uppercase tracking-wide text-ink-4 mb-2">📅 Date de paiement</label><input type="date" value={paymentData.date} onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })} className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all" /></div>
              <div><label className="block text-[11px] font-bold uppercase tracking-wide text-ink-4 mb-2">💰 Montant reçu</label><div className="relative"><input type="number" step="0.001" value={paymentData.amount} onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })} placeholder="0.000" className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all font-mono font-bold" /></div></div>
              <div><label className="block text-[11px] font-bold uppercase tracking-wide text-ink-4 mb-2">🔖 Référence virement (optionnel)</label><input type="text" value={paymentData.reference} onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })} placeholder="ex: VIREMENT-2026-001" className="w-full px-4 py-3 border-2 border-border rounded-xl text-sm focus:border-green-400 focus:ring-4 focus:ring-green-100 outline-none transition-all" /></div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <Button variant="secondary" onClick={() => setShowPaymentModal(null)} className="flex-1">Annuler</Button>
              <Button variant="primary" onClick={() => handleMarkPaid(showPaymentModal)} className="flex-1 bg-gradient-to-r bg-[#1C6AE4] "><CheckCircle size={14} className="mr-2" /> Confirmer le paiement</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div><h1 className="text-xl font-black text-ink">Factures</h1><p className="text-[12px] text-ink-4 mt-0.5">Gérez vos factures et suivez les paiements</p></div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className={`p-2 rounded-lg bg-surface-2 border border-border hover:bg-surface transition-all ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={14} className="text-ink-4" /></button>
          <button onClick={() => dispatch(setCurrentPage('nouvelle-facture'))} className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1C6AE4] hover:bg-[#1555C8] text-white text-[13px] font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(79,70,229,0.5)]" />
            <div className="relative flex items-center gap-2"><div className="p-0.5 rounded-full bg-white/20 group-hover:bg-white/30 transition-all"><Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" /></div><span className="font-bold">Nouvelle facture</span></div>
          </button>
        </div>
      </div>



      {/* Filtres */}
      <div className="bg-white rounded-xl border border-border p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2"><Filter size={14} className="text-accent" /><span className="text-[11px] font-bold text-ink-4 uppercase tracking-wide">Filtres avancés</span></div>
          <button onClick={resetFilters} className="text-[10px] font-bold text-accent hover:underline">Réinitialiser</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" /><input type="text" placeholder="Rechercher client ou n° facture..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all bg-white" /></div>
          <div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4"><span className="text-[11px]">📊</span></div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all bg-white appearance-none cursor-pointer"><option value="">Tous les statuts</option><option value="paid">✅ Payée</option><option value="pending">⏳ En attente</option><option value="draft">📝 Brouillon</option><option value="refused">❌ Refusée</option><option value="signed">✍️ Signée</option><option value="overdue">⚠️ En retard</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" /></div>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none bg-white" title="Date début" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none bg-white" title="Date fin" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4"><Calendar size={12} /></div><select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all bg-white appearance-none cursor-pointer"><option value="all">📅 Toute la période</option><option value="month">📆 Ce mois</option><option value="3months">🗓️ 3 derniers mois</option><option value="year">📅 Cette année</option></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" /></div>
          <div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4"><DollarSign size={12} /></div><select value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all bg-white appearance-none cursor-pointer"><option value="all">💱 Toutes les devises</option><optgroup label="🌍 Afrique du Nord"><option value="TND">🇹🇳 Dinar tunisien (TND)</option><option value="DZD">🇩🇿 Dinar algérien (DZD)</option><option value="MAD">🇲🇦 Dirham marocain (MAD)</option><option value="LYD">🇱🇾 Dinar libyen (LYD)</option><option value="EGP">🇪🇬 Livre égyptienne (EGP)</option></optgroup><optgroup label="💰 Pays du Golfe (GCC)"><option value="SAR">🇸🇦 Riyal saoudien (SAR)</option><option value="AED">🇦🇪 Dirham des Émirats (AED)</option><option value="QAR">🇶🇦 Riyal qatari (QAR)</option><option value="OMR">🇴🇲 Rial omanais (OMR)</option><option value="KWD">🇰🇼 Dinar koweïtien (KWD)</option><option value="BHD">🇧🇭 Dinar bahreïni (BHD)</option></optgroup><optgroup label="🌍 Autres pays du Moyen-Orient"><option value="JOD">🇯🇴 Dinar jordanien (JOD)</option><option value="LBP">🇱🇧 Livre libanaise (LBP)</option><option value="SYP">🇸🇾 Livre syrienne (SYP)</option><option value="IQD">🇮🇶 Dinar irakien (IQD)</option><option value="IRR">🇮🇷 Rial iranien (IRR)</option><option value="YER">🇾🇪 Rial yéménite (YER)</option></optgroup><optgroup label="💶 Autres devises"><option value="EUR">🇪🇺 Euro (EUR)</option><option value="USD">🇺🇸 Dollar US (USD)</option></optgroup></select><ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" /></div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {searchTerm && <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">Recherche: {searchTerm}<button onClick={() => setSearchTerm('')} className="hover:text-red-500">×</button></span>}
          {statusFilter === 'overdue' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">Statut: En retard<button onClick={() => setStatusFilter('')} className="hover:text-red-500">×</button></span>}
          {statusFilter && statusFilter !== 'overdue' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">Statut: {statusFilter === 'paid' ? 'Payée' : statusFilter === 'pending' ? 'En attente' : statusFilter === 'draft' ? 'Brouillon' : statusFilter === 'refused' ? 'Refusée' : 'Signée'}<button onClick={() => setStatusFilter('')} className="hover:text-red-500">×</button></span>}
          {periodFilter !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">Période: {periodFilter === 'month' ? 'Ce mois' : periodFilter === '3months' ? '3 derniers mois' : 'Cette année'}<button onClick={() => setPeriodFilter('all')} className="hover:text-red-500">×</button></span>}
          {currencyFilter !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">Devise: {(CURRENCIES as Record<string, { label: string }>)[currencyFilter]?.label || currencyFilter}<button onClick={() => setCurrencyFilter('all')} className="hover:text-red-500">×</button></span>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-[11px] text-ink-4">{filteredInvoices.length} facture{filteredInvoices.length > 1 ? 's' : ''} trouvée{filteredInvoices.length > 1 ? 's' : ''}</div>
        <Button variant="secondary" size="sm" onClick={handleExport}><Download size={12} className="mr-1" /> Exporter les résultats</Button>
      </div>

      {/* Tableau */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="text-left text-[10.5px] font-bold text-ink-4 uppercase tracking-wide bg-surface-2 border-b border-border"><th className="p-2.5 px-3.5">N° Facture</th><th className="p-2.5 px-3.5">Client</th><th className="p-2.5 px-3.5">Montant TTC</th><th className="p-2.5 px-3.5">Date</th><th className="p-2.5 px-3.5">Échéance</th><th className="p-2.5 px-3.5">Statut</th><th className="p-2.5 px-3.5">Cycle</th><th className="p-2.5 px-3.5">Actions</th></tr></thead>
            <tbody>
              {currentInvoices.map((inv: Invoice) => {
                const isInvoiceOverdue = isOverdue(inv);
                const currency = getInvoiceCurrency(inv);
                return (
                  <tr key={inv.id} id={`invoice-row-${inv.id}`} className="border-b border-border/50 hover:bg-surface-2 transition-colors group cursor-pointer" onClick={() => handlePreview(inv.id)}>
                    <td className="p-2.5 px-3.5 font-mono text-[11.5px] font-semibold text-accent">{inv.invoiceNumber || inv.id}</td>
                    <td className="p-2.5 px-3.5"><div className="font-semibold text-ink">{inv.client}</div><div className="text-[10px] text-ink-4">{inv.co}</div></td>
                    <td className="p-2.5 px-3.5 font-mono font-bold text-ink">{formatAmountWithCurrency(inv.total, currency)}</td>
                    <td className="p-2.5 px-3.5 text-[11.5px] text-ink-4">{formatDate(inv.issueDate)}</td>
                    <td className="p-2.5 px-3.5 text-[11.5px] text-ink-4">{formatDate(inv.dueDate)}</td>
                    <td className="p-2.5 px-3.5">{isInvoiceOverdue ? <span className="badge badge-overdue bg-red-100 text-red-700 border-red-200">En retard</span> : <Badge status={inv.status === 'PAID' ? 'paid' : inv.status === 'ISSUED' ? 'pending' : inv.status === 'DRAFT' ? 'draft' : inv.status === 'CANCELLED' ? 'refused' : 'signed'} />}</td>
                    <td className="p-2.5 px-3.5">{buildLifecycle(inv.lc)}</td>
                    <td className="p-2.5 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button onClick={(e) => toggleDropdown(e, inv.id)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${openActionId === inv.id ? 'bg-accent text-white shadow-md' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}>
                          <span className="text-[11px] font-bold">Actions</span>
                          <ChevronDown size={12} className={`transition-transform ${openActionId === inv.id ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2">
            <div className="text-[10px] text-ink-4">Affichage {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredInvoices.length)} sur {filteredInvoices.length} factures</div>
            <div className="flex gap-1">
              <button onClick={() => setCurrentPageNum(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`p-1.5 rounded border border-border transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}><ChevronLeft size={14} className="text-ink-4" /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = currentPage;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return <button key={pageNum} onClick={() => setCurrentPageNum(pageNum)} className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${currentPage === pageNum ? 'bg-accent text-white' : 'border border-border hover:bg-white'}`}>{pageNum}</button>;
              })}
              <button onClick={() => setCurrentPageNum(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`p-1.5 rounded border border-border transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}><ChevronRight size={14} className="text-ink-4" /></button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal résumé IA */}
      {aiSummaryInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setAiSummaryInvoice(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1C6AE4]/10 flex items-center justify-center">
                  <Sparkles size={18} className="text-[#1C6AE4]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Résumé IA</p>
                  <p className="text-[11px] text-gray-400">{aiSummaryInvoice.invoiceNumber || aiSummaryInvoice.id}</p>
                </div>
              </div>
              <button onClick={() => setAiSummaryInvoice(null)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                <X size={14} className="text-gray-500" />
              </button>
            </div>
            {/* Contenu */}
            <div className="px-6 py-5">
              {aiLoading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-8 h-8 rounded-full border-2 border-[#1C6AE4] border-t-transparent animate-spin" />
                  <p className="text-sm text-gray-400">Génération du résumé...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiSummary.split('\n').filter(Boolean).map((line, i) => {
                    const isTitle = line.startsWith('📄');
                    const isSection = line.startsWith('🧾') || line.startsWith('📝');
                    return (
                      <div key={i} className={`text-sm ${isTitle ? 'font-bold text-gray-800 text-base' : isSection ? 'font-semibold text-gray-700 mt-2' : 'text-gray-600'}`}>
                        {line.replace(/\*\*/g, '')}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setAiSummaryInvoice(null)}
                style={{ backgroundColor: '#1C6AE4' }}
                className="px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Supprimer cette facture ?</h3>
              <p className="text-sm text-gray-500">La facture de <strong>{deleteConfirmClient}</strong> sera définitivement supprimée.</p>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Annuler
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Factures;