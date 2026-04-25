import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch, RootState } from '../store';
import { fetchClients, removeClient } from '../store/slices/clientsSlice';
import { openModal, addToast } from '../store/slices/uiSlice';
import { Button } from '../components/ui/Button';
import { 
  Search, Plus, Mail, Phone, MapPin, Building, FileText, 
  Edit, Trash2, Globe, PhoneCall
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

  const handleCall = (phone: string, name: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      dispatch(addToast({ message: `📞 Pas de numéro pour ${name}`, type: 'error' }));
    }
  };

  // Envoie toutes les données du client au modal de facture
  const handleInvoice = (client: Client) => {
    dispatch(openModal({ 
      type: 'invoice', 
      data: { 
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
      }
    }));
  };

  const handleEmail = (email: string | null, name: string) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    } else {
      dispatch(addToast({ message: `📧 Pas d'email pour ${name}`, type: 'error' }));
    }
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
        <Button variant="primary" size="sm" className="ml-auto" onClick={() => dispatch(openModal({ type: 'client', data: null }))}>
          <Plus size={12} />
          Créer client
        </Button>
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
                  <Phone size={12} className="text-[#94a3b8]" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building size={12} className="text-[#94a3b8]" />
                  <span>MF : <span className="font-mono font-bold">{client.taxId}</span></span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin size={12} className="text-[#94a3b8] mt-0.5" />
                  <div>
                    <div>{client.address}</div>
                    <div>{client.city}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Globe size={10} className="text-[#94a3b8]" />
                      <span>{client.country || 'Tunisie'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex rounded-md overflow-hidden border border-[#e2e8f0] mt-3">
                <div className="flex-1 py-2.5 text-center bg-[#f8fafc] border-r border-[#e2e8f0]">
                  <div className="text-[15px] font-extrabold text-[#0f172a] font-mono">{client.factures}</div>
                  <div className="text-[9.5px] font-semibold uppercase tracking-wide text-[#94a3b8] mt-0.5">Factures</div>
                </div>
                <div className="flex-1 py-2.5 text-center bg-[#f8fafc]">
                  <div className="text-[15px] font-extrabold text-[#0f172a] font-mono">{client.ca}</div>
                  <div className="text-[9.5px] font-semibold uppercase tracking-wide text-[#94a3b8] mt-0.5">CA TND</div>
                </div>
              </div>

              <div className="flex gap-1.5 mt-3.5 pt-3 border-t border-[#e2e8f0]">
                <Button variant="secondary" size="sm" onClick={() => handleEmail(client.email, client.name)}>
                  <Mail size={12} /> Email
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleCall(client.phone, client.name)}>
                  <PhoneCall size={12} /> Appeler
                </Button>
                <Button variant="primary" size="sm" className="ml-auto" onClick={() => handleInvoice(client)}>
                  <FileText size={12} /> Facturer →
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clients;