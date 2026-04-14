import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { convertDevis } from '../store/slices/devisSlice';
import { addInvoice } from '../store/slices/invoicesSlice';
import { addToast, openModal } from '../store/slices/uiSlice';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  Search, Download, CheckCircle, Sparkles, Eye, FileText, 
  Mail, Trash2, ChevronDown, RefreshCw, 
  ChevronLeft, ChevronRight, Calendar, Filter, Plus,
  Clock, TrendingUp
} from 'lucide-react';
import type { Devis as DevisType } from '../types';

export const Devis: React.FC = () => {
  const dispatch = useDispatch();
  const devis = useSelector((state: RootState) => state.devis) as DevisType[];
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fonction pour filtrer par période
  const filterByPeriod = (dateStr: string): boolean => {
    const date = new Date(dateStr);
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
  const filteredDevis: DevisType[] = devis.filter((d: DevisType) => {
    const matchesSearch = !searchTerm || 
      d.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || d.status === statusFilter;
    const matchesPeriod = filterByPeriod(d.date);
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDevis = filteredDevis.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDevis.length / itemsPerPage);

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
  };

  const formatAmount = (n: number): string => n.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  // Actions
  const handlePreview = (id: string): void => {
    dispatch(addToast({ message: `👁️ Aperçu PDF du devis ${id}`, type: 'info' }));
    setOpenActionId(null);
  };

  const handleDownload = (id: string): void => {
    dispatch(addToast({ message: `📥 Téléchargement PDF du devis ${id}`, type: 'info' }));
    setOpenActionId(null);
  };

  const handleEmail = (clientName: string): void => {
    dispatch(addToast({ message: `📧 Envoi par email à ${clientName}`, type: 'success' }));
    setOpenActionId(null);
  };

  const handleConvert = (id: string, devisItem: DevisType): void => {
    const newInvoiceId = `FAC-2026-${Math.floor(Math.random() * 1000)}`;
    
    dispatch(convertDevis({ id, invoiceId: newInvoiceId }));
    dispatch(addInvoice({
      id: newInvoiceId,
      client: devisItem.client,
      co: devisItem.co,
      ht: devisItem.ttc / 1.19,
      ttc: devisItem.ttc,
      date: new Date().toISOString().slice(0, 10),
      due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'pending',
      lc: 2,
      desc: devisItem.desc,
      lines: [],
    }));
    
    dispatch(addToast({ message: `✅ ${id} converti en ${newInvoiceId} !`, type: 'success' }));
    setOpenActionId(null);
  };

  const handleOpenAI = (id: string): void => {
    dispatch(addToast({ message: `✨ Résumé IA pour le devis ${id}`, type: 'info' }));
    setOpenActionId(null);
  };

  const handleDelete = (id: string, clientName: string): void => {
    if (window.confirm(`Supprimer le devis ${id} de ${clientName} ?`)) {
      dispatch(addToast({ message: `🗑️ Devis ${id} supprimé`, type: 'info' }));
      setOpenActionId(null);
    }
  };

  const handleEdit = (id: string): void => {
    dispatch(openModal({ type: 'devis', data: { id } }));
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
    setCurrentPage(1);
    dispatch(addToast({ message: `🔍 Filtres réinitialisés`, type: 'info' }));
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenActionId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Statistiques
  const totalAmount = filteredDevis.reduce((sum, d) => sum + d.ttc, 0);
  const convertedCount = filteredDevis.filter(d => d.converted).length;
  const pendingCount = filteredDevis.filter(d => d.status === 'pending').length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-black text-ink">Devis</h1>
          <p className="text-[12px] text-ink-4 mt-0.5">Gérez vos devis et suivez les conversions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg bg-surface-2 border border-border hover:bg-surface transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={14} className="text-ink-4" />
          </button>
          <button
            onClick={() => dispatch(openModal({ type: 'devis', data: null }))}
            className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-600 text-white text-[13px] font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Nouveau devis</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">Total devis</div>
              <div className="text-lg font-black text-blue-700">{formatAmount(totalAmount)} TND</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-200 flex items-center justify-center">
              <FileText size={16} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-green-50/50 rounded-xl p-3 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">Convertis</div>
              <div className="text-lg font-black text-emerald-700">{convertedCount}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-200 flex items-center justify-center">
              <CheckCircle size={16} className="text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-xl p-3 border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">En attente</div>
              <div className="text-lg font-black text-amber-700">{pendingCount}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center">
              <Clock size={16} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
              <option value="draft">📝 Brouillon</option>
              <option value="pending">⏳ En attente</option>
              <option value="signed">✍️ Accepté</option>
              <option value="refused">❌ Refusé</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
          </div>

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
        </div>

        {/* Badges filtres actifs */}
        <div className="flex flex-wrap gap-2 mt-3">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
              Recherche: {searchTerm}
              <button onClick={() => setSearchTerm('')} className="hover:text-red-500">×</button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
              Statut: {statusFilter === 'draft' ? 'Brouillon' : statusFilter === 'pending' ? 'En attente' : statusFilter === 'signed' ? 'Accepté' : 'Refusé'}
              <button onClick={() => setStatusFilter('')} className="hover:text-red-500">×</button>
            </span>
          )}
          {periodFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-medium">
              Période: {periodFilter === 'month' ? 'Ce mois' : periodFilter === '3months' ? '3 derniers mois' : 'Cette année'}
              <button onClick={() => setPeriodFilter('all')} className="hover:text-red-500">×</button>
            </span>
          )}
        </div>
      </div>

      {/* Résultat et export */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-[11px] text-ink-4">
          {filteredDevis.length} devis{filteredDevis.length > 1 ? 's' : ''} trouvé{filteredDevis.length > 1 ? 's' : ''}
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
                <th className="p-2.5 px-3.5">N° Devis</th>
                <th className="p-2.5 px-3.5">Client</th>
                <th className="p-2.5 px-3.5">Objet</th>
                <th className="p-2.5 px-3.5">Montant TTC</th>
                <th className="p-2.5 px-3.5">Date</th>
                <th className="p-2.5 px-3.5">Statut</th>
                <th className="p-2.5 px-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDevis.map((d: DevisType) => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-surface-2 transition-colors group">
                  <td className="p-2.5 px-3.5 font-mono text-[11.5px] font-semibold text-accent">{d.id}</td>
                  <td className="p-2.5 px-3.5">
                    <div className="font-semibold text-ink">{d.client}</div>
                    <div className="text-[10px] text-ink-4">{d.co}</div>
                  </td>
                  <td className="p-2.5 px-3.5 text-[12px] text-ink-3 max-w-[200px] truncate">{d.desc}</td>
                  <td className="p-2.5 px-3.5 font-mono font-bold text-ink">{formatAmount(d.ttc)} TND</td>
                  <td className="p-2.5 px-3.5 text-[11.5px] text-ink-4">{formatDate(d.date)}</td>
                  <td className="p-2.5 px-3.5">
                    <Badge status={d.status === 'signed' ? 'signed' : d.status as any} />
                  </td>
                  <td className="p-2.5 px-3.5 relative">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionId(openActionId === d.id ? null : d.id);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                          openActionId === d.id 
                            ? 'bg-accent text-white shadow-md' 
                            : 'bg-accent/10 text-accent hover:bg-accent/20'
                        }`}
                      >
                        <span className="text-[11px] font-bold">Actions</span>
                        <ChevronDown size={12} className={openActionId === d.id ? 'rotate-180' : ''} />
                      </button>
                      
                      {openActionId === d.id && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-border w-64 z-20 overflow-hidden origin-top-right">
                          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-border">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                                <ChevronDown size={12} className="text-accent" />
                              </div>
                              <span className="text-[11px] font-bold text-accent uppercase tracking-wide">Actions disponibles</span>
                            </div>
                            <p className="text-[10px] text-ink-4 mt-1">Devis {d.id}</p>
                          </div>
                          
                          <div className="py-1">
                            <button
                              onClick={() => handlePreview(d.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-ink-2 hover:bg-indigo-50 transition-all duration-150 group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center">
                                <Eye size={14} className="text-indigo-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">Aperçu PDF</span>
                            </button>
                            
                            <button
                              onClick={() => handleDownload(d.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-ink-2 hover:bg-blue-50 transition-all duration-150 group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center">
                                <FileText size={14} className="text-blue-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">Télécharger PDF</span>
                            </button>
                            
                            <button
                              onClick={() => handleEmail(d.client)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-ink-2 hover:bg-emerald-50 transition-all duration-150 group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center">
                                <Mail size={14} className="text-emerald-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">Envoyer par email</span>
                            </button>
                            
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-1"></div>
                            
                            <button
                              onClick={() => handleEdit(d.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-ink-2 hover:bg-amber-50 transition-all duration-150 group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center">
                                <FileText size={14} className="text-amber-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">Modifier le devis</span>
                            </button>
                            
                            {!d.converted && d.status !== 'refused' && (
                              <button
                                onClick={() => handleConvert(d.id, d)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-purple-700 hover:bg-purple-50 transition-all duration-150 group"
                              >
                                <div className="w-7 h-7 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center">
                                  <TrendingUp size={14} className="text-purple-600" />
                                </div>
                                <span className="flex-1 text-left font-medium">Convertir en facture</span>
                              </button>
                            )}
                            
                            {d.converted && (
                              <div className="flex items-center gap-3 px-4 py-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                                  <CheckCircle size={14} className="text-emerald-600" />
                                </div>
                                <span className="text-[12px] font-medium text-emerald-700">Converti en facture</span>
                              </div>
                            )}
                            
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-1"></div>
                            
                            <button
                              onClick={() => handleOpenAI(d.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-purple-700 hover:bg-purple-50 transition-all duration-150 group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300 flex items-center justify-center">
                                <Sparkles size={14} className="text-purple-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">Résumé IA - Kahina Legal</span>
                            </button>
                            
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-1"></div>
                            
                            <button
                              onClick={() => handleDelete(d.id, d.client)}
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
              Affichage {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredDevis.length)} sur {filteredDevis.length} devis
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
    </div>
  );
};

export default Devis;