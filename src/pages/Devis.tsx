// src/pages/Devis.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch, RootState } from '../store';
import { fetchQuotations, removeQuotation } from '../store/slices/devisSlice';
import { openModal, addToast } from '../store/slices/uiSlice';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Search, Plus, FileText, Download, Eye, Trash2, Send,
  CheckCircle, XCircle, Copy, RefreshCw, Calendar, DollarSign,
  Clock, User
} from 'lucide-react';
import type { Devis as DevisType } from '../types';   // <-- alias pour éviter le conflit

const getStatusBadge = (status: string) => {
  const map: Record<string, 'draft' | 'pending' | 'paid' | 'refused' | 'signed'> = {
    DRAFT: 'draft',
    SENT: 'pending',
    ACCEPTED: 'signed',
    REFUSED: 'refused',
    CONVERTED: 'paid',
  };
  return map[status] || 'draft';
};

export const Devis: React.FC = () => {
  const dispatch = useAppDispatch();
  const quotations = useSelector((state: RootState) => state.devis) as DevisType[];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Charger les devis au montage
  useEffect(() => {
    if (quotations.length === 0) {
      dispatch(fetchQuotations());
    }
  }, [dispatch, quotations.length]);

  const filteredDevis = quotations.filter(d => {
    const clientName = typeof d.client === 'string' ? d.client : (d.client as any)?.name || '';
    const matchesSearch = !searchTerm ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-TN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatAmount = (n: number) => n.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce devis ?')) return;
    try {
      await dispatch(removeQuotation(id)).unwrap();
      dispatch(addToast({ message: '🗑️ Devis supprimé', type: 'info' }));
    } catch (err: any) {
      dispatch(addToast({ message: `❌ ${err?.message || 'Erreur'}`, type: 'error' }));
    }
  };

  const handleRefresh = () => {
    dispatch(fetchQuotations());
    dispatch(addToast({ message: '🔄 Liste actualisée', type: 'info' }));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-black text-ink">Devis</h1>
          <p className="text-[12px] text-ink-4 mt-0.5">Gérez vos devis et suivez leur statut</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="p-2 rounded-lg bg-surface-2 border border-border hover:bg-surface transition-all">
            <RefreshCw size={14} className="text-ink-4" />
          </button>
          <Button variant="primary" onClick={() => dispatch(openModal({ type: 'devis', data: null }))}>
            <Plus size={12} /> Nouveau devis
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-border p-4 mb-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          </select>
        </div>
      </div>

      {/* Tableau des devis */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[10.5px] font-bold text-ink-4 uppercase tracking-wide bg-surface-2 border-b border-border">
                <th className="p-2.5 px-3.5">N° Devis</th>
                <th className="p-2.5 px-3.5">Client</th>
                <th className="p-2.5 px-3.5">Montant TTC</th>
                <th className="p-2.5 px-3.5">Date</th>
                <th className="p-2.5 px-3.5">Statut</th>
                <th className="p-2.5 px-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevis.map((devis) => {
                const clientName = typeof devis.client === 'string' ? devis.client : (devis.client as any)?.name || '—';
                return (
                  <tr key={devis.id} className="border-b border-border/50 hover:bg-surface-2 transition-colors group">
                    <td className="p-2.5 px-3.5 font-mono text-[11.5px] font-semibold text-accent">{devis.id}</td>
                    <td className="p-2.5 px-3.5">
                      <div className="font-semibold text-ink">{clientName}</div>
                      {devis.co && <div className="text-[10px] text-ink-4">{devis.co}</div>}
                    </td>
                    <td className="p-2.5 px-3.5 font-mono font-bold text-ink">
                      {formatAmount(devis.total)} DT
                    </td>
                    <td className="p-2.5 px-3.5 text-[11.5px] text-ink-4">{formatDate(devis.issueDate)}</td>
                    <td className="p-2.5 px-3.5">
                      <Badge status={getStatusBadge(devis.status)}>{devis.status}</Badge>
                    </td>
                    <td className="p-2.5 px-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => dispatch(openModal({ type: 'devis', data: devis }))} className="p-1 rounded hover:bg-accent/10" title="Modifier">
                          <Eye size={14} className="text-ink-4" />
                        </button>
                        <button onClick={() => dispatch(addToast({ message: '📄 PDF en cours...', type: 'info' }))} className="p-1 rounded hover:bg-accent/10" title="Télécharger PDF">
                          <Download size={14} className="text-ink-4" />
                        </button>
                        <button onClick={() => handleDelete(devis.id)} className="p-1 rounded hover:bg-red-100" title="Supprimer">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDevis.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-ink-4">
                    Aucun devis trouvé.
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