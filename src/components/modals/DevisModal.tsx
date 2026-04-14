// src/components/modals/DevisModal.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addDevis } from '../../store/slices/devisSlice';
import { closeModal, addToast } from '../../store/slices/uiSlice';
import { 
  X, Plus, Trash2, Sparkles, FileText, Calendar, 
  DollarSign, Users, Clock, EyeIcon, Shield, Zap, Building2, 
  Mail, Phone, Hash, Percent, TrendingUp, Layers, 
  ArrowRight, Star, Save, Printer, Settings, ShoppingBag, AlertCircle
} from 'lucide-react';
import type { Client } from '../../types';

// Liste des devises MENA
const currencies = [
  // Afrique du Nord (Maghreb)
  { code: 'MAD', symbol: 'د.م.', name: 'Dirham marocain', country: '🇲🇦', countryName: 'Maroc' },
  { code: 'TND', symbol: 'د.ت.', name: 'Dinar tunisien', country: '🇹🇳', countryName: 'Tunisie' },
  { code: 'DZD', symbol: 'د.ج.', name: 'Dinar algérien', country: '🇩🇿', countryName: 'Algérie' },
  { code: 'LYD', symbol: 'ل.د', name: 'Dinar libyen', country: '🇱🇾', countryName: 'Libye' },
  { code: 'EGP', symbol: 'E£', name: 'Livre égyptienne', country: '🇪🇬', countryName: 'Égypte' },
  { code: 'MRU', symbol: 'UM', name: 'Ouguiya', country: '🇲🇷', countryName: 'Mauritanie' },
  { code: 'SDG', symbol: 'ج.س.', name: 'Livre soudanaise', country: '🇸🇩', countryName: 'Soudan' },
  
  // Péninsule Arabique
  { code: 'SAR', symbol: '﷼', name: 'Riyal saoudien', country: '🇸🇦', countryName: 'Arabie Saoudite' },
  { code: 'AED', symbol: 'د.إ', name: 'Dirham', country: '🇦🇪', countryName: 'Émirats arabes unis' },
  { code: 'QAR', symbol: '﷼', name: 'Riyal qatari', country: '🇶🇦', countryName: 'Qatar' },
  { code: 'OMR', symbol: '﷼', name: 'Rial omanais', country: '🇴🇲', countryName: 'Oman' },
  { code: 'KWD', symbol: 'د.ك', name: 'Dinar koweïtien', country: '🇰🇼', countryName: 'Koweït' },
  { code: 'BHD', symbol: 'د.ب', name: 'Dinar bahreïni', country: '🇧🇭', countryName: 'Bahreïn' },
  
  // Levant
  { code: 'JOD', symbol: 'د.ا', name: 'Dinar jordanien', country: '🇯🇴', countryName: 'Jordanie' },
  { code: 'LBP', symbol: 'ل.ل', name: 'Livre libanaise', country: '🇱🇧', countryName: 'Liban' },
  { code: 'SYP', symbol: 'ل.س', name: 'Livre syrienne', country: '🇸🇾', countryName: 'Syrie' },
  { code: 'IQD', symbol: 'ع.د', name: 'Dinar irakien', country: '🇮🇶', countryName: 'Irak' },
  { code: 'YER', symbol: '﷼', name: 'Rial yéménite', country: '🇾🇪', countryName: 'Yémen' },
  
  // Corne de l'Afrique
  { code: 'KMF', symbol: 'CF', name: 'Franc comorien', country: '🇰🇲', countryName: 'Comores' },
  { code: 'DJF', symbol: 'Fdj', name: 'Franc djiboutien', country: '🇩🇯', countryName: 'Djibouti' },
  { code: 'SOS', symbol: 'Sh', name: 'Shilling somalien', country: '🇸🇴', countryName: 'Somalie' },
  
  // Devises internationales
  { code: 'USD', symbol: '$', name: 'Dollar US', country: '🇺🇸', countryName: 'États-Unis' },
  { code: 'EUR', symbol: '€', name: 'Euro', country: '🇪🇺', countryName: 'Europe' }
];

