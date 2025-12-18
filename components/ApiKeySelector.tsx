
import React, { useState, useEffect } from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore - window.aistudio is global
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setHasKey(true);
        onKeySelected();
      }
    };
    checkKey();
  }, [onKeySelected]);

  const handleOpenSelector = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success as per guidance to avoid race conditions
      onKeySelected();
    } catch (error) {
      console.error("Error opening key selector", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">High-Resolution Creative Access</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          To generate professional logos and brand marks in 4K resolution, you must select an API key from a paid Google Cloud project.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleOpenSelector}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
          >
            Select API Key
          </button>
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Learn about API billing & setup
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySelector;
