import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X, Plus, Trash2, Calendar, Building2, Mail, Phone, MapPin,
  CreditCard, Percent, FileText, DownloadCloud, CheckCircle,
  Sparkles, Calculator, AlertCircle, Settings, Upload, RefreshCw
} from 'lucide-react';
import { addInvoice, updateInvoice } from '../../store/slices/invoicesSlice';
import { closeModal, addToast } from '../../store/slices/uiSlice';
import { Client, Invoice, LineItem } from '../../types';
import { FiscalAnalyzer } from '../ai/FiscalAnalyzer';

// Liste des devises
const currencies = [
  { code: 'TND', symbol: 'DT', name: 'Dinar Tunisien', country: '🇹🇳' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: '🇪🇺' },
  { code: 'USD', symbol: '$', name: 'Dollar US', country: '🇺🇸' },
];

// Informations par défaut de la société (E-Tafakna)
const DEFAULT_COMPANY = {
  name: 'E-Tafakna',
  logo: null,
  address: 'Immeuble Noomix, 5ème étage, Rue du Lac Huron, Les Berges du Lac, 1053 Tunis',
  phone: '+216 70 000 000',
  email: 'contact@etafakna.com',
  taxId: '1234567X',
  iban: 'TN59 1000 1234 5678 9012 3456'
};

// Composant d'aperçu réaliste (inchangé, mais on le laisse ici pour la complétude)
const InvoicePreview: React.FC<{ formData: any; totals: { ht: number; tvaAmount: number; timbreAmount: number; ttc: number }; companyLogo?: string; companyName?: string }> = ({ 
  formData, totals, companyLogo, companyName 
}) => {
  const getCurrencySymbol = () => {
    const curr = currencies.find(c => c.code === formData.currency);
    return curr?.symbol || 'DT';
  };

  const formatAmount = (amount: number) => amount.toFixed(3);
  const displayCompanyName = companyName || DEFAULT_COMPANY.name;
  const displayCompanyLogo = companyLogo || DEFAULT_COMPANY.logo;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden font-sans">
      {/* En-tête avec logo et société */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {displayCompanyLogo ? (
              <img src={displayCompanyLogo} alt="Logo" className="h-12 w-auto object-contain" />
            ) : (
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent font-bold text-xl">E</div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">{displayCompanyName}</h2>
              <p className="text-xs text-gray-500 mt-1">{DEFAULT_COMPANY.address}</p>
              <p className="text-xs text-gray-500">Tél : {DEFAULT_COMPANY.phone} | Email : {DEFAULT_COMPANY.email}</p>
              <p className="text-xs text-gray-500">Matricule fiscal : {DEFAULT_COMPANY.taxId}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-accent">FACTURE</h1>
            <p className="text-sm text-gray-500 mt-1">N° {formData.invoiceNumber}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between text-sm">
        <div>
          <p><span className="font-semibold">Date d'émission :</span> {formData.date || '—'}</p>
          <p className="mt-1"><span className="font-semibold">Date d'échéance :</span> {formData.dueDate || '—'}</p>
        </div>
        <div className="text-right">
          <p><span className="font-semibold">Mode de paiement :</span> Virement bancaire</p>
          <p className="mt-1"><span className="font-semibold">IBAN :</span> {DEFAULT_COMPANY.iban}</p>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-700 mb-2">Facturé à :</h3>
        <p className="font-semibold">{formData.clientName || 'Client'}</p>
        <p className="text-sm text-gray-600">{formData.clientCo}</p>
        <p className="text-sm text-gray-600">{formData.clientAddress}</p>
        <div className="mt-1 text-sm text-gray-500">
          <p>Email : {formData.clientEmail || '—'}</p>
          <p>Tél : {formData.clientPhone || '—'}</p>
          <p>Matricule fiscal : {formData.clientTaxId || '—'}</p>
        </div>
      </div>

      <div className="px-6 py-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 text-left">Description</th>
              <th className="py-2 text-center w-16">Qté</th>
              <th className="py-2 text-right w-24">Prix unit. HT</th>
              <th className="py-2 text-right w-24">TVA %</th>
              <th className="py-2 text-right w-28">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item: LineItem, idx: number) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-2">{item.description || '—'}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{item.unitPrice.toFixed(3)} {getCurrencySymbol()}</td>
                <td className="py-2 text-right">{formData.enableTva ? item.vatRate : 0}%</td>
                <td className="py-2 text-right font-mono">{(item.quantity * item.unitPrice).toFixed(3)} {getCurrencySymbol()}</td>
              </tr>
            ))}
            {formData.items.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-center text-gray-400">Aucun article</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between"><span>Total HT</span><span className="font-mono">{formatAmount(totals.ht)} {getCurrencySymbol()}</span></div>
            {formData.enableTva && <div className="flex justify-between"><span>TVA ({formData.taxRate}%)</span><span className="font-mono">{formatAmount(totals.tvaAmount)} {getCurrencySymbol()}</span></div>}
            {formData.enableTimbre && <div className="flex justify-between"><span>Timbre fiscal</span><span className="font-mono">{formatAmount(totals.timbreAmount)} {getCurrencySymbol()}</span></div>}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200"><span>Total TTC</span><span className="text-accent">{formatAmount(totals.ttc)} {getCurrencySymbol()}</span></div>
          </div>
        </div>
      </div>

      {formData.notes && (
        <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
          <p className="font-semibold">Notes :</p>
          <p>{formData.notes}</p>
        </div>
      )}

      <div className="px-6 py-2 text-center text-xs text-gray-400 border-t border-gray-200">
        Merci de votre confiance — Paiement à réception sous 30 jours.
      </div>
    </div>
  );
};