// Live Preview Component
const DevisPreview: React.FC<{ formData: any; lines: any[]; fiscal: any; currency: string }> = ({ 
  formData, lines, fiscal, currency 
}) => {
  const calculateTotal = () => {
    const ht = lines.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const tvaAmount = fiscal.tva ? ht * 0.19 : 0;
    const timbreAmount = fiscal.timbre ? 1 : 0;
    const rasAmount = fiscal.ras ? ht * 0.15 : 0;
    const ttc = ht + tvaAmount + timbreAmount - rasAmount;
    return { ht, tvaAmount, timbreAmount, rasAmount, ttc };
  };

  const totals = calculateTotal();
  
  const getCurrencySymbol = () => {
    const curr = currencies.find(c => c.code === currency);
    return curr ? curr.symbol : 'TND';
  };

  const formatAmount = (n: number) => n.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  return (
    <div className="h-full bg-gradient-to-br from-slate-100 via-white to-slate-100 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="relative bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
          
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-8 pt-10 pb-8 overflow-hidden">
            <div className="absolute inset-0 bg-white/5 opacity-20"></div>
            <div className="relative">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter">DEVIS</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                        <p className="text-white/70 text-sm font-mono tracking-wider">#{formData.invoiceNumber || 'DEV-001'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-right">
                    <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Date d'émission</p>
                    <p className="text-white font-semibold">{formData.date || new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-right">
                    <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider">Validité</p>
                    <p className="text-white font-semibold">30 jours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Client Information */}
            <div className="mb-8 group">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Destinataire</h3>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-500/20 transition-all duration-300">
                <p className="font-bold text-gray-800 text-lg">{formData.clientName || 'Nom du client'}</p>
                <p className="text-gray-500 text-sm mt-1">{formData.clientCo || 'Société'}</p>
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200">
                    <Mail className="w-4 h-4" />
                    <span>{formData.clientEmail || 'client@example.com'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200">
                    <Phone className="w-4 h-4" />
                    <span>{formData.clientPhone || '+216 XX XXX XXX'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Articles & Services</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="pb-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                      <th className="pb-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Qté</th>
                      <th className="pb-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Prix unit.</th>
                      <th className="pb-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lines?.map((item: any, idx: number) => (
                      <tr key={idx} className="group/item hover:bg-gray-50/50 transition-all duration-200">
                        <td className="py-4 text-gray-700 font-medium">{item.description || 'Service'}</td>
                        <td className="py-4 text-right text-gray-600">{item.quantity || 0}</td>
                        <td className="py-4 text-right text-gray-600">{item.unitPrice || 0} {getCurrencySymbol()}</td>
                        <td className="py-4 text-right font-semibold text-gray-800">
                          {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)} {getCurrencySymbol()}
                        </td>
                      </tr>
                    ))}
                    {(!lines || lines.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-400">
                          <div className="flex flex-col items-center gap-3">
                            <ShoppingBag className="w-12 h-12 text-gray-300" />
                            <p className="text-sm">Aucun article ajouté</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t-2 border-gray-100 pt-6">
              <div className="flex justify-end">
                <div className="w-96">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-gray-500">Total HT</span>
                      <span className="text-gray-800 font-semibold">{formatAmount(totals.ht)} {getCurrencySymbol()}</span>
                    </div>
                    {fiscal.tva && (
                      <div className="flex justify-between py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-gray-500">TVA (19%)</span>
                        <span className="text-gray-800">{formatAmount(totals.tvaAmount)} {getCurrencySymbol()}</span>
                      </div>
                    )}
                    {fiscal.timbre && (
                      <div className="flex justify-between py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-gray-500">Timbre fiscal</span>
                        <span className="text-gray-800">{formatAmount(totals.timbreAmount)} {getCurrencySymbol()}</span>
                      </div>
                    )}
                    {fiscal.ras && (
                      <div className="flex justify-between py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-gray-500">RAS (15%)</span>
                        <span className="text-red-600 font-semibold">-{formatAmount(totals.rasAmount)} {getCurrencySymbol()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 px-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20 mt-2">
                      <span className="text-gray-800 font-bold text-lg">Total TTC</span>
                      <span className="text-blue-600 font-black text-2xl tracking-tight">{formatAmount(totals.ttc)} {getCurrencySymbol()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {formData.desc && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Objet</p>
                    <p className="text-sm text-blue-600">{formData.desc}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Badge de statut */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <Zap className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Devis en attente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Modal Component
interface DevisModalProps {
  editData?: any;
}

const DevisModal: React.FC<DevisModalProps> = ({ editData }) => {
  const dispatch = useDispatch();
  const clients = useSelector((state: RootState) => state.clients) as Client[];
  
  const [activeTab, setActiveTab] = useState('client');
  const [formData, setFormData] = useState({
    id: editData?.id || '',
    invoiceNumber: editData?.id || `DEV-${Date.now()}`,
    date: editData?.date || new Date().toISOString().split('T')[0],
    clientId: editData?.clientId || '',
    clientName: editData?.clientName || '',
    clientCo: editData?.clientCo || '',
    clientEmail: editData?.clientEmail || '',
    clientPhone: editData?.clientPhone || '',
    desc: editData?.desc || '',
    currency: editData?.currency || 'TND',
    notes: editData?.notes || ''
  });

  const [lines, setLines] = useState<any[]>(
    editData?.lines || [
      { id: '1', description: '', quantity: 1, unitPrice: 0, vatRate: 19, total: 0 }
    ]
  );
  
  const [fiscal, setFiscal] = useState({ 
    tva: editData?.fiscal?.tva ?? true, 
    timbre: editData?.fiscal?.timbre ?? false, 
    ras: editData?.fiscal?.ras ?? false 
  });

  const [nextLineId, setNextLineId] = useState(editData?.lines?.length + 1 || 2);

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000);
    return `DEV-${year}-${random}`;
  };

  useEffect(() => {
    if (!editData && !formData.invoiceNumber) {
      setFormData(prev => ({ ...prev, invoiceNumber: generateInvoiceNumber() }));
    }
  }, [editData]);

  useEffect(() => {
    if (formData.clientId) {
      const client = clients.find(c => c.id === formData.clientId);
      if (client) {
        setFormData(prev => ({
          ...prev,
          clientName: client.name,
          clientCo: client.co,
          clientEmail: client.email,
          clientPhone: client.phone
        }));
      }
    }
  }, [formData.clientId, clients]);

  const formatAmount = (n: number) => n.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const calculateTotals = () => {
    const ht = lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
    const tvaAmount = fiscal.tva ? ht * 0.19 : 0;
    const timbreAmount = fiscal.timbre ? 1 : 0;
    const rasAmount = fiscal.ras ? ht * 0.15 : 0;
    const ttc = ht + tvaAmount + timbreAmount - rasAmount;
    return { ttc };
  };

  const { ttc } = calculateTotals();

  const updateLine = (id: string, field: string, value: any) => {
    setLines(prev => prev.map(line => {
      if (line.id === id) {
        const updated = { ...line, [field]: value };
        updated.total = updated.quantity * updated.unitPrice;
        return updated;
      }
      return line;
    }));
  };

  const addLine = () => {
    setLines([...lines, { id: nextLineId.toString(), description: '', quantity: 1, unitPrice: 0, vatRate: 19, total: 0 }]);
    setNextLineId(nextLineId + 1);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(line => line.id !== id));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName: client?.name || '',
      clientCo: client?.co || '',
      clientEmail: client?.email || '',
      clientPhone: client?.phone || ''
    }));
  };

  const generateAISummary = () => {
    const summary = `✨ Devis au profit de ${formData.clientName || 'client'} d'un montant total de ${formatAmount(ttc)} ${formData.currency}. ${fiscal.tva ? 'TVA 19% appliquée. ' : ''}${fiscal.timbre ? 'Timbre fiscal inclus. ' : ''}${fiscal.ras ? 'Retenue à la source 15%. ' : ''}Valable 30 jours.`;
    dispatch(addToast({ message: summary, type: 'info' }));
  };

  const handleSave = () => {
    if (!formData.clientId) {
      dispatch(addToast({ message: '⚠️ Veuillez sélectionner un client', type: 'error' }));
      return;
    }
    if (lines.every(l => l.quantity * l.unitPrice === 0)) {
      dispatch(addToast({ message: '⚠️ Ajoutez au moins une ligne de prestation', type: 'error' }));
      return;
    }

    const newDevis = {
      id: editData?.id || `DEV-${Date.now()}`,
      client: formData.clientName,
      co: formData.clientCo,
      ttc,
      date: formData.date,
      status: 'pending' as const,
      desc: formData.desc,
      converted: false,
      lines,
      fiscal,
      currency: formData.currency
    };

    dispatch(addDevis(newDevis));
    dispatch(addToast({ message: `✅ Devis ${newDevis.id} créé avec succès !`, type: 'success' }));
    dispatch(closeModal());
  };

  const handleDownloadPDF = () => {
    dispatch(addToast({ message: '📄 Téléchargement PDF démarré', type: 'info' }));
  };

  const tabs = [
    { id: 'client', label: 'Client', icon: Users },
    { id: 'details', label: 'Détails', icon: FileText },
    { id: 'items', label: 'Articles', icon: Layers },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  // Grouper les devises par région
  const northAfricaCurrencies = currencies.filter(c => ['MAD', 'TND', 'DZD', 'LYD', 'EGP', 'MRU', 'SDG'].includes(c.code));
  const gulfCurrencies = currencies.filter(c => ['SAR', 'AED', 'QAR', 'OMR', 'KWD', 'BHD'].includes(c.code));
  const levantCurrencies = currencies.filter(c => ['JOD', 'LBP', 'SYP', 'IQD', 'YER'].includes(c.code));
  const hornCurrencies = currencies.filter(c => ['KMF', 'DJF', 'SOS'].includes(c.code));
  const internationalCurrencies = currencies.filter(c => ['USD', 'EUR'].includes(c.code));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-md transition-all duration-500"
          onClick={() => dispatch(closeModal())} 
        />
        
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-7xl w-full mx-auto overflow-hidden">
          
          {/* Header avec dégradé bleu */}
          <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-8 py-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-indigo-500/20 to-transparent"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="relative flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-lg opacity-50"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {editData ? 'Modifier le devis' : 'Nouveau devis'}
                  </h2>
                  <p className="text-white/50 text-sm mt-0.5">
                    {editData ? 'Modifiez les informations de votre devis' : 'Créez un devis professionnel en quelques clics'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => dispatch(closeModal())} 
                className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110 group"
              >
                <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)]">
            {/* Left Side - Live Preview */}
            <div className="lg:w-1/2 border-r border-gray-100 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-3 border-b border-gray-100 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aperçu en direct</span>
                    </div>
                    <div className="h-4 w-px bg-gray-200"></div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <EyeIcon className="w-3 h-3" />
                      <span>Mise à jour temps réel</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Shield className="w-3 h-3" />
                    <span>Document sécurisé</span>
                  </div>
                </div>
              </div>
              <div className="h-full overflow-y-auto">
                <DevisPreview formData={formData} lines={lines} fiscal={fiscal} currency={formData.currency} />
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-1/2 overflow-y-auto bg-white">
              <div className="p-6">
                {/* Tabs Navigation */}
                <div className="grid grid-cols-4 gap-2 mb-8 bg-gray-50/50 p-1.5 rounded-2xl">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative group flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-white text-blue-600 shadow-lg scale-[0.97]'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-all duration-300 ${isActive ? 'scale-110' : ''}`} />
                        <span className="text-xs font-semibold">{tab.label}</span>
                        {isActive && (
                          <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="transition-all duration-300">
                  {/* Client Tab */}
                  {activeTab === 'client' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Sélectionner un client
                          <span className="text-red-500 text-xs">*</span>
                        </label>
                        <select
                          value={formData.clientId}
                          onChange={(e) => handleClientChange(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-500/50"
                        >
                          <option value="">Choisir un client</option>
                          {clients.map((client: Client) => (
                            <option key={client.id} value={client.id}>
                              {client.name} - {client.co}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            Société
                          </label>
                          <input
                            type="text"
                            value={formData.clientCo}
                            onChange={(e) => handleInputChange('clientCo', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                            placeholder="Nom de la société"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-blue-600" />
                            Matricule fiscal
                          </label>
                          <input
                            type="text"
                            placeholder="1234567X"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.clientEmail}
                          onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                          placeholder="client@email.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          Téléphone
                        </label>
                        <input
                          type="text"
                          value={formData.clientPhone}
                          onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                          placeholder="+216 XX XXX XXX"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl border border-blue-500/10">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-gray-600">Client vérifié</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  )}

                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Hash className="w-4 h-4 text-blue-600" />
                          Numéro de devis
                        </label>
                        <input
                          type="text"
                          value={formData.invoiceNumber}
                          onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 font-mono"
                          placeholder="DEV-2024-001"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            Date de devis
                          </label>
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            Validité
                          </label>
                          <input
                            type="text"
                            value="30 jours"
                            disabled
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Objet / Description
                        </label>
                        <textarea
                          rows={3}
                          value={formData.desc}
                          onChange={(e) => handleInputChange('desc', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none"
                          placeholder="Ex: Prestation de conseil juridique — Mars 2026"
                        />
                      </div>
                    </div>
                  )}

                  {/* Items Tab */}
                  {activeTab === 'items' && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-100">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600">Qté</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600">Prix</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600">TVA</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600">Total</th>
                                <th className="px-4 py-3 w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {lines.map((line) => (
                                <tr key={line.id} className="group hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200">
                                  <td className="px-4 py-3">
                                    <input
                                      type="text"
                                      value={line.description}
                                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                      placeholder="Description"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="number"
                                      value={line.quantity}
                                      onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                                      className="w-20 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="number"
                                      value={line.unitPrice}
                                      onChange={(e) => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                      className="w-28 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <select
                                      value={line.vatRate}
                                      onChange={(e) => updateLine(line.id, 'vatRate', parseInt(e.target.value))}
                                      className="w-20 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                    >
                                      <option value="0">0%</option>
                                      <option value="7">7%</option>
                                      <option value="13">13%</option>
                                      <option value="19">19%</option>
                                    </select>
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold text-gray-700">
                                    {(line.quantity * line.unitPrice).toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3">
                                    <button
                                      onClick={() => removeLine(line.id)}
                                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <button
                        onClick={addLine}
                        className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-white text-sm font-semibold px-4 py-3 border-2 border-blue-500/20 hover:bg-blue-600 rounded-xl transition-all duration-300 group"
                      >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Ajouter un article</span>
                      </button>
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === 'settings' && (
                    <div className="space-y-5">
                      {/* Options fiscales */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <Percent className="w-4 h-4 text-blue-600" />
                          Options fiscales
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => setFiscal({ ...fiscal, tva: !fiscal.tva })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-300 ${
                              fiscal.tva 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {fiscal.tva && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                            TVA (19%)
                          </button>
                          <button
                            onClick={() => setFiscal({ ...fiscal, timbre: !fiscal.timbre })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-300 ${
                              fiscal.timbre 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {fiscal.timbre && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                            Timbre fiscal (1 TND)
                          </button>
                          <button
                            onClick={() => setFiscal({ ...fiscal, ras: !fiscal.ras })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-300 ${
                              fiscal.ras 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {fiscal.ras && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                            RAS (15%)
                          </button>
                        </div>
                      </div>
                      
                      {/* Devise */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          Devise
                        </label>
                        <select
                          value={formData.currency}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white"
                        >
                          <optgroup label="🌍 Afrique du Nord">
                            {northAfricaCurrencies.map(currency => (
                              <option key={currency.code} value={currency.code}>
                                {currency.country} {currency.code} - {currency.name} ({currency.symbol})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="🕌 Péninsule Arabique">
                            {gulfCurrencies.map(currency => (
                              <option key={currency.code} value={currency.code}>
                                {currency.country} {currency.code} - {currency.name} ({currency.symbol})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="🏔️ Levant">
                            {levantCurrencies.map(currency => (
                              <option key={currency.code} value={currency.code}>
                                {currency.country} {currency.code} - {currency.name} ({currency.symbol})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="🌴 Corne de l'Afrique">
                            {hornCurrencies.map(currency => (
                              <option key={currency.code} value={currency.code}>
                                {currency.country} {currency.code} - {currency.name} ({currency.symbol})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="🌐 International">
                            {internationalCurrencies.map(currency => (
                              <option key={currency.code} value={currency.code}>
                                {currency.country} {currency.code} - {currency.name} ({currency.symbol})
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      {/* Mode professionnel */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-semibold text-gray-700">Mode professionnel</span>
                          </div>
                          <div className="w-8 h-4 bg-blue-500 rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t-2 border-gray-100 flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 font-bold group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>{editData ? 'Mettre à jour' : 'Créer le devis'}</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all duration-300 font-bold group"
                  >
                    <Printer className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>PDF</span>
                  </button>
                </div>

                {/* Bouton IA */}
                <div className="mt-3">
                  <button
                    onClick={generateAISummary}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 text-[12px] font-bold hover:from-purple-200 hover:to-purple-300 transition-all duration-300 group"
                  >
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Résumé IA - Kahina Legal</span>
                  </button>
                </div>

                {/* Footer info */}
                <div className="mt-4 text-center">
                  <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" />
                    Document sécurisé - Devis valable 30 jours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevisModal;