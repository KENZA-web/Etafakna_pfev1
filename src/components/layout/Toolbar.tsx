import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleMenu } from '../../store/slices/uiSlice';
import { Menu } from 'lucide-react';

const pageLabels = {
  dashboard: 'Dashboard',
  factures: 'Factures',
  devis: 'Devis',
  clients: 'Clients',
};

export const Toolbar: React.FC = () => {
  const dispatch = useDispatch();
  const currentPage = useSelector((state: RootState) => state.ui.currentPage);

  return (
    <div className="flex items-center justify-end gap-2 px-5 py-2.5 bg-white border-b border-[#e2e8f0] sticky top-0 z-30 pr-10">
      <button
        onClick={() => dispatch(toggleMenu())}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#f8fafc] border border-[#cbd5e1] text-[12.5px] font-bold text-[#1e293b] hover:bg-[#EFF6FF] hover:border-[#D9E6FF] hover:text-[#1C6AE4] transition-all"
      >
        <Menu size={14} />
        Panneau
        <span className="text-[11px] font-semibold text-[#94a3b8] pl-1.5 ml-1 border-l border-[#e2e8f0]">
          {pageLabels[currentPage]}
        </span>
      </button>
    </div>
  );
};

export default Toolbar;