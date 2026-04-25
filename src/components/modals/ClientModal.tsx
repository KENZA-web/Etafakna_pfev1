import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../store';
import { createClient, editClient } from '../../store/slices/clientsSlice';
import { closeModal, addToast } from '../../store/slices/uiSlice';
import { Button } from '../ui/Button';
import { X, Building2, Mail, Phone, MapPin, Globe, Hash } from 'lucide-react';
import type { Client } from '../../types';

// Liste des pays (inchangée)
const countries = [
  { code: 'TN', name: 'Tunisie' },
  { code: 'FR', name: 'France' },
  { code: 'DZ', name: 'Algérie' },
  { code: 'MA', name: 'Maroc' },
  { code: 'LY', name: 'Libye' },
  { code: 'EG', name: 'Égypte' },
  { code: 'SA', name: 'Arabie Saoudite' },
  { code: 'AE', name: 'Émirats Arabes Unis' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Koweït' },
  { code: 'OM', name: 'Oman' },
  { code: 'BH', name: 'Bahreïn' },
  { code: 'JO', name: 'Jordanie' },
  { code: 'LB', name: 'Liban' },
  { code: 'IQ', name: 'Irak' },
  { code: 'YE', name: 'Yémen' },
  { code: 'SD', name: 'Soudan' },
  { code: 'MR', name: 'Mauritanie' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'SO', name: 'Somalie' },
  { code: 'KM', name: 'Comores' },
  { code: 'US', name: 'États-Unis' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'IT', name: 'Italie' },
  { code: 'ES', name: 'Espagne' },
  { code: 'BE', name: 'Belgique' },
  { code: 'CH', name: 'Suisse' },
  { code: 'CA', name: 'Canada' },
];

// Couleurs prédéfinies (inchangé)
const colorOptions = [
  '#4f46e5', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#be185d', '#ca8a04'
];

interface ClientModalProps {
  editData?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({ editData }) => {
  const dispatch = useAppDispatch();
  const isEditing = !!editData;

  const [formData, setFormData] = useState({
    name: '',
    co: '',
    email: '',
    phone: '',
    taxId: '',
    address: '',
    city: '',
    country: 'TN',
    color: '#4f46e5',
    notes: '',
  });

  // Pré-remplissage en cas d'édition
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        co: editData.co,
        email: editData.email || '',
        phone: editData.phone,
        taxId: editData.taxId,
        address: editData.address,
        city: editData.city,
        country: editData.country || 'TN',
        color: editData.color,
        notes: editData.notes || '',
      });
    }
  }, [editData]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      dispatch(addToast({ message: '⚠️ Le nom du client est obligatoire', type: 'error' }));
      return;
    }
    if (!formData.taxId.trim()) {
      dispatch(addToast({ message: '⚠️ Le matricule fiscal est obligatoire', type: 'error' }));
      return;
    }

    // Préparation de l'objet client (sans id pour la création, le backend le génère)
    const clientData = {
      name: formData.name,
      co: formData.co,
      email: formData.email || null,
      phone: formData.phone,
      taxId: formData.taxId,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      color: formData.color,
      notes: formData.notes,
      // Pour l'édition, on garde l'id, factures et ca existants
      ...(editData ? { id: editData.id, factures: editData.factures, ca: editData.ca } : {}),
    };

    try {
      if (isEditing) {
        await dispatch(editClient(clientData as Client)).unwrap();
        dispatch(addToast({ message: `✅ Client ${formData.name} modifié`, type: 'success' }));
      } else {
        await dispatch(createClient(clientData as Client)).unwrap();
        dispatch(addToast({ message: `✅ Client ${formData.name} créé`, type: 'success' }));
      }
      dispatch(closeModal());
    } catch (error: any) {
      // Affiche l'erreur remontée par le thunk (si le backend a répondu avec une erreur)
      const message = error?.message || 'Une erreur est survenue';
      dispatch(addToast({ message: `❌ ${message}`, type: 'error' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => dispatch(closeModal())} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-accent to-purple-600 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">{isEditing ? 'Modifier le client' : 'Nouveau client'}</h2>
            </div>
            <button onClick={() => dispatch(closeModal())} className="p-2 hover:bg-white/10 rounded-full transition">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Corps du formulaire */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nom / Raison sociale *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Activité</label>
                <input
                  type="text"
                  value={formData.co}
                  onChange={(e) => setFormData({ ...formData, co: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Matricule fiscal *</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Adresse</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm resize-none"
                  placeholder="Rue, numéro, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ville</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Pays</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm appearance-none bg-white"
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Couleur d'identification</label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-accent scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Notes internes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                placeholder="Informations complémentaires..."
              />
            </div>
          </div>

          {/* Pied de page */}
          <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
            <Button variant="secondary" onClick={() => dispatch(closeModal())}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {isEditing ? 'Mettre à jour' : 'Créer le client'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};