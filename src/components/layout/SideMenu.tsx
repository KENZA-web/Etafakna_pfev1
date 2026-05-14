import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setCurrentPage, setMenuOpen } from '../../store/slices/uiSlice';
import { LayoutDashboard, FileText, FileSignature, Users, X } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard & Analytics', icon: LayoutDashboard, color: 'indigo', desc: "Vue d'ensemble, KPIs, graphiques" },
  { id: 'factures', label: 'Factures', icon: FileText, color: 'green', desc: 'Gérez et émettez vos factures' },
  { id: 'devis', label: 'Devis', icon: FileSignature, color: 'amber', desc: 'Créez et convertissez vos devis' },
  { id: 'clients', label: 'Clients', icon: Users, color: 'violet', desc: 'Annuaire et fiche clients' },
];

const colorClasses = {
  indigo: 'bg-[#eef2ff] text-[#4f46e5]',
  green: 'bg-[#dcfce7] text-[#16a34a]',
  amber: 'bg-[#fef3c7] text-[#d97706]',
  violet: 'bg-[#ede9fe] text-[#7c3aed]',
};

export const SideMenu: React.FC = () => {
  const dispatch = useDispatch();
  const { isMenuOpen, currentPage } = useSelector((state: RootState) => state.ui);

  if (!isMenuOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) dispatch(setMenuOpen(false));
      }}
    >
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-modal w-full max-w-[380px] overflow-hidden animate-slideUp">
        <div className="px-5 pt-4 pb-3 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#0f172a]">
            <LayoutDashboard size={15} className="text-[#4f46e5]" />
            Navigation
          </div>
          <div className="text-[11px] text-[#94a3b8] mt-0.5">Sélectionnez une section</div>
        </div>

        <div className="p-2.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  dispatch(setCurrentPage(item.id as any));
                  dispatch(setMenuOpen(false));
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all mb-1 border border-transparent ${
                  isActive ? 'bg-[#EFF6FF] border-[#D9E6FF]' : 'hover:bg-[#f8fafc] hover:border-[#e2e8f0]'
                }`}
              >
                <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${colorClasses[item.color as keyof typeof colorClasses]}`}>
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13.5px] font-bold ${isActive ? 'text-[#1C6AE4]' : 'text-[#0f172a]'}`}>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-[#94a3b8] mt-0.5">{item.desc}</div>
                </div>
                <div className="text-[#cbd5e1] opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
          <span className="text-[10.5px] text-[#94a3b8]">Appuyez sur Echap pour fermer</span>
          <button
            onClick={() => dispatch(setMenuOpen(false))}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#e2e8f0] bg-white text-[11.5px] font-semibold text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]"
          >
            <X size={12} />
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;