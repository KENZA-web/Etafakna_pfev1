import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch, RootState } from '../store';
import { fetchClients, removeClient } from '../store/slices/clientsSlice';
import { openModal, addToast, setCurrentPage } from '../store/slices/uiSlice';
import { Button } from '../components/ui/Button';
import {
  Search, Plus, Mail, MapPin, Building, FileText,
  Edit, Trash2, Globe, TrendingUp,
} from 'lucide-react';
import type { Client } from '../types';

export const Clients: React.FC = () => {
  const dispatch = useAppDispatch();
  const clients = useSelector((state: RootState) => state.clients) as Client[];
  const [searchTerm, setSearchTerm] = useState('');

  // 🔥 Charger tous les clients au montage si le tableau est vide
  useEffect(() => {
    if (clients.length === 0) {
      dispatch(fetchClients());
    }
  }, [dispatch, clients.length]);

  const filteredClients = clients.filter(c =>
    !searchTerm ||
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.country || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer ${name} ?`)) return;
    try {
      await dispatch(removeClient(id)).unwrap();
      dispatch(addToast({ message: `🗑️ Client ${name} supprimé`, type: 'info' }));
    } catch (error: any) {
      const message = error?.message || 'Erreur lors de la suppression';
      dispatch(addToast({ message: `❌ ${message}`, type: 'error' }));
    }
  };

  const handleEdit = (client: Client) => {
    dispatch(openModal({ type: 'client', data: client }));
  };

  // Email → ouvre le client mail avec le destinataire pré-rempli
  const handleEmail = (email: string | null, name: string) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    } else {
      dispatch(addToast({ message: `📧 Pas d'email pour ${name}`, type: 'error' }));
    }
  };

  // Facturer → navigue vers page formulaire facture avec données pré-remplies
  const handleInvoice = (client: Client) => {
    dispatch({ type: 'ui/openModal', payload: { type: 'invoice', data: {
      clientId: client.id,
      clientName: client.name,
      clientCo: client.co,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientAddress: client.address,
      clientCity: client.city,
      clientCountry: client.country || 'Tunisie',
      clientTaxId: client.taxId,
      clientColor: client.color,
    }}});
    dispatch(setCurrentPage('nouvelle-facture'));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 border border-[#e2e8f0] rounded-md bg-white flex-1 min-w-[200px] max-w-[340px] transition-all focus-within:border-[#818cf8] focus-within:shadow-[0_0_0_3px_rgba(79,70,229,0.12)]">
          <Search size={14} className="text-[#cbd5e1]" />
          <input
            type="text"
            placeholder="Rechercher un client (nom, email, ville, pays)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none outline-none bg-transparent text-[12.5px] font-inherit text-[#0f172a] w-full placeholder:text-[#cbd5e1]"
          />
        </div>
        <button
          onClick={() => dispatch(openModal({ type: 'client', data: null }))}
          style={{ backgroundColor: '#1C6AE4' }}
          className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[12.5px] font-bold text-white cursor-pointer transition-all hover:opacity-90"
        >
          <Plus size={12} />
          Créer client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredClients.map((client) => (
          <div 
            key={client.id} 
            className="relative overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            style={{ borderTopColor: client.color, borderTopWidth: '3px' }}
          >
            <div className="p-5">
              <div className="flex items-start gap-3 mb-3.5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-extrabold text-base flex-shrink-0"
                  style={{ backgroundColor: client.color }}
                >
                  {getInitials(client.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold text-[#0f172a]">{client.name}</div>
                  <div className="text-[11.5px] text-[#94a3b8] mt-0.5">{client.co}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(client)} className="p-1.5 rounded-md bg-transparent text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#1e293b] transition-all">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(client.id, client.name)} className="p-1.5 rounded-md bg-transparent text-[#94a3b8] hover:bg-[#fee2e2] hover:text-[#dc2626] transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-3.5 text-[11.5px] text-[#475569]">
                <div className="flex items-center gap-1.5">
                  <Mail size={12} className="text-[#94a3b8]" />
                  <span className="truncate">{client.email || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building size={12} className="text-[#94a3b8]" />
                  <span>MF : <span className="font-mono font-bold">{client.taxId || '—'}</span></span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin size={12} className="text-[#94a3b8] mt-0.5" />
                  <div>
                    {client.address && <div>{client.address}</div>}
                    {client.city && <div>{client.city}</div>}
                    <div className="flex items-center gap-1 mt-0.5">
                      <Globe size={10} className="text-[#94a3b8]" />
                      <span>{client.country || 'Tunisie'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats : Factures + CA */}
              <div className="flex rounded-md overflow-hidden border border-[#e2e8f0] mt-3">
                <div className="flex-1 py-2.5 text-center bg-[#f8fafc] border-r border-[#e2e8f0]">
                  <div className="text-[15px] font-extrabold text-[#0f172a] font-mono">
                    {client.factures ?? 0}
                  </div>
                  <div className="text-[9.5px] font-semibold uppercase tracking-wide text-[#94a3b8] mt-0.5">Factures</div>
                </div>
                <div className="flex-1 py-2.5 text-center bg-[#f8fafc]">
                  <div className="text-[13px] font-extrabold text-[#0f172a] font-mono truncate px-1">
                    {client.ca ?? '0.000'}
                  </div>
                  <div className="text-[9.5px] font-semibold uppercase tracking-wide text-[#94a3b8] mt-0.5 flex items-center justify-center gap-0.5">
                    <TrendingUp size={8} /> CA TND
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 mt-3.5 pt-3 border-t border-[#e2e8f0]">
                <Button variant="secondary" size="sm" onClick={() => handleEmail(client.email, client.name)}>
                  <Mail size={12} /> Email
                </Button>
                <button
                  style={{ backgroundColor: '#1C6AE4' }}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11.5px] font-bold text-white cursor-pointer transition-all hover:opacity-90"
                  onClick={() => handleInvoice(client)}
                >
                  <FileText size={12} /> Facturer →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clients;