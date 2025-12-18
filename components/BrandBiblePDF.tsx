
import React, { forwardRef } from 'react';
import { BrandBible } from '../types';

interface BrandBiblePDFProps {
  bible: BrandBible;
  selectedStyle: 'modern' | 'corporate' | 'dark';
}

const BrandBiblePDF = forwardRef<HTMLDivElement, BrandBiblePDFProps>(({ bible, selectedStyle }, ref) => {
  const isDark = selectedStyle === 'dark';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const borderColor = isDark ? 'border-slate-800' : 'border-slate-100';
  const subBgColor = isDark ? 'bg-slate-900/50' : 'bg-slate-50';

  return (
    <div id="pdf-template" ref={ref} style={{ display: 'block', backgroundColor: bgColor }}>
      <div className={`p-10 space-y-12 ${textColor}`} style={{ width: '210mm', minHeight: '297mm' }}>
        {/* Page 1: Cover */}
        <div className="text-center space-y-8 pt-20 pb-32">
          <div className="w-32 h-32 mx-auto rounded-3xl bg-blue-600 flex items-center justify-center mb-8">
             {bible.primaryLogoUrl ? (
               <img src={bible.primaryLogoUrl} className="w-24 h-24 object-contain rounded-xl" />
             ) : (
               <span className="text-white text-4xl font-bold">{bible.brandName.charAt(0)}</span>
             )}
          </div>
          <h1 className="text-6xl font-black tracking-tighter" style={{ fontFamily: bible.fontPairings[0]?.header || 'Inter' }}>
            {bible.brandName}
          </h1>
          <p className="text-2xl font-medium italic opacity-60">{bible.tagline}</p>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          <p className="pt-20 text-xs font-mono uppercase tracking-widest opacity-40">Brand Identity Standards • 2024</p>
        </div>

        {/* Page 2: Foundation & Primary Identity */}
        <div className={`grid grid-cols-2 gap-10 pt-10 border-t ${borderColor}`}>
          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-blue-500">Mission & Purpose</h2>
            <p className="text-lg leading-relaxed font-medium">{bible.missionStatement}</p>
          </div>
          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-blue-500">Brand Voice</h2>
            <p className="text-lg leading-relaxed">{bible.brandVoice}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-blue-500">Primary Logo</h2>
            <div className={`${subBgColor} rounded-3xl p-8 flex items-center justify-center min-h-[250px] border ${borderColor}`}>
              <img src={bible.primaryLogoUrl} className="max-w-full max-h-[200px] object-contain" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-blue-500">Primary Mark</h2>
            <div className={`${subBgColor} rounded-3xl p-8 flex items-center justify-center min-h-[250px] border ${borderColor}`}>
              <img src={bible.secondaryMarkUrl} className="max-w-full max-h-[200px] object-contain" />
            </div>
          </div>
        </div>

        {/* Logo Variations Page (Visual) */}
        <div className={`space-y-6 pt-10 border-t ${borderColor}`}>
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-blue-500">Logo Variations</h2>
          <div className="grid grid-cols-3 gap-6">
            {(bible.logoVariations || []).map((v, i) => (
              <div key={i} className="space-y-3">
                <div className={`${subBgColor} aspect-square rounded-2xl flex items-center justify-center p-4 border ${borderColor}`}>
                  <img src={v} className="max-w-full max-h-full object-contain" />
                </div>
                <p className="text-[10px] font-bold uppercase text-center opacity-40">Option {i + 1}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className={`space-y-6 pt-10 border-t ${borderColor}`}>
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-blue-500">Color Palette</h2>
          <div className="grid grid-cols-5 gap-4">
            {bible.palette.map((color, i) => (
              <div key={i} className="space-y-2">
                <div className="w-full aspect-square rounded-2xl shadow-inner border border-slate-100/10" style={{ backgroundColor: color.hex }}></div>
                <p className="font-bold text-[10px] truncate">{color.name}</p>
                <p className="text-[8px] font-mono opacity-50 uppercase">{color.hex}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className={`space-y-6 pt-10 border-t ${borderColor}`}>
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-blue-500">Typography Pairing</h2>
          <div className={`${subBgColor} rounded-3xl p-10 space-y-8 border ${borderColor}`}>
            {bible.fontPairings.slice(0, 1).map((font, i) => (
              <div key={i} className="space-y-6">
                 <div className="space-y-2">
                   <p className="text-4xl font-bold" style={{ fontFamily: font.header }}>{font.header}</p>
                   <p className="text-xl" style={{ fontFamily: font.body }}>{font.body} (Body Text)</p>
                 </div>
                 <p className="text-sm opacity-60 leading-relaxed italic border-l-4 border-blue-500 pl-4">{font.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center pt-20 opacity-20 text-[10px] font-mono tracking-widest uppercase">
          Designed with BrandForge AI
        </div>
      </div>
    </div>
  );
});

export default BrandBiblePDF;