interface InvoiceModalProps {
  editData?: Invoice | null;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ editData }) => {
  const dispatch = useDispatch();
  const clients = useSelector((state: any) => state.clients) as Client[];
  const modalData = useSelector((state: any) => state.ui.modalData);
  
  // Déterminer si on a un clientId à pré-remplir (cas "Facturer" depuis Clients)
  const prefillClientId = modalData?.clientId && !editData ? modalData.clientId : null;

  // États du formulaire
  const [formData, setFormData] = useState({
    id: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    clientId: prefillClientId || (editData ? (clients.find(c => c.name === editData.client)?.id || '') : ''),
    clientName: editData?.client || '',
    clientCo: editData?.co || '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientTaxId: '',
    items: [] as LineItem[],
    taxRate: 19,
    enableTva: true,
    variableTva: false,
    enableTimbre: false,
    currency: 'TND',
    notes: editData?.desc || '',
  });

  const [companyName, setCompanyName] = useState(DEFAULT_COMPANY.name);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [showFiscalAnalyzer, setShowFiscalAnalyzer] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [fiscalMode, setFiscalMode] = useState<'manuel' | 'auto'>('manuel');

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000);
    return `FAC-${year}-${random}`;
  };

  // Chargement des données en mode édition ou préremplissage client
  useEffect(() => {
    if (editData) {
      const client = clients.find(c => c.name === editData.client);
      setFormData({
        id: editData.id,
        invoiceNumber: editData.id,
        date: editData.date,
        dueDate: editData.due,
        clientId: client?.id || '',
        clientName: editData.client,
        clientCo: editData.co,
        clientEmail: client?.email || '',
        clientPhone: client?.phone || '',
        clientAddress: client?.addr || '',
        clientTaxId: client?.taxId || '',
        items: editData.lines || [],
        taxRate: 19,
        enableTva: true,
        variableTva: false,
        enableTimbre: false,
        currency: 'TND',
        notes: editData.desc || '',
      });
    } else {
      setFormData(prev => ({ ...prev, invoiceNumber: generateInvoiceNumber() }));
    }
  }, [editData, clients]);

  // Mise à jour automatique des infos client quand clientId change
  useEffect(() => {
    if (formData.clientId) {
      const client = clients.find(c => c.id === formData.clientId);
      if (client) {
        setFormData(prev => ({
          ...prev,
          clientName: client.name,
          clientCo: client.co,
          clientEmail: client.email,
          clientPhone: client.phone,
          clientAddress: client.addr,
          clientTaxId: client.taxId,
        }));
      }
    }
  }, [formData.clientId, clients]);

  // Gestion des articles
  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      vatRate: formData.taxRate,
      total: 0,
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCompanyLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const calculateTotals = () => {
    const ht = formData.items.reduce((sum, item) => sum + item.total, 0);
    const tvaAmount = formData.enableTva ? ht * (formData.taxRate / 100) : 0;
    const timbreAmount = formData.enableTimbre ? 1 : 0;
    const ttc = ht + tvaAmount + timbreAmount;
    return { ht, tvaAmount, timbreAmount, ttc };
  };

  const totals = calculateTotals();

  const applyFiscalSuggestions = (suggestions: string[]) => {
    let newEnableTva = formData.enableTva;
    let newTaxRate = formData.taxRate;
    let newEnableTimbre = formData.enableTimbre;

    if (suggestions.some(s => s.includes("Activer la TVA"))) newEnableTva = true;
    if (suggestions.some(s => s.includes("TVA 19%"))) newTaxRate = 19;
    if (suggestions.some(s => s.includes("Ajouter le timbre fiscal"))) newEnableTimbre = true;

    setFormData(prev => ({ ...prev, enableTva: newEnableTva, taxRate: newTaxRate, enableTimbre: newEnableTimbre }));
    dispatch(addToast({ message: '✅ Suggestions fiscales appliquées', type: 'success' }));
  };

  const handleSave = () => {
    if (!formData.clientId) {
      dispatch(addToast({ message: '⚠️ Veuillez sélectionner un client', type: 'error' }));
      return;
    }
    if (formData.items.length === 0 || formData.items.every(i => i.total === 0)) {
      dispatch(addToast({ message: '⚠️ Ajoutez au moins un article', type: 'error' }));
      return;
    }

    const invoiceData: Invoice = {
      id: formData.id || formData.invoiceNumber,
      client: formData.clientName,
      co: formData.clientCo,
      ht: totals.ht,
      ttc: totals.ttc,
      date: formData.date,
      due: formData.dueDate,
      status: editData?.status || 'draft',
      lc: formData.items.length,
      desc: formData.notes,
      lines: formData.items,
    };

    if (editData) {
      dispatch(updateInvoice(invoiceData));
      dispatch(addToast({ message: '✅ Facture modifiée', type: 'success' }));
    } else {
      dispatch(addInvoice(invoiceData));
      dispatch(addToast({ message: '✅ Facture créée', type: 'success' }));
    }
    dispatch(closeModal());
  };

  const handleDownloadPDF = () => {
    dispatch(addToast({ message: '📄 Téléchargement PDF démarré', type: 'info' }));
  };

  const getCurrencySymbol = () => {
    const curr = currencies.find(c => c.code === formData.currency);
    return curr?.symbol || 'DT';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => dispatch(closeModal())} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-auto max-h-[90vh] flex flex-col overflow-hidden">
          {/* En-tête fixe */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-6 py-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent to-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{editData ? 'Modifier la facture' : 'Nouvelle facture'}</h2>
                <p className="text-xs text-gray-500">{formData.invoiceNumber}</p>
              </div>
            </div>
            <button onClick={() => dispatch(closeModal())} className="p-2 hover:bg-gray-100 rounded-full transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Corps défilant */}
          <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto">
            {/* Colonne gauche : formulaire */}
            <div className="lg:w-1/2 p-6 overflow-y-auto border-r border-gray-100 space-y-6">
              {/* Société & Logo */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Raison sociale</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" />
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-accent/50 transition cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                  {companyLogo ? <img src={companyLogo} alt="Logo" className="h-16 mx-auto object-contain" /> : <><Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" /><p className="text-sm text-gray-400">Cliquez pour ajouter votre logo</p></>}
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </div>
              </div>

              {/* Client */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Building2 className="w-4 h-4" /> Client</h3>
                <select value={formData.clientId} onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent">
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
                <input type="text" value={formData.clientName} onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))} placeholder="Nom du client" className="w-full px-4 py-2 border rounded-lg text-sm" />
                <input type="text" value={formData.clientTaxId} onChange={(e) => setFormData(prev => ({ ...prev, clientTaxId: e.target.value }))} placeholder="Matricule fiscal" className="w-full px-4 py-2 border rounded-lg text-sm" />
                <textarea rows={2} value={formData.clientAddress} onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))} placeholder="Adresse" className="w-full px-4 py-2 border rounded-lg text-sm resize-none" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="email" value={formData.clientEmail} onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))} placeholder="Email" className="px-4 py-2 border rounded-lg text-sm" />
                  <input type="tel" value={formData.clientPhone} onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))} placeholder="Téléphone" className="px-4 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Date de facture</label><input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} className="w-full px-4 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1">Date d'échéance</label><input type="date" value={formData.dueDate} onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full px-4 py-2 border rounded-lg text-sm" /></div>
              </div>

              {/* Articles */}
              <div>
                <div className="flex justify-between items-center mb-2"><h3 className="text-sm font-bold text-gray-700">Articles & services</h3><button onClick={addItem} className="flex items-center gap-1 text-accent text-sm"><Plus className="w-4 h-4" /> Ajouter</button></div>
                <div className="space-y-2">
                  {formData.items.map((item, idx) => (
                    <div key={item.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                      <input type="text" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} placeholder="Description" className="flex-1 px-2 py-1 border rounded text-sm" />
                      <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-sm text-center" />
                      <input type="number" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1 border rounded text-sm text-right" />
                      <span className="text-sm font-mono w-20 text-right">{(item.quantity * item.unitPrice).toFixed(3)} {getCurrencySymbol()}</span>
                      <button onClick={() => removeItem(idx)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {formData.items.length === 0 && <p className="text-center text-gray-400 text-sm">Aucun article</p>}
                </div>
              </div>

              {/* Réglages fiscaux */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Settings className="w-4 h-4" /> Réglages fiscaux</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between"><span className="text-sm">Activer la TVA</span><div className="flex gap-1"><button onClick={() => setFormData(prev => ({ ...prev, enableTva: false }))} className={`px-2 py-0.5 rounded text-xs ${!formData.enableTva ? 'bg-accent text-white' : 'bg-white border'}`}>Non</button><button onClick={() => setFormData(prev => ({ ...prev, enableTva: true }))} className={`px-2 py-0.5 rounded text-xs ${formData.enableTva ? 'bg-accent text-white' : 'bg-white border'}`}>Oui</button></div></div>
                  <div className="flex items-center justify-between"><span className="text-sm">Taux TVA (%)</span><input type="number" value={formData.taxRate} onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))} className="w-20 px-2 py-1 border rounded text-right text-sm" disabled={!formData.enableTva} /></div>
                  <div className="flex items-center justify-between"><span className="text-sm">Taux TVA variable par ligne</span><div className="flex gap-1"><button onClick={() => setFormData(prev => ({ ...prev, variableTva: false }))} className={`px-2 py-0.5 rounded text-xs ${!formData.variableTva ? 'bg-accent text-white' : 'bg-white border'}`}>Non</button><button onClick={() => setFormData(prev => ({ ...prev, variableTva: true }))} className={`px-2 py-0.5 rounded text-xs ${formData.variableTva ? 'bg-accent text-white' : 'bg-white border'}`}>Oui</button></div></div>
                  <div className="flex items-center justify-between"><span className="text-sm">Timbre fiscal</span><div className="flex gap-1"><button onClick={() => setFormData(prev => ({ ...prev, enableTimbre: false }))} className={`px-2 py-0.5 rounded text-xs ${!formData.enableTimbre ? 'bg-accent text-white' : 'bg-white border'}`}>Non</button><button onClick={() => setFormData(prev => ({ ...prev, enableTimbre: true }))} className={`px-2 py-0.5 rounded text-xs ${formData.enableTimbre ? 'bg-accent text-white' : 'bg-white border'}`}>Oui</button></div></div>
                  <div className="flex items-center justify-between col-span-2"><span className="text-sm">Devise</span><select value={formData.currency} onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))} className="border rounded px-2 py-0.5 text-sm">{currencies.map(c => <option key={c.code} value={c.code}>{c.country} {c.code}</option>)}</select></div>
                </div>
              </div>

              {/* Moteur fiscal */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Calculator className="w-4 h-4" /> Moteur fiscal</h3>
                <div className="flex gap-2">
                  <button onClick={() => setFiscalMode('manuel')} className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${fiscalMode === 'manuel' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><RefreshCw className="w-4 h-4" /> Manuel</button>
                  <button onClick={() => setFiscalMode('auto')} className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${fiscalMode === 'auto' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><Sparkles className="w-4 h-4" /> Automatique (IA)</button>
                </div>
                {fiscalMode === 'auto' && <FiscalAnalyzer items={formData.items} taxRate={formData.taxRate} currency={formData.currency} onApplySuggestion={applyFiscalSuggestions} />}
                {fiscalMode === 'manuel' && <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">💡 Mode manuel : vous gérez vous-même les taux de TVA, timbre, etc.</div>}
              </div>

              {/* Notes */}
              <div><label className="block text-xs font-semibold text-gray-500 mb-1">Notes (conditions de paiement, etc.)</label><textarea rows={2} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-4 py-2 border rounded-lg text-sm" placeholder="Paiement à réception..." /></div>

              {/* Actions finales */}
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button onClick={handleDownloadPDF} className="flex items-center gap-1 px-4 py-1.5 border rounded-lg text-gray-700 hover:border-accent"><DownloadCloud className="w-4 h-4" /> PDF</button>
                <button onClick={handleSave} className="flex items-center gap-1 px-5 py-1.5 bg-gradient-to-r from-accent to-purple-600 text-white rounded-lg font-semibold"><CheckCircle className="w-4 h-4" /> Générer</button>
              </div>
            </div>

            {/* Colonne droite : aperçu facture réaliste */}
            <div className="lg:w-1/2 p-6 bg-gray-50 overflow-y-auto">
              <InvoicePreview formData={formData} totals={totals} companyLogo={companyLogo || undefined} companyName={companyName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;