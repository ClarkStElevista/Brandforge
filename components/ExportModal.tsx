
import React from 'react';

type PDFStyle = 'modern' | 'corporate' | 'dark';

interface ExportModalProps {
  onClose: () => void;
  selectedStyle: PDFStyle;
  setSelectedStyle: (style: PDFStyle) => void;
  onDownloadPDF: () => Promise<void>;
  onDownloadAllPNG: () => Promise<void>;
}

const ExportModal: React.FC<ExportModalProps> = ({
  onClose,
  selectedStyle,
  setSelectedStyle,
  onDownloadPDF,
  onDownloadAllPNG,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-slate-900">Export Brand Bible</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">PDF Document Styles</label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'modern', label: 'Modern Portfolio', icon: '🎨' },
                { id: 'corporate', label: 'Corporate Standard', icon: '💼' },
                { id: 'dark', label: 'Executive Dark', icon: '🌙' }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id as PDFStyle)}
                  className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center gap-4 ${
                    selectedStyle === style.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <span className="text-2xl">{style.icon}</span>
                  <p className={`font-bold ${selectedStyle === style.id ? 'text-blue-600' : 'text-slate-900'}`}>{style.label}</p>
                </button>
              ))}
              <button
                onClick={onDownloadPDF}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-2 transition-all"
              >
                Generate PDF
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Image Assets</label>
            <button
              onClick={onDownloadAllPNG}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Download PNG Asset Bundle
            </button>
            <p className="text-[10px] text-slate-400 text-center">Captures all sections as high-resolution individual PNGs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
