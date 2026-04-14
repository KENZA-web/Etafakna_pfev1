import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardHeader, CardTitle, CardSub } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { Badge } from '../components/ui/Badge';
import { 
  TrendingUp, CheckCircle, Clock, Users, Shield, FileText, AlertTriangle, 
  Calendar, ArrowUp, Download, Filter, RefreshCw,
  ChevronLeft, ChevronRight, Eye, Mail
} from 'lucide-react';

// ... le reste du code identique

// Composant Courbe modernisé
const RevenueChart: React.FC<{ data: number[]; labels: string[] }> = ({ data, labels }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const height = 200;
  const width = 600;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const maxIndex = data.indexOf(max);
  const maxLabel = labels[maxIndex];

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-6 pb-3 border-b border-border/50">
        <div>
          <div className="text-2xl font-bold text-accent">{Math.round(max).toLocaleString('fr-TN')} TND</div>
          <div className="text-[11px] text-ink-4">Pic atteint en {maxLabel}</div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
            <ArrowUp size={14} />
            +{Math.round(((data[data.length-1] - data[0]) / data[0]) * 100)}%
          </div>
          <div className="text-[10px] text-ink-4">vs période précédente</div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg className="w-full" viewBox={`0 0 ${width} ${height + 40}`} preserveAspectRatio="none" style={{ minWidth: '500px' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = height - (ratio * height);
            const value = min + (ratio * range);
            return (
              <g key={i}>
                <line x1="0" y1={y} x2={width} y2={y} stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="4,4" />
                <text x={width + 5} y={y + 3} fontSize="9" fill="#94a3b8" textAnchor="start">
                  {Math.round(value).toLocaleString('fr-TN')}
                </text>
              </g>
            );
          })}
          <defs>
            <linearGradient id="areaGradNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          <polygon points={`0,${height} ${points} ${width},${height}`} fill="url(#areaGradNew)" />
          <polyline points={points} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            const isLast = index === data.length - 1;
            const isMax = value === max;
            return (
              <g key={index}>
                {isLast && <circle cx={x} cy={y} r="6" fill="#4f46e5" opacity="0.15" />}
                <circle cx={x} cy={y} r={isMax ? 5 : (isLast ? 4 : 3)} fill={isMax ? '#4f46e5' : 'white'} stroke="#4f46e5" strokeWidth={isMax ? 2.5 : 2} className={isMax ? 'ring-2 ring-indigo-200' : ''} />
              </g>
            );
          })}
        </svg>
        <div className="flex justify-between mt-3 px-1">
          {labels.map((label, i) => {
            const isMax = i === maxIndex;
            const isLast = i === labels.length - 1;
            return (
              <span key={i} className={`text-[10px] font-medium transition-all ${isLast || isMax ? 'text-indigo-600 font-bold' : 'text-ink-3'}`}>
                {label}
                {isMax && <span className="ml-1 text-[8px]">●</span>}
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-border/50">
        <div className="text-center p-2 rounded-lg bg-surface-2">
          <div className="text-[10px] text-ink-4 uppercase tracking-wide">Minimum</div>
          <div className="text-[15px] font-bold text-ink-2">{Math.round(min).toLocaleString('fr-TN')}</div>
          <div className="text-[9px] text-ink-4">en {labels[data.indexOf(min)]}</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-surface-2">
          <div className="text-[10px] text-ink-4 uppercase tracking-wide">Moyenne</div>
          <div className="text-[15px] font-bold text-ink-2">{Math.round(data.reduce((a,b) => a+b,0) / data.length).toLocaleString('fr-TN')}</div>
          <div className="text-[9px] text-ink-4">sur 12 mois</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-indigo-50">
          <div className="text-[10px] text-indigo-600 uppercase tracking-wide">Maximum</div>
          <div className="text-[15px] font-bold text-accent">{Math.round(max).toLocaleString('fr-TN')}</div>
          <div className="text-[9px] text-indigo-500">en {maxLabel}</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-emerald-50">
          <div className="text-[10px] text-emerald-600 uppercase tracking-wide">Croissance</div>
          <div className="text-[15px] font-bold text-green-600">+{Math.round(((data[data.length-1] - data[0]) / data[0]) * 100)}%</div>
          <div className="text-[9px] text-emerald-500">vs année précédente</div>
        </div>
      </div>
    </div>
  );
};

// Composant Selecteur de période
const PeriodSelector: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => {
  const periods = [
    { id: '12m', label: '12 mois' },
    { id: '6m', label: '6 mois' },
    { id: '3m', label: '3 mois' },
    { id: '1m', label: '1 mois' },
  ];
  return (
    <div className="flex gap-1 p-1 bg-surface-2 rounded-lg">
      {periods.map((period) => (
        <button
          key={period.id}
          onClick={() => onChange(period.id)}
          className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
            value === period.id ? 'bg-white text-accent shadow-sm' : 'text-ink-4 hover:text-ink-2'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const invoices = useSelector((state: RootState) => state.invoices);
  const devis = useSelector((state: RootState) => state.devis);
  const clients = useSelector((state: RootState) => state.clients);
  
  const [period, setPeriod] = useState('12m');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const monthlyCA = 5119;
  const totalPaid = paidInvoices.length;
  const totalInvoices = invoices.length;
  const pendingInvoices = invoices.filter(i => i.status === 'pending');
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.ttc, 0);
  const draftInvoices = invoices.filter(i => i.status === 'draft');
  const convertedDevis = devis.filter(d => d.converted);
  const conversionRate = devis.length ? Math.round((convertedDevis.length / devis.length) * 100) : 0;
  const paymentRate = invoices.length ? Math.round((paidInvoices.length / invoices.length) * 100) : 0;
  const averagePaymentDays = 14;
  
  const clientRevenue = [
    { name: 'TechCorp SARL', amount: 18400, color: '#4f46e5', percent: 43, growth: '+23%' },
    { name: 'Avocats Associés', amount: 12600, color: '#7c3aed', percent: 29, growth: '+15%' },
    { name: 'StartupHub Tunisia', amount: 7200, color: '#059669', percent: 17, growth: '+42%' },
    { name: 'Digital Solutions', amount: 4500, color: '#d97706', percent: 11, growth: '+8%' },
  ];
  const totalRevenue = clientRevenue.reduce((sum, c) => sum + c.amount, 0);
  
  const ALERT_THRESHOLD = 5000;
  const isOverdueAlert = pendingAmount > ALERT_THRESHOLD;

  const statusGroups = {
    paid: { count: invoices.filter(i => i.status === 'paid').length, color: '#16a34a', label: 'Payées' },
    pending: { count: invoices.filter(i => i.status === 'pending').length, color: '#d97706', label: 'En attente' },
    draft: { count: invoices.filter(i => i.status === 'draft').length, color: '#94a3b8', label: 'Brouillon' },
    refused: { count: invoices.filter(i => i.status === 'refused').length, color: '#dc2626', label: 'Refusées' },
    signed: { count: invoices.filter(i => i.status === 'signed').length, color: '#4338ca', label: 'Signées' },
  };
  
  const donutData = Object.entries(statusGroups)
    .filter(([_, data]) => data.count > 0)
    .map(([status, data]) => ({ status, count: data.count, color: data.color, label: data.label }));

  const months = ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'];
  const revenueData = [4200, 3800, 5100, 6200, 5800, 7100, 8200, 9100, 10400, 11200, 13500, 18450];
  const recentInvoices = invoices.slice(0, 5);
  const convertedHistory = [
    { devId: 'DEV-2026-016', facId: 'FAC-2026-027', client: 'Avocats Associés', amt: 6545, date: '2026-03-12' },
    { devId: 'DEV-2025-042', facId: 'FAC-2025-089', client: 'TechCorp SARL', amt: 4800, date: '2026-01-08' },
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
  };

  const formatAmount = (n: number) => n.toLocaleString('fr-TN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleExport = (format: string) => {
    console.log(`Export en ${format}`);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Header avec actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-black text-ink">Tableau de bord</h1>
          <p className="text-[12px] text-ink-4 mt-0.5">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelector value={period} onChange={setPeriod} />
          <div className="w-px h-6 bg-border mx-1" />
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg bg-surface-2 border border-border hover:bg-surface transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={14} className="text-ink-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-white text-[12px] font-bold hover:bg-accent-hover transition-all"
            >
              <Download size={14} />
              Exporter
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-border z-20 overflow-hidden">
                <button onClick={() => handleExport('PDF')} className="w-full px-4 py-2 text-left text-[12px] hover:bg-surface-2 transition-colors">📄 Exporter en PDF</button>
                <button onClick={() => handleExport('EXCEL')} className="w-full px-4 py-2 text-left text-[12px] hover:bg-surface-2 transition-colors">📊 Exporter en Excel</button>
                <button onClick={handlePrint} className="w-full px-4 py-2 text-left text-[12px] hover:bg-surface-2 transition-colors">🖨️ Imprimer</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        <KpiCard label="CA mensuel (payé)" value={`${formatAmount(monthlyCA)} TND`} icon={<TrendingUp size={17} />} color="indigo" trend={{ value: 12.4, isUp: true }} footer="vs mois dernier" />
        <KpiCard label="Factures payées" value={totalPaid.toString()} icon={<CheckCircle size={17} />} color="green" footer={`sur ${totalInvoices} factures`} />
        <KpiCard label="En attente" value={pendingInvoices.length.toString()} icon={<Clock size={17} />} color="amber" footer={`${formatAmount(pendingAmount)} TND`} />
        <KpiCard label="Clients actifs" value={clients.length.toString()} icon={<Users size={17} />} color="violet" footer={`${devis.length} devis`} />
        <KpiCard label="Délai moyen" value={`${averagePaymentDays} jours`} icon={<Calendar size={17} />} color="teal" trend={{ value: 2, isUp: false }} footer="amélioration" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 mb-5">
        <Card padding>
          <CardHeader>
            <div>
              <CardTitle>Évolution CA — 12 derniers mois</CardTitle>
              <CardSub>Factures payées uniquement (TND)</CardSub>
            </div>
          </CardHeader>
          <RevenueChart data={revenueData} labels={months} />
        </Card>

        <Card padding>
          <CardHeader>
            <div>
              <CardTitle>Répartition statuts</CardTitle>
              <CardSub>{invoices.length} factures</CardSub>
            </div>
          </CardHeader>
          <div className="flex flex-col items-center">
            <svg className="w-[130px] h-[130px] mb-4" viewBox="0 0 100 100">
              {donutData.map((item, idx) => {
                const circumference = 2 * Math.PI * 36;
                const dash = (item.count / invoices.length) * circumference;
                const offset = donutData.slice(0, idx).reduce((acc, d) => acc + (d.count / invoices.length) * circumference, 0);
                return (
                  <circle key={item.status} cx="50" cy="50" r="36" fill="none" stroke={item.color} strokeWidth="10" strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />
                );
              })}
              <text x="50" y="47" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0f172a">{invoices.length}</text>
              <text x="50" y="58" textAnchor="middle" fontSize="8" fill="#94a3b8">factures</text>
            </svg>
            <div className="w-full space-y-2">
              {donutData.map((item) => (
                <div key={item.status} className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-2 transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[12px] flex-1">{item.label}</span>
                  <span className="text-[12px] font-bold">{Math.round((item.count / invoices.length) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Clients + Alerte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card padding>
          <CardHeader>
            <div>
              <CardTitle>Répartition CA par client</CardTitle>
              <CardSub>Total {formatAmount(totalRevenue)} TND</CardSub>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {clientRevenue.map((client, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between text-[13px] mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: client.color }} />
                    <span className="font-semibold">{client.name}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{client.growth}</span>
                  </div>
                  <span className="font-mono font-bold">{formatAmount(client.amount)} TND</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500 group-hover:brightness-110" style={{ width: `${client.percent}%`, backgroundColor: client.color }} />
                </div>
                <div className="flex justify-between mt-0.5">
                  <div className="text-[9px] text-ink-4">{client.percent}% du CA total</div>
                  <div className="text-[9px] text-ink-4 opacity-0 group-hover:opacity-100 transition-opacity">+12% vs mois dernier</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex justify-between">
            <button className="text-[11px] font-bold text-accent hover:underline">Voir détail clients →</button>
            <span className="text-[10px] text-ink-4">Top 4 contributeurs</span>
          </div>
        </Card>

        <Card padding className={isOverdueAlert ? 'border-red-200 bg-red-50/30' : ''}>
          <CardHeader>
            <div>
              <CardTitle>Alertes impayés</CardTitle>
              <CardSub>Seuil critique : {formatAmount(ALERT_THRESHOLD)} TND</CardSub>
            </div>
          </CardHeader>
          <div className={`rounded-lg p-4 ${isOverdueAlert ? 'bg-red-100' : 'bg-amber-50'}`}>
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className={isOverdueAlert ? 'text-red-600 animate-pulse' : 'text-amber-600'} />
              <div className="flex-1">
                <div className="text-lg font-bold">{formatAmount(pendingAmount)} TND</div>
                <div className="text-[11px] text-ink-4">Montant total des impayés</div>
              </div>
              {isOverdueAlert && (
                <span className="px-2 py-1 bg-red-200 text-red-800 text-[10px] font-bold rounded-full animate-bounce">⚠️ Seuil dépassé</span>
              )}
            </div>
            <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${isOverdueAlert ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.min((pendingAmount / ALERT_THRESHOLD) * 100, 100)}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-200">
              <div className="text-center p-2 bg-white/50 rounded-lg">
                <div className="text-xl font-bold">{pendingInvoices.length}</div>
                <div className="text-[10px] text-ink-4">Factures impayées</div>
              </div>
              <div className="text-center p-2 bg-white/50 rounded-lg">
                <div className="text-xl font-bold">{paymentRate}%</div>
                <div className="text-[10px] text-ink-4">Taux de paiement</div>
              </div>
            </div>
            <button className="w-full mt-3 py-2 text-center text-[11px] font-bold text-accent bg-white rounded-lg hover:bg-accent hover:text-white transition-all">
              📧 Relancer les impayés
            </button>
          </div>
        </Card>
      </div>

      {/* 3ème ligne KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <KpiCard label="Taux de recouvrement" value={`${paymentRate}%`} icon={<Shield size={17} />} color="teal" footer="Factures payées / émises" />
        <KpiCard label="Devis convertis" value={`${conversionRate}%`} icon={<FileText size={17} />} color="green" footer={`${convertedDevis.length} / ${devis.length} devis`} />
        <KpiCard label="Brouillons" value={draftInvoices.length.toString()} icon={<AlertTriangle size={17} />} color="red" footer="À émettre rapidement" />
      </div>

      {/* Conversions */}
      <Card padding className="mb-5">
        <CardHeader>
          <div>
            <CardTitle>Devis convertis en factures</CardTitle>
            <CardSub>Historique des conversions</CardSub>
          </div>
          <button className="text-[11px] font-bold text-accent hover:underline">Voir tout →</button>
        </CardHeader>
        <div className="space-y-2">
          {convertedHistory.map((h, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-100 hover:shadow-md transition-all group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <FileText size={14} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-cyan-700">{h.devId}</span>
                  <span className="text-ink-4 text-[10px]">→</span>
                  <span className="font-mono text-sm font-bold text-accent">{h.facId}</span>
                </div>
                <div className="text-xs text-ink-4">{h.client}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold">{formatAmount(h.amt)} TND</div>
                <div className="text-[9px] text-ink-4">{formatDate(h.date)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Dernières factures avec actions */}
      <Card padding>
        <CardHeader>
          <div>
            <CardTitle>Dernières factures</CardTitle>
            <CardSub>5 transactions récentes</CardSub>
          </div>
          <div className="flex gap-2">
            <button className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors">
              <Filter size={14} className="text-ink-4" />
            </button>
            <button className="text-[11px] font-bold text-accent hover:underline">Voir tout →</button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 text-[10px] font-bold text-ink-4">N° Facture</th>
                <th className="pb-2 text-[10px] font-bold text-ink-4">Client</th>
                <th className="pb-2 text-[10px] font-bold text-ink-4">Montant TTC</th>
                <th className="pb-2 text-[10px] font-bold text-ink-4">Date</th>
                <th className="pb-2 text-[10px] font-bold text-ink-4">Statut</th>
                <th className="pb-2 text-[10px] font-bold text-ink-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-surface-2 transition-colors group">
                  <td className="py-3 font-mono text-sm font-semibold text-accent">{inv.id}</td>
                  <td className="py-3">
                    <div className="font-semibold">{inv.client}</div>
                    <div className="text-[10px] text-ink-4">{inv.co}</div>
                  </td>
                  <td className="py-3 font-mono font-bold">{formatAmount(inv.ttc)} TND</td>
                  <td className="py-3 text-sm text-ink-4">{formatDate(inv.date)}</td>
                  <td className="py-3"><Badge status={inv.status} /></td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded hover:bg-accent/10" title="Aperçu"><Eye size={14} className="text-ink-4" /></button>
                      <button className="p-1 rounded hover:bg-accent/10" title="Email"><Mail size={14} className="text-ink-4" /></button>
                      <button className="p-1 rounded hover:bg-accent/10" title="PDF"><Download size={14} className="text-ink-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <div className="text-[10px] text-ink-4">Affichage 1-5 sur {invoices.length} factures</div>
          <div className="flex gap-1">
            <button className="p-1 rounded border border-border hover:bg-surface-2"><ChevronLeft size={14} /></button>
            <button className="px-2 py-1 rounded bg-accent text-white text-[11px] font-bold">1</button>
            <button className="px-2 py-1 rounded border border-border hover:bg-surface-2 text-[11px]">2</button>
            <button className="p-1 rounded border border-border hover:bg-surface-2"><ChevronRight size={14} /></button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;