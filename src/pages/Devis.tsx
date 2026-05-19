// src/pages/Devis.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch, RootState } from '../store';
import {
  fetchQuotations,
  removeQuotation,
  sendQuotation,
  acceptQuotation,
  refuseQuotation,
  convertQuotation,
} from '../store/slices/devisSlice';
import { fetchInvoices } from '../store/slices/invoicesSlice';
import { addToast, setCurrentPage } from '../store/slices/uiSlice';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Search, Plus, Download, Eye, Trash2, Send,
  CheckCircle, XCircle, RefreshCw, ChevronDown,
  FileText, ArrowRight, X, Mail, Sparkles,
} from 'lucide-react';
import type { Devis as DevisType } from '../types';
import api from '../services/api';
import PDFViewerModal from '../components/modals/PDFViewerModal';

const getStatusBadge = (status: string): 'draft' | 'pending' | 'paid' | 'refused' | 'signed' => {
  const map: Record<string, 'draft' | 'pending' | 'paid' | 'refused' | 'signed'> = {
    DRAFT: 'draft',
    SENT: 'pending',
    ACCEPTED: 'signed',
    REFUSED: 'refused',
    CONVERTED: 'paid',
    EXPIRED: 'refused',
  };
  return map[status] || 'draft';
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  ACCEPTED: 'Accepté',
  REFUSED: 'Refusé',
  CONVERTED: 'Converti',
  EXPIRED: 'Expiré',
};

// ── Dropdown rendu en position fixed pour éviter le clipping ──
interface ActionDropdownProps {
  devis: DevisType;
  onClose: () => void;
  anchorRect: DOMRect;
  onEdit: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onEmail: () => void;
  onChat: () => void;
  onSend: () => void;
  onAccept: () => void;
  onRefuse: () => void;
  onConvert: () => void;
  onDelete: () => void;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  devis, onClose, anchorRect,
  onEdit, onPreview, onDownload, onEmail, onChat,
  onSend, onAccept, onRefuse, onConvert, onDelete,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dropdownHeight = 300;
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const openUpward = spaceBelow < dropdownHeight;

  const top = openUpward
    ? anchorRect.top + window.scrollY - dropdownHeight - 4
    : anchorRect.bottom + window.scrollY + 4;
  const right = window.innerWidth - anchorRect.right;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick); };
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'fixed', top, right, zIndex: 9999 }}
      className="bg-white rounded-xl shadow-xl border border-border w-52 overflow-hidden"
    >
      <div className="py-1">
        {devis.status === 'DRAFT' && (
          <button onClick={onEdit} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-ink-2 hover:bg-indigo-50 transition-colors">
            <Eye size={13} className="text-indigo-500" />
            <span className="font-medium">Modifier</span>
          </button>
        )}
        <button onClick={onPreview} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-ink-2 hover:bg-indigo-50 transition-colors">
          <Eye size={13} className="text-indigo-500" />
          <span className="font-medium">Aperçu PDF</span>
        </button>
        <button onClick={onDownload} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-ink-2 hover:bg-blue-50 transition-colors">
          <Download size={13} className="text-blue-500" />
          <span className="font-medium">Télécharger PDF</span>
        </button>
        <button onClick={onEmail} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-ink-2 hover:bg-emerald-50 transition-colors">
          <Mail size={13} className="text-emerald-500" />
          <span className="font-medium">Envoyer par email</span>
        </button>
        <div className="h-px bg-border my-0.5" />
        {devis.status === 'DRAFT' && (
          <button onClick={onSend} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-amber-700 hover:bg-amber-50 transition-colors">
            <Send size={13} className="text-amber-500" />
            <span className="font-medium">Marquer envoyé</span>
          </button>
        )}
        {devis.status === 'SENT' && (
          <button onClick={onAccept} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-green-700 hover:bg-green-50 transition-colors">
            <CheckCircle size={13} className="text-green-500" />
            <span className="font-medium">Accepter</span>
          </button>
        )}
        {devis.status === 'SENT' && (
          <button onClick={onRefuse} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-700 hover:bg-red-50 transition-colors">
            <XCircle size={13} className="text-red-500" />
            <span className="font-medium">Refuser</span>
          </button>
        )}
        {devis.status === 'ACCEPTED' && (
          <button onClick={onConvert} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-purple-700 hover:bg-purple-50 transition-colors">
            <ArrowRight size={13} className="text-purple-500" />
            <span className="font-medium">Convertir en facture</span>
          </button>
        )}
        <div className="h-px bg-border my-0.5" />
        <button onClick={onChat} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-purple-700 hover:bg-purple-50 transition-colors">
          <Sparkles size={13} className="text-purple-500" />
          <span className="font-medium">Résumé IA</span>
        </button>
        {devis.status === 'DRAFT' && (
          <>
            <div className="h-px bg-border my-0.5" />
            <button onClick={onDelete} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-700 hover:bg-red-50 transition-colors">
              <Trash2 size={13} className="text-red-500" />
              <span className="font-medium">Supprimer</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ── Modal conversion ──────────────────────────────────────
interface ConvertModalProps {
  devisId: string;
  onConfirm: (issueDate: string, dueDate: string) => void;
  onClose: () => void;
}
const ConvertModal: React.FC<ConvertModalProps> = ({ devisId, onConfirm, onClose }) => {
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(in30);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#1C6AE4] hover:bg-[#1555C8] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ArrowRight size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Convertir en facture</h3>
              <p className="text-xs text-white/80">Devis {devisId}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X size={16} className="text-white" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Date d'émission</label>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-border rounded-xl text-sm focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Date d'échéance</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-border rounded-xl text-sm focus:border-accent outline-none" />
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <Button variant="secondary" onClick={onClose} className="flex-1">Annuler</Button>
          <Button variant="primary" onClick={() => onConfirm(issueDate, dueDate)} className="flex-1">
            <ArrowRight size={14} /> Convertir
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────
export const Devis: React.FC = () => {
  const dispatch = useAppDispatch();
  const quotations = useSelector((state: RootState) => state.devis) as DevisType[];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [convertModalId, setConvertModalId] = useState<string | null>(null);
  const [pdfViewer, setPdfViewer] = useState<{ url: string; fileName: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Résumé IA
  const [aiSummaryDevis, setAiSummaryDevis] = useState<DevisType | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (quotations.length === 0) dispatch(fetchQuotations());
  }, [dispatch, quotations.length]);

  // Écouter l'event d'aperçu PDF après création
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.url && detail?.fileName) {
        setPdfViewer({ url: detail.url, fileName: detail.fileName });
      }
    };
    window.addEventListener('open-pdf-preview', handler);
    return () => window.removeEventListener('open-pdf-preview', handler);
  }, []);

  const filteredDevis = quotations.filter((d) => {
    const clientName = typeof d.client === 'string' ? d.client : (d.client as any)?.name || '';
    const matchesSearch =
      !searchTerm ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || d.status === statusFilter;
    // Date range filter
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && d.issueDate >= dateFrom;
    }
    if (dateTo) {
      matchesDate = matchesDate && d.issueDate <= dateTo;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatAmount = (n: number) =>
    n.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const closeDropdown = () => { setOpenActionId(null); setAnchorRect(null); };

  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    if (openActionId === id) { closeDropdown(); return; }
    setAnchorRect(e.currentTarget.getBoundingClientRect());
    setOpenActionId(id);
  };

  // ── Handlers ──────────────────────────────
  const handleDelete = async (id: string) => {
    closeDropdown();
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await dispatch(removeQuotation(deleteConfirmId)).unwrap();
      dispatch(addToast({ message: '🗑️ Devis supprimé', type: 'info' }));
    } catch (err: any) {
      dispatch(addToast({ message: `❌ ${err?.message || err || 'Erreur'}`, type: 'error' }));
    }
    setDeleteConfirmId(null);
  };

  const handleSend = async (id: string) => {
    closeDropdown();
    try {
      await dispatch(sendQuotation(id)).unwrap();
      dispatch(addToast({ message: '📤 Devis marqué comme envoyé', type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: `❌ ${err?.message || err || 'Erreur'}`, type: 'error' }));
    }
  };

  const handleAccept = async (id: string) => {
    closeDropdown();
    try {
      await dispatch(acceptQuotation(id)).unwrap();
      dispatch(addToast({ message: '✅ Devis accepté', type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: `❌ ${err?.message || err || 'Erreur'}`, type: 'error' }));
    }
  };

  const handleRefuse = async (id: string) => {
    closeDropdown();
    if (!window.confirm('Marquer ce devis comme refusé ?')) return;
    try {
      await dispatch(refuseQuotation(id)).unwrap();
      dispatch(addToast({ message: '❌ Devis refusé', type: 'info' }));
    } catch (err: any) {
      dispatch(addToast({ message: `❌ ${err?.message || err || 'Erreur'}`, type: 'error' }));
    }
  };

  const handleConvertConfirm = async (issueDate: string, dueDate: string) => {
    if (!convertModalId) return;
    try {
      await dispatch(convertQuotation({ id: convertModalId, invoiceIssueDate: issueDate, invoiceDueDate: dueDate })).unwrap();
      dispatch(fetchInvoices());
      dispatch(addToast({ message: '🎉 Devis converti en facture !', type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: `❌ ${err?.message || err || 'Erreur'}`, type: 'error' }));
    }
    setConvertModalId(null);
  };

  const handlePreviewPdf = async (id: string, quotationNumber: string) => {
    closeDropdown();
    dispatch(addToast({ message: '📄 Chargement de l\'aperçu...', type: 'info' }));
    try {
      const response = await api.get(`/quotations/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const fileName = `devis-${quotationNumber}.pdf`;
      setPdfViewer({ url, fileName });
    } catch {
      dispatch(addToast({ message: '❌ Erreur génération PDF', type: 'error' }));
    }
  };

  const handleDownloadPdf = async (id: string, quotationNumber: string) => {
    dispatch(addToast({ message: '📄 Téléchargement en cours...', type: 'info' }));
    try {
      const response = await api.get(`/quotations/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devis-${quotationNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      dispatch(addToast({ message: '✅ PDF téléchargé !', type: 'success' }));
    } catch {
      dispatch(addToast({ message: '❌ Erreur génération PDF', type: 'error' }));
    }
  };

  const handleEmail = async (devis: DevisType) => {
    closeDropdown();
    try {
      await api.post(`/quotations/${devis.id}/send-email`);
      const clientName = typeof devis.client === 'string' ? devis.client : (devis.client as any)?.name || '';
      dispatch(addToast({ message: `📧 Email envoyé à ${clientName}`, type: 'success' }));
    } catch {
      dispatch(addToast({ message: '❌ Échec de l\'envoi de l\'email', type: 'error' }));
    }
  };

  const handleAiSummary = (devis: DevisType) => {
    closeDropdown();
    setAiSummaryDevis(devis);
    setAiSummary('');
    setAiLoading(true);
    const sym = (devis as any).currency || 'TND';
    const statusLabel: Record<string, string> = {
      DRAFT: 'Brouillon', SENT: 'Envoyé', ACCEPTED: 'Accepté',
      REFUSED: 'Refusé', CONVERTED: 'Converti', EXPIRED: 'Expiré',
    };
    const clientName = typeof devis.client === 'string' ? devis.client : (devis.client as any)?.name || '—';
    const lines = (devis.lines || []).map((l: any, i: number) =>
      `${i + 1}. ${l.description} — Qté: ${l.quantity} × ${Number(l.unitPrice).toFixed(3)} = ${Number(l.lineTotal).toFixed(3)} ${sym}`
    ).join('\n');
    const isExpired = devis.validUntil && new Date(devis.validUntil) < new Date() && devis.status !== 'CONVERTED';
    const summary = [
      `📋 **${(devis as any).quotationNumber || devis.id}**`,
      `👤 Client : ${clientName}`,
      `📅 Émis le : ${devis.issueDate}${devis.validUntil ? ` | Valide jusqu'au : ${devis.validUntil}${isExpired ? ' ⚠️ EXPIRÉ' : ''}` : ''}`,
      `💰 Total TTC : ${Number(devis.total).toFixed(3)} ${sym}`,
      `📊 Statut : ${statusLabel[devis.status] || devis.status}`,
      lines ? `\n🧾 Articles :\n${lines}` : '',
      (devis as any).notes ? `\n📝 Notes : ${(devis as any).notes}` : '',
    ].filter(Boolean).join('\n');
    setTimeout(() => { setAiSummary(summary); setAiLoading(false); }, 600);
  };

  const activeDevis = openActionId ? quotations.find((d) => d.id === openActionId) : null;

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
            dispatch(addToast({ message: '✅ PDF téléchargé !', type: 'success' }));
          }}
        />
      )}

      {/* Modal Résumé IA */}
      {aiSummaryDevis && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setAiSummaryDevis(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Résumé IA</h3>
                  <p className="text-xs text-white/80">{(aiSummaryDevis as any).quotationNumber || aiSummaryDevis.id}</p>
                </div>
              </div>
              <button onClick={() => setAiSummaryDevis(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <X size={16} className="text-white" />
              </button>
            </div>
            <div className="p-6">
              {aiLoading ? (
                <div className="flex items-center justify-center py-8 gap-3">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-ink-4 text-sm">Analyse en cours...</span>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-[13px] text-ink leading-relaxed font-sans bg-purple-50 rounded-xl p-4 border border-purple-100">
                  {aiSummary}
                </pre>
              )}
            </div>
            <div className="px-6 pb-5">
              <button onClick={() => setAiSummaryDevis(null)} className="w-full py-2.5 rounded-xl bg-surface-2 border border-border text-[13px] font-bold text-ink-2 hover:bg-surface transition-colors">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown rendu hors du tableau (position fixed) */}
      {openActionId && activeDevis && anchorRect && (
        <ActionDropdown
          devis={activeDevis}
          anchorRect={anchorRect}
          onClose={closeDropdown}
          onEdit={() => { dispatch(setCurrentPage('modifier-devis')); dispatch({ type: 'ui/openModal', payload: { type: 'devis', data: activeDevis } }); closeDropdown(); }}
          onPreview={() => handlePreviewPdf(activeDevis.id, (activeDevis as any).quotationNumber || activeDevis.id)}
          onDownload={() => { closeDropdown(); handleDownloadPdf(activeDevis.id, (activeDevis as any).quotationNumber || activeDevis.id); }}
          onEmail={() => handleEmail(activeDevis)}
          onChat={() => handleAiSummary(activeDevis)}
          onSend={() => handleSend(activeDevis.id)}
          onAccept={() => handleAccept(activeDevis.id)}
          onRefuse={() => handleRefuse(activeDevis.id)}
          onConvert={() => { setConvertModalId(activeDevis.id); closeDropdown(); }}
          onDelete={() => handleDelete(activeDevis.id)}
        />
      )}

      {/* Modal de conversion */}
      {convertModalId && (
        <ConvertModal
          devisId={convertModalId}
          onConfirm={handleConvertConfirm}
          onClose={() => setConvertModalId(null)}
        />
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Supprimer ce devis ?</h3>
              <p className="text-sm text-gray-500">Cette action est irréversible. Le devis sera définitivement supprimé.</p>
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

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-black text-ink">Devis</h1>
          <p className="text-[12px] text-ink-4 mt-0.5">Gérez vos devis et suivez leur statut</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { dispatch(fetchQuotations()); dispatch(addToast({ message: '🔄 Liste actualisée', type: 'info' })); }}
            className="p-2 rounded-lg bg-surface-2 border border-border hover:bg-surface transition-all"
          >
            <RefreshCw size={14} className="text-ink-4" />
          </button>
          <button
            onClick={() => dispatch(setCurrentPage('nouveau-devis'))}
            style={{ backgroundColor: '#1C6AE4' }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[12.5px] font-bold text-white cursor-pointer transition-all hover:opacity-90"
          >
            <Plus size={12} /> Nouveau devis
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-border p-4 mb-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
            <input
              type="text"
              placeholder="Rechercher client ou n° devis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none transition-all bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent bg-white"
          >
            <option value="">Tous les statuts</option>
            <option value="DRAFT">Brouillon</option>
            <option value="SENT">Envoyé</option>
            <option value="ACCEPTED">Accepté</option>
            <option value="REFUSED">Refusé</option>
            <option value="CONVERTED">Converti</option>
            <option value="EXPIRED">Expiré</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none bg-white"
            placeholder="Du"
            title="Date début"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-[12px] focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none bg-white"
            placeholder="Au"
            title="Date fin"
          />
        </div>
      </div>

      {/* Tableau — pas d'overflow-hidden sur la Card pour ne pas clipper */}
      <Card className="overflow-visible" padding={false}>
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[10.5px] font-bold text-ink-4 uppercase tracking-wide bg-surface-2 border-b border-border">
                <th className="p-2.5 px-3.5">N° Devis</th>
                <th className="p-2.5 px-3.5">Client</th>
                <th className="p-2.5 px-3.5">Montant TTC</th>
                <th className="p-2.5 px-3.5">Date</th>
                <th className="p-2.5 px-3.5">Statut</th>
                <th className="p-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevis.map((devis) => {
                const clientName =
                  typeof devis.client === 'string' ? devis.client : (devis.client as any)?.name || '—';
                return (
                  <tr key={devis.id} className="border-b border-border/50 hover:bg-surface-2 transition-colors cursor-pointer" onClick={() => handlePreviewPdf(devis.id, (devis as any).quotationNumber || devis.id)}>
                    <td className="p-2.5 px-3.5 font-mono text-[11.5px] font-semibold text-accent">
                      {(devis as any).quotationNumber || devis.id}
                    </td>
                    <td className="p-2.5 px-3.5">
                      <div className="font-semibold text-ink">{clientName}</div>
                    </td>
                    <td className="p-2.5 px-3.5 font-mono font-bold text-ink">
                      {formatAmount(devis.total)} {(devis as any).currency || 'TND'}
                    </td>
                    <td className="p-2.5 px-3.5 text-[11.5px] text-ink-4">
                      {formatDate(devis.issueDate)}
                    </td>
                    <td className="p-2.5 px-3.5">
                      <Badge status={getStatusBadge(devis.status)}>
                        {STATUS_LABELS[devis.status] || devis.status}
                      </Badge>
                    </td>
                    <td className="p-2.5 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => toggleDropdown(e, devis.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                          openActionId === devis.id
                            ? 'bg-accent text-white shadow-md'
                            : 'bg-accent/10 text-accent hover:bg-accent/20'
                        }`}
                      >
                        <span className="text-[11px] font-bold">Actions</span>
                        <ChevronDown size={12} className={`transition-transform ${openActionId === devis.id ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredDevis.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink-4">
                    <FileText size={32} className="mx-auto mb-2 opacity-30" />
                    <p>Aucun devis trouvé.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Devis;
