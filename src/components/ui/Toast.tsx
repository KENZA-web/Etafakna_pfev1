import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { removeToast } from '../../store/slices/uiSlice';

const Toast: React.FC = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state: RootState) => state.ui.toasts);

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, 3500);
      return () => clearTimeout(timer);
    });
  }, [toasts, dispatch]);

  const getIcon = (type: string) => {
    if (type === 'success') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }
    if (type === 'error') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1e293b] text-white text-[12.5px] font-semibold shadow-lg opacity-0 translate-x-2.5 transition-all duration-200 pointer-events-auto toast-show`}
          style={{ animation: 'slideIn 0.22s ease forwards' }}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${toast.type === 'success' ? 'bg-[#16a34a]' : toast.type === 'error' ? 'bg-[#dc2626]' : 'bg-[#4f46e5]'}`}>
            {getIcon(toast.type)}
          </div>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

// Add this to your index.css
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .toast-show {
    animation: slideIn 0.22s ease forwards;
  }
`;
document.head.appendChild(style);

export default Toast;