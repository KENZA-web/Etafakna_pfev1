import React, { useEffect, useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface PDFViewerModalProps {
  url: string;
  fileName: string;
  onClose: () => void;
  onDownload?: () => void;
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ url, fileName, onClose, onDownload }) => {
  const [zoom, setZoom] = useState(100);

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Bloquer le scroll du body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Barre d'outils */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
            <span className="text-[11px] text-accent font-bold">PDF</span>
          </div>
          <span className="text-white text-[13px] font-semibold truncate max-w-[300px]">{fileName}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom */}
          <button
            onClick={() => setZoom(z => Math.max(50, z - 10))}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Zoom arrière"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-white/70 text-[12px] w-12 text-center font-mono">{zoom}%</span>
          <button
            onClick={() => setZoom(z => Math.min(200, z + 10))}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Zoom avant"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Réinitialiser zoom"
          >
            <RotateCw size={14} />
          </button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Télécharger */}
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/80 text-white text-[12px] font-bold transition-colors"
            >
              <Download size={13} />
              Télécharger
            </button>
          )}

          {/* Fermer */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-colors ml-1"
            title="Fermer (Échap)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Zone PDF */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-[#374151]">
        <div
          style={{ width: `${zoom}%`, minWidth: '400px', maxWidth: '1200px' }}
          className="transition-all duration-200"
        >
          <iframe
            src={url}
            title={fileName}
            className="w-full rounded-lg shadow-2xl bg-white"
            style={{ height: '85vh', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewerModal;
