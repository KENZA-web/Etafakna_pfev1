// src/components/modals/DevisModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, CheckCircle, Plus, Minus, Upload, Sparkles, RefreshCw } from 'lucide-react';
import { createQuotation, editQuotation } from '../../store/slices/devisSlice';
import { fetchClients, editClient } from '../../store/slices/clientsSlice';
import { addToast, setCurrentPage } from '../../store/slices/uiSlice';
import { Client, LineItem } from '../../types';
import api from '../../services/api';

const CURRENCIES: Record<string, { symbol: string; label: string }> = {
  TND: { symbol: 'DT', label: 'Dinar Tunisien (TND)' },
  DZD: { symbol: 'DA', label: 'Dinar Algerien (DZD)' },
  MAD: { symbol: 'DH', label: 'Dirham Marocain (MAD)' },
  LYD: { symbol: 'LD', label: 'Dinar Libyen (LYD)' },
  EGP: { symbol: 'E£', label: 'Livre Egyptienne (EGP)' },
  SAR: { symbol: 'SR', label: 'Riyal Saoudien (SAR)' },
  AED: { symbol: 'AED', label: 'Dirham Emirats (AED)' },
  EUR: { symbol: '€', label: 'Euro (EUR)' },
  USD: { symbol: '$', label: 'Dollar US (USD)' },
};

const COMPANY_KEY = 'etafakna_company_profile';
const loadCompany = () => { try { const s = localStorage.getItem(COMPANY_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; } };
const saveCompany = (p: any) => { try { localStorage.setItem(COMPANY_KEY, JSON.stringify(p)); } catch {} };

interface VisibilityState {
  companyAddress: boolean; companyPhone: boolean; companyEmail: boolean;
  companyTaxId: boolean; companyRib: boolean; companyIban: boolean;
  clientSiret: boolean; clientAddress: boolean; clientEmail: boolean;
  clientPhone: boolean; validUntil: boolean; notes: boolean;
}

interface DevisModalProps { editData?: any; }

const DevisModal: React.FC<DevisModalProps> = ({ editData }) => {
  const dispatch = useDispatch<any>();
  const clients = useSelector((state: any) => state.clients) as Client[];
  const modalData = useSelector((state: any) => state.ui.modalData);
  const isEditing = !!(editData && editData.id);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => loadCompany().logo || null);
  const [companyName, setCompanyName] = useState(() => loadCompany().name || '');
  const [companyAddress, setCompanyAddress] = useState(() => loadCompany().address || '');
  const [companyPhone, setCompanyPhone] = useState(() => loadCompany().phone || '');
  const [companyEmail, setCompanyEmail] = useState(() => loadCompany().email || '');
  const [companyTaxId, setCompanyTaxId] = useState(() => loadCompany().taxId || '');
  const [companyRib, setCompanyRib] = useState(() => loadCompany().rib || '');
  const [companyIban, setCompanyIban] = useState(() => loadCompany().iban || '');

  const [fiscalMode, setFiscalMode] = useState<'manuel' | 'auto'>('manuel');
  const [fiscalAnalysis, setFiscalAnalysis] = useState<any>(null);
  const [fiscalLoading, setFiscalLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [visibility, setVisibility] = useState<VisibilityState>({
    companyAddress: true, companyPhone: true, companyEmail: true,
    companyTaxId: true, companyRib: false, companyIban: false,
    clientSiret: true, clientAddress: true, clientEmail: false,
    clientPhone: false, validUntil: true, notes: false,
  });
  const toggle = (key: keyof VisibilityState) => setVisibility(prev => ({ ...prev, [key]: !prev[key] }));

  const [formData, setFormData] = useState({
    id: '',
    quotationNumber: `DEV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    date: new Date().toISOString().slice(0, 10),
    validUntil: '',
    clientId: '', clientName: '', clientEmail: '', clientPhone: '', clientAddress: '', clientTaxId: '',
    items: [] as LineItem[],
    taxRate: 19, enableTva: true, variableTva: false, enableTimbre: false, timbreValue: 1,
    currency: 'TND', notes: '',
    extraTaxes: [] as { id: string; label: string; rate: number }[],
  });

  useEffect(() => {
    saveCompany({ name: companyName, address: companyAddress, phone: companyPhone, email: companyEmail, taxId: companyTaxId, rib: companyRib, iban: companyIban, logo: companyLogo });
  }, [companyName, companyAddress, companyPhone, companyEmail, companyTaxId, companyRib, companyIban, companyLogo]);

  useEffect(() => {
    setLoadingClients(true);
    dispatch(fetchClients()).unwrap().catch(() => {}).finally(() => setLoadingClients(false));
  }, [dispatch]);

  useEffect(() => {
    if (isEditing) {
      const c = clients.find(cl => cl.name === editData.client || cl.id === editData.clientId);
      setFormData({
        id: editData.id,
        quotationNumber: editData.quotationNumber || editData.id,
        date: editData.issueDate ? editData.issueDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        validUntil: editData.validUntil ? editData.validUntil.slice(0, 10) : '',
        clientId: c?.id || editData.clientId || '',
        clientName: c?.name || editData.client || '',
        clientEmail: c?.email || '',
        clientPhone: c?.phone || '',
        clientAddress: c?.address || '',
        clientTaxId: c?.taxId || '',
        items: (editData.lines || []).map((l: any) => ({ id: l.id || String(Math.random()), description: l.description || '', quantity: Number(l.quantity) || 1, unitPrice: Number(l.unitPrice) || 0, vatRate: 'NINETEEN' as any, lineTotal: Number(l.lineTotal) || 0 })),
        taxRate: 19, enableTva: true, variableTva: false, enableTimbre: false, timbreValue: 1,
        currency: editData.currency || 'TND',
        notes: editData.notes || editData.description || '',
        extraTaxes: [],
      });
    } else if (modalData?.clientId) {
      const c = clients.find(cl => cl.id === modalData.clientId);
      setFormData(prev => ({ ...prev, clientId: modalData.clientId, clientName: c?.name || modalData.clientName || '', clientEmail: c?.email || '', clientPhone: c?.phone || '', clientAddress: c?.address || '', clientTaxId: c?.taxId || '' }));
    }
  }, [isEditing, clients]);

  useEffect(() => {
    if (!formData.clientId) return;
    const c = clients.find(cl => cl.id === formData.clientId);
    if (c) setFormData(prev => ({ ...prev, clientName: c.name, clientEmail: c.email || '', clientPhone: c.phone || '', clientAddress: c.address || '', clientTaxId: c.taxId || '' }));
  }, [formData.clientId]);

  useEffect(() => {
    if (fiscalMode !== 'auto') return;
    if (!formData.clientId && formData.items.length === 0) return;
    const timer = setTimeout(async () => {
      setFiscalLoading(true);
      try {
        const res = await api.post('/invoices/fiscal-preview', { clientId: formData.clientId || null, items: formData.items.map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })), description: formData.notes });
        const d = res.data.data;
        setFiscalAnalysis(d);
        setFormData(prev => ({ ...prev, taxRate: d.tvaRate, enableTva: d.tvaRate > 0, enableTimbre: d.timbreAmount > 0, currency: d.detectedCurrency || prev.currency }));
      } catch {} finally { setFiscalLoading(false); }
    }, 600);
    return () => clearTimeout(timer);
  }, [fiscalMode, formData.clientId, formData.items, formData.notes]);

  const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, vatRate: 'NINETEEN' as any, lineTotal: 0 }] }));
  const updateItem = (idx: number, field: keyof LineItem, value: any) => { const items = [...formData.items]; items[idx] = { ...items[idx], [field]: value }; items[idx].lineTotal = items[idx].quantity * items[idx].unitPrice; setFormData(prev => ({ ...prev, items })); };
  const removeItem = (idx: number) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const totals = (() => {
    const ht = formData.items.reduce((s, i) => s + i.lineTotal, 0);
    let tvaAmount = 0;
    if (formData.variableTva) {
      tvaAmount = formData.items.reduce((s, i) => {
        const rate = typeof i.vatRate === 'number' ? i.vatRate : 19;
        return s + i.lineTotal * rate / 100;
      }, 0);
    } else if (formData.enableTva) {
      tvaAmount = ht * formData.taxRate / 100;
    }
    const timbreAmount = formData.enableTimbre ? formData.timbreValue : 0;
    const extraTotal = formData.extraTaxes.reduce((s, t) => s + ht * t.rate / 100, 0);
    return { ht, tvaAmount, timbreAmount, extraTotal, ttc: ht + tvaAmount + timbreAmount + extraTotal };
  })();

  const sym = CURRENCIES[formData.currency]?.symbol || formData.currency;
  const fmt = (n: number) => n.toFixed(3);
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onloadend = () => setCompanyLogo(r.result as string); r.readAsDataURL(file); } };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientId) newErrors.clientId = 'Veuillez sélectionner un client';
    if (formData.items.length === 0) newErrors.items = 'Ajoutez au moins un article';
    formData.items.forEach((item, idx) => {
      if (!item.description.trim()) newErrors[`item_desc_${idx}`] = 'Description requise';
      if (item.unitPrice <= 0) newErrors[`item_price_${idx}`] = 'Prix invalide';
      if (item.quantity <= 0) newErrors[`item_qty_${idx}`] = 'Quantité invalide';
    });
    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSaving(true);
    // Mettre à jour le client en base si les infos ont changé
    if (formData.clientId) {
      const currentClient = clients.find(c => c.id === formData.clientId);
      if (currentClient) {
        const clientUpdates: Record<string, any> = {};
        if (formData.clientName && formData.clientName !== currentClient.name) clientUpdates.name = formData.clientName;
        if (formData.clientEmail !== (currentClient.email || '')) clientUpdates.email = formData.clientEmail || null;
        if (formData.clientPhone !== (currentClient.phone || '')) clientUpdates.phone = formData.clientPhone || null;
        if (formData.clientAddress !== (currentClient.address || '')) clientUpdates.address = formData.clientAddress || null;
        if (formData.clientTaxId !== (currentClient.taxId || '')) clientUpdates.taxId = formData.clientTaxId || null;
        if (Object.keys(clientUpdates).length > 0) {
          try {
            await dispatch(editClient({ id: formData.clientId, ...clientUpdates } as any)).unwrap();
          } catch { /* continue */ }
        }
      }
    }
    const issueDate = formData.date;
    const validUntil = formData.validUntil || new Date(new Date(issueDate).getTime() + 30 * 86400000).toISOString().slice(0, 10);
    const lines = formData.items.map((it, i) => ({ description: it.description || 'Article', quantity: it.quantity || 1, unitPrice: it.unitPrice || 0, vatRate: formData.enableTva ? formData.taxRate : 0, position: i }));
    try {
      if (isEditing) {
        await dispatch(editQuotation({ id: formData.id, clientId: formData.clientId, issueDate, validUntil, currency: formData.currency as any, notes: formData.notes || null, description: formData.notes || null, lines } as any)).unwrap();
        dispatch(addToast({ message: 'Devis modifié', type: 'success' }));
        dispatch(setCurrentPage('devis'));
      } else {
        const created = await dispatch(createQuotation({ clientId: formData.clientId, issueDate, validUntil, currency: formData.currency, notes: formData.notes || null, description: formData.notes || null, lines } as any)).unwrap();
        dispatch(addToast({ message: 'Devis créé — aperçu PDF en cours...', type: 'success' }));
        dispatch(setCurrentPage('devis'));
        // Ouvrir l'aperçu PDF automatiquement après création
        try {
          const response = await api.get(`/quotations/${created.id}/pdf`, { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
          // Dispatch un event custom pour que la page Devis ouvre le PDF viewer
          window.dispatchEvent(new CustomEvent('open-pdf-preview', { detail: { url, fileName: `devis-${created.quotationNumber || created.id}.pdf` } }));
        } catch { /* silently fail — devis is created */ }
      }
    } catch (err: any) {
      dispatch(addToast({ message: err?.message || 'Erreur', type: 'error' }));
    } finally { setSaving(false); }
  };

  const Sw = ({ on, onToggle, disabled = false }: { on: boolean; onToggle: () => void; disabled?: boolean }) => (
    <button type="button" onClick={onToggle} disabled={disabled}
      className={`relative inline-flex items-center w-10 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-[#1C6AE4]' : 'bg-gray-600'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="h-full bg-gray-100 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <button onClick={() => dispatch(setCurrentPage('devis'))} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-800">{isEditing ? 'Modifier le devis' : 'Nouveau devis'}</h1>
          <p className="text-xs text-gray-400">{formData.quotationNumber}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#1C6AE4] hover:bg-[#1555C8] disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-blue-200 transition"
        >
          <CheckCircle className="w-4 h-4" />
          {saving ? 'Enregistrement...' : isEditing ? 'Enregistrer le devis' : 'Générer le devis'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div style={{ width: '320px', minWidth: '320px' }} className="bg-gray-950 flex flex-col flex-shrink-0 overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-white/5 flex-shrink-0">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Configuration</p>
            <h2 className="text-white font-bold text-sm">{isEditing ? 'Modifier' : 'Nouveau devis'}</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Client</p>
              <select value={formData.clientId} onChange={e => setFormData(p => ({ ...p, clientId: e.target.value }))} disabled={loadingClients}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#1C6AE4] transition cursor-pointer">
                <option value="">{loadingClients ? 'Chargement...' : 'Sélectionner...'}</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {formErrors.clientId && <p className="text-[11px] text-red-400 mt-1">{formErrors.clientId}</p>}
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Devise</p>
              <select value={formData.currency} onChange={e => setFormData(p => ({ ...p, currency: e.target.value }))} disabled={fiscalMode === 'auto'}
                className={`w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#1C6AE4] transition cursor-pointer ${fiscalMode === 'auto' ? 'opacity-40' : ''}`}>
                {Object.entries(CURRENCIES).map(([code, d]) => <option key={code} value={code}>{d.symbol} — {d.label}</option>)}
              </select>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Fiscal</p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <button onClick={() => { setFiscalMode('manuel'); setFiscalAnalysis(null); }}
                  className={`py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 ${fiscalMode === 'manuel' ? 'bg-[#1C6AE4] text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-600'}`}>
                  <RefreshCw className="w-3 h-3" /> Manuel
                </button>
                <button onClick={() => setFiscalMode('auto')}
                  className={`py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 ${fiscalMode === 'auto' ? 'bg-[#1C6AE4] text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-600'}`}>
                  <Sparkles className="w-3 h-3" /> Auto IA
                </button>
              </div>
              {fiscalMode === 'manuel' && (
                <div className="space-y-0">
                  {/* TVA globale — radio */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition cursor-pointer" onClick={() => setFormData(p => ({ ...p, enableTva: true, variableTva: false }))}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${formData.enableTva && !formData.variableTva ? 'border-[#1C6AE4] bg-[#1C6AE4]' : 'border-gray-500'}`}>
                      {formData.enableTva && !formData.variableTva && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-gray-300 flex-1">TVA globale</span>
                  </div>
                  {formData.enableTva && !formData.variableTva && (
                    <div className="flex items-center justify-between px-3 py-1.5 ml-4">
                      <span className="text-sm text-gray-400">Taux</span>
                      <div className="flex items-center gap-1">
                        <input type="number" value={formData.taxRate} onChange={e => setFormData(p => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))}
                          className="w-14 px-2 py-1 bg-gray-800 border border-white/10 rounded-lg text-sm text-white text-right outline-none focus:border-[#1C6AE4]" />
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                  )}

                  {/* TVA par ligne — radio */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition cursor-pointer" onClick={() => setFormData(p => ({ ...p, variableTva: true, enableTva: false }))}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${formData.variableTva ? 'border-[#1C6AE4] bg-[#1C6AE4]' : 'border-gray-500'}`}>
                      {formData.variableTva && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-gray-300 flex-1">TVA par ligne</span>
                  </div>
                  {formData.variableTva && (
                    <div className="ml-4 px-3 py-2 space-y-1.5">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Taux par article</p>
                      {formData.items.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400 flex-1 truncate">{item.description || `Article ${idx + 1}`}</span>
                          <input type="number" value={typeof item.vatRate === 'number' ? item.vatRate : 19}
                            onChange={e => updateItem(idx, 'vatRate', parseFloat(e.target.value) || 0)}
                            className="w-14 px-2 py-1 bg-gray-800 border border-white/10 rounded-lg text-xs text-white text-right outline-none focus:border-[#1C6AE4]" />
                          <span className="text-gray-500 text-xs">%</span>
                        </div>
                      ))}
                      {formData.items.length === 0 && <p className="text-[11px] text-gray-600">Ajoutez des articles d'abord</p>}
                    </div>
                  )}

                  {/* Timbre fiscal */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition">
                    <span className="text-sm text-gray-300">Timbre fiscal</span>
                    <Sw on={formData.enableTimbre} onToggle={() => setFormData(p => ({ ...p, enableTimbre: !p.enableTimbre }))} />
                  </div>
                  {formData.enableTimbre && (
                    <div className="flex items-center justify-between px-3 py-1.5 ml-4">
                      <span className="text-sm text-gray-400">Valeur</span>
                      <div className="flex items-center gap-1">
                        <input type="number" value={formData.timbreValue} onChange={e => setFormData(p => ({ ...p, timbreValue: parseFloat(e.target.value) || 0 }))}
                          className="w-20 px-2 py-1 bg-gray-800 border border-white/10 rounded-lg text-sm text-white text-right outline-none focus:border-[#1C6AE4]" />
                        <span className="text-gray-500 text-sm">{sym}</span>
                      </div>
                    </div>
                  )}

                  {/* Taxes custom */}
                  {formData.extraTaxes.map((tax, idx) => (
                    <div key={tax.id} className="px-3 py-2 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input value={tax.label} onChange={e => {
                          const t = [...formData.extraTaxes]; t[idx] = { ...t[idx], label: e.target.value };
                          setFormData(p => ({ ...p, extraTaxes: t }));
                        }} placeholder="Titre taxe" className="flex-1 px-2 py-1 bg-gray-800 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[#1C6AE4]" />
                        <button onClick={() => setFormData(p => ({ ...p, extraTaxes: p.extraTaxes.filter((_, i) => i !== idx) }))}
                          className="w-5 h-5 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 transition">
                          <Minus size={10} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 ml-1">
                        <input type="number" value={tax.rate} onChange={e => {
                          const t = [...formData.extraTaxes]; t[idx] = { ...t[idx], rate: parseFloat(e.target.value) || 0 };
                          setFormData(p => ({ ...p, extraTaxes: t }));
                        }} className="w-20 px-2 py-1 bg-gray-800 border border-white/10 rounded-lg text-xs text-white text-right outline-none focus:border-[#1C6AE4]" />
                        <span className="text-gray-500 text-xs">%</span>
                      </div>
                    </div>
                  ))}

                  {/* Bouton + ajouter taxe */}
                  <button onClick={() => setFormData(p => ({ ...p, extraTaxes: [...p.extraTaxes, { id: Date.now().toString(), label: '', rate: 0 }] }))}
                    className="flex items-center gap-1.5 px-3 py-2 w-full text-[11px] text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">
                    <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center"><Plus size={8} /></div>
                    Ajouter une taxe
                  </button>
                </div>
              )}
              {fiscalMode === 'auto' && fiscalLoading && <p className="text-xs text-[#1C6AE4] animate-pulse mt-1 px-1">Analyse en cours...</p>}
              {fiscalMode === 'auto' && fiscalAnalysis && (
                <div className="mt-2 bg-[#1C6AE4]/10 border border-[#1C6AE4]/30 rounded-xl p-2.5 space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-gray-400">Pays</span><span className="text-white">{fiscalAnalysis.detectedCountry}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-400">TVA</span><span className="text-white">{fiscalAnalysis.tvaRate}%</span></div>
                  <div className="flex justify-between text-xs pt-1 border-t border-[#1C6AE4]/30 font-bold"><span className="text-[#93b8f5]">Total TTC</span><span className="text-[#93b8f5]">{fiscalAnalysis.total?.toFixed(3)} {fiscalAnalysis.detectedCurrency}</span></div>
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Afficher dans le doc</p>
              <div className="space-y-0">
                {([['notes', 'Notes'], ['validUntil', 'Validité']] as [keyof VisibilityState, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition">
                    <span className="text-sm text-gray-300">{label}</span>
                    <Sw on={visibility[key]} onToggle={() => toggle(key)} />
                  </div>
                ))}
              </div>
            </div>

          </div>
          {/* bouton déplacé dans la barre d'action du panneau droit */}
        </div>

        {/* RIGHT PANEL — Document */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
          <div className="flex-1 overflow-y-auto flex justify-center py-8 px-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden self-start">

            {/* Header doc */}
            <div className="p-8 pb-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div onClick={() => logoInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#1C6AE4] transition flex-shrink-0 bg-gray-50">
                    {companyLogo ? <img src={companyLogo} alt="logo" className="w-full h-full object-contain rounded-xl" /> : <><Upload className="w-6 h-6 text-gray-300 mb-1" /><span className="text-[9px] text-gray-400 text-center leading-tight px-1">Ajouter logo</span></>}
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nom de la société"
                      className="text-base font-bold text-gray-700 w-full border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-0.5 transition" />
                    {visibility.companyAddress && <input value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="Adresse" className="text-xs text-gray-400 w-full border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-0.5 transition" />}
                    <div className="flex flex-wrap gap-x-4">
                      {visibility.companyPhone && <input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="Téléphone" className="text-xs text-gray-400 border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-0.5 transition" />}
                      {visibility.companyEmail && <input value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} placeholder="Email" className="text-xs text-gray-400 border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-0.5 transition" />}
                    </div>
                    <div className="flex flex-wrap gap-x-4">
                      {visibility.companyTaxId && <input value={companyTaxId} onChange={e => setCompanyTaxId(e.target.value)} placeholder="MF/Siret" className="text-xs text-gray-400 border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-0.5 transition" />}
                      {visibility.companyRib && <input value={companyRib} onChange={e => setCompanyRib(e.target.value)} placeholder="RIB" className="text-xs text-gray-400 border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-0.5 transition" />}
                      {visibility.companyIban && <input value={companyIban} onChange={e => setCompanyIban(e.target.value)} placeholder="IBAN" className="text-xs text-gray-400 border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-0.5 transition" />}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {([['companyAddress','Adresse'],['companyPhone','Tél'],['companyEmail','Email'],['companyTaxId','MF'],['companyRib','RIB'],['companyIban','IBAN']] as [keyof VisibilityState, string][]).map(([k, l]) => (
                        <button key={k} onClick={() => toggle(k)} className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition ${visibility[k] ? 'bg-red-50 text-red-400 border-red-200' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-[#1C6AE4]'}`}>
                          {visibility[k] ? <Minus size={8} /> : <Plus size={8} />}{l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-3 flex-shrink-0">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Devis N°</p>
                    <input
                      value={formData.quotationNumber}
                      onChange={e => setFormData(p => ({ ...p, quotationNumber: e.target.value }))}
                      className="text-sm font-bold text-gray-700 border-0 border-b border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent text-right w-36"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Date</p>
                    <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                      className="text-sm text-gray-600 border-0 border-b border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent text-right" />
                  </div>
                  {visibility.validUntil && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Valide jusqu'au</p>
                      <input type="date" value={formData.validUntil} onChange={e => setFormData(p => ({ ...p, validUntil: e.target.value }))}
                        className="text-sm text-gray-600 border-0 border-b border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent text-right" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 mx-8" />

            {/* Client */}
            <div className="px-8 py-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">Adressé à</p>
              <input value={formData.clientName} onChange={e => setFormData(p => ({ ...p, clientName: e.target.value }))} placeholder="Nom Client"
                className="text-sm font-semibold text-gray-700 w-full border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-0.5 transition" />
              {visibility.clientSiret && <input value={formData.clientTaxId} onChange={e => setFormData(p => ({ ...p, clientTaxId: e.target.value }))} placeholder="Siret/MF" className="text-xs text-gray-400 w-full border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-0.5 transition mt-1" />}
              {visibility.clientAddress && <input value={formData.clientAddress} onChange={e => setFormData(p => ({ ...p, clientAddress: e.target.value }))} placeholder="Adresse" className="text-xs text-gray-400 w-full border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-0.5 transition mt-1" />}
              <div className="flex gap-4 mt-1">
                {visibility.clientEmail && <input type="email" value={formData.clientEmail} onChange={e => setFormData(p => ({ ...p, clientEmail: e.target.value }))} placeholder="Email" className="text-xs text-gray-400 border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-0.5 transition" />}
                {visibility.clientPhone && <input type="tel" value={formData.clientPhone} onChange={e => setFormData(p => ({ ...p, clientPhone: e.target.value }))} placeholder="Téléphone" className="text-xs text-gray-400 border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-0.5 transition" />}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-3">
                {([['clientSiret','Siret/MF'],['clientAddress','Adresse'],['clientEmail','Email'],['clientPhone','Tél']] as [keyof VisibilityState, string][]).map(([k, l]) => (
                  <button key={k} onClick={() => toggle(k)} className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition ${visibility[k] ? 'bg-red-50 text-red-400 border-red-200' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-[#1C6AE4]'}`}>
                    {visibility[k] ? <Minus size={8} /> : <Plus size={8} />}{l}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100 mx-8" />

            {/* Articles */}
            <div className="px-8 py-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wide pb-3">Description</th>
                    <th className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wide pb-3 w-16">Qté</th>
                    <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-wide pb-3 w-28">P.U. HT</th>
                    {formData.variableTva && <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-wide pb-3 w-16">TVA%</th>}
                    <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-wide pb-3 w-28">Total HT</th>
                    <th className="w-8 pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => {
                    const lineVat = typeof item.vatRate === 'number' ? item.vatRate : 19;
                    return (
                      <tr key={item.id} className="border-b border-gray-50 group">
                        <td className="py-2 pr-2"><input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Description..." className="w-full text-sm text-gray-700 border-0 border-b border-transparent hover:border-gray-200 focus:border-[#1C6AE4] outline-none bg-transparent py-1 transition" /></td>
                        <td className="py-2 px-1"><input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} className="w-full text-sm text-gray-700 text-center border border-gray-200 rounded-lg px-1 py-1 focus:border-[#1C6AE4] outline-none" /></td>
                        <td className="py-2 px-1"><input type="number" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full text-sm text-gray-700 text-right border border-gray-200 rounded-lg px-2 py-1 focus:border-[#1C6AE4] outline-none" /></td>
                        {formData.variableTva && (
                          <td className="py-2 px-1">
                            <div className="flex items-center gap-0.5">
                              <input type="number" value={lineVat} onChange={e => updateItem(idx, 'vatRate', parseFloat(e.target.value) || 0)}
                                className="w-full text-sm text-gray-700 text-right border border-gray-200 rounded-lg px-1 py-1 focus:border-[#1C6AE4] outline-none" />
                              <span className="text-xs text-gray-400">%</span>
                            </div>
                          </td>
                        )}
                        <td className="py-2 pl-1 text-right text-sm font-mono text-gray-700">{fmt(item.lineTotal)} {sym}</td>
                        <td className="py-2 pl-1"><button onClick={() => removeItem(idx)} className="w-5 h-5 rounded-full bg-red-400 hover:bg-red-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"><Minus size={10} /></button></td>
                      </tr>
                    );
                  })}
                  {formData.items.length === 0 && <tr><td colSpan={formData.variableTva ? 6 : 5} className="py-10 text-center text-gray-300 text-sm">Aucun article — cliquez sur + pour ajouter</td></tr>}
                </tbody>
              </table>
              <div className="flex justify-center mt-4">
                <button onClick={addItem} className="w-7 h-7 rounded-full bg-[#1C6AE4] hover:bg-[#1C6AE4] flex items-center justify-center text-white transition shadow-sm"><Plus size={14} /></button>
              </div>
              {formErrors.items && <p className="text-[11px] text-red-500 text-center mt-1">{formErrors.items}</p>}
              <div className="flex justify-end mt-6">
                <div className="w-60 border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100"><span className="text-xs text-gray-500">Total HT</span><span className="text-xs font-mono text-gray-700">{fmt(totals.ht)} {sym}</span></div>
                  {(formData.enableTva || formData.variableTva) && <div className="flex justify-between px-4 py-2.5 border-b border-gray-100"><span className="text-xs text-gray-500">TVA {formData.variableTva ? '(par ligne)' : `(${formData.taxRate}%)`}</span><span className="text-xs font-mono text-gray-700">{fmt(totals.tvaAmount)} {sym}</span></div>}
                  {formData.enableTimbre && <div className="flex justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100"><span className="text-xs text-gray-500">Timbre Fiscal</span><span className="text-xs font-mono text-gray-700">{fmt(formData.timbreValue)} {sym}</span></div>}
                  {formData.extraTaxes.map(t => t.rate !== 0 && (
                    <div key={t.id} className="flex justify-between px-4 py-2.5 border-b border-gray-100">
                      <span className="text-xs text-gray-500">{t.label || 'Taxe'} ({t.rate}%)</span>
                      <span className="text-xs font-mono text-gray-700">{fmt(totals.ht * t.rate / 100)} {sym}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-3 bg-gray-50"><span className="text-sm font-bold text-gray-700">Total TTC</span><span className="text-sm font-bold font-mono text-[#1C6AE4]">{fmt(totals.ttc)} {sym}</span></div>
                </div>
              </div>
            </div>

            {visibility.notes && (
              <>
                <div className="h-px bg-gray-100 mx-8" />
                <div className="px-8 py-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Notes & Objet</p>
                  <textarea rows={3} value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Objet du devis, conditions..." className="w-full text-sm text-gray-600 border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1C6AE4] outline-none resize-none" />
                </div>
              </>
            )}

            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400">
              Devis valable 30 jours — Merci de votre confiance.
            </div>

          </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DevisModal;
