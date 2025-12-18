
import React, { useEffect, useState, useRef } from 'react';
import { BrandBible, ImageSize } from '../types';
import { Shimmer } from './Shimmer';
import ExportModal from './ExportModal';
import BrandBiblePDF from './BrandBiblePDF';

interface BrandBibleViewProps {
  bible: BrandBible;
  onRegenerateLogo: () => Promise<void>;
  onRegenerateSecondaryMark: () => Promise<void>;
  onRegenerateVariation?: (index: number) => Promise<void>;
  onRegenerateMarkVariation?: (index: number) => Promise<void>;
  isGeneratingStrategy?: boolean;
  imageSize: ImageSize;
  setImageSize: (size: ImageSize) => void;
}

type PDFStyle = 'modern' | 'corporate' | 'dark';

const SmartImage: React.FC<{ 
  src?: string; 
  alt?: string; 
  className?: string; 
  containerClass?: string;
}> = ({ src, alt, className, containerClass = "w-full aspect-square" }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${containerClass}`}>
      {(!src || !isLoaded) && (
        <Shimmer className="absolute inset-0 z-10" />
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`${className} transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
};

const BrandBibleView: React.FC<BrandBibleViewProps> = ({ 
  bible, 
  onRegenerateLogo, 
  onRegenerateSecondaryMark,
  onRegenerateVariation,
  onRegenerateMarkVariation,
  isGeneratingStrategy = false,
  imageSize,
  setImageSize,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<PDFStyle>('modern');
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const identityGridRef = useRef<HTMLDivElement>(null);
  const logoVariationsRef = useRef<HTMLDivElement>(null);
  const markVariationsRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const typographyRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);

  const isRegeneratingLogo = !bible.primaryLogoUrl;
  const isRegeneratingMark = !bible.secondaryMarkUrl;
  const isPaletteEmpty = bible.palette.length === 0;
  const isFontsEmpty = !bible.fontPairings || bible.fontPairings.length === 0;

  useEffect(() => {
    if (!isFontsEmpty) {
      const families = bible.fontPairings.flatMap(p => [p.header, p.body]);
      const uniqueFamilies = [...new Set(families)];
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?${uniqueFamilies.map(f => `family=${f.replace(/\s+/g, '+')}:wght@400;700`).join('&')}&display=swap`;
      document.head.appendChild(link);
      return () => {
        if (document.head.contains(link)) document.head.removeChild(link);
      };
    }
  }, [bible.fontPairings]);

  const brandNameSlug = bible.brandName.replace(/\s+/g, '').toLowerCase();
  const socialHandles = [`@${brandNameSlug}`, `@${brandNameSlug}Official`, `@Get${brandNameSlug}`, `@Try${brandNameSlug}`, `@${brandNameSlug}HQ`, `@${brandNameSlug}App` ];

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(bible, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${bible.brandName.replace(/\s+/g, '_')}_BrandBible.json`);
    linkElement.click();
  };

  const handleDownloadPDF = async () => {
    if (!pdfTemplateRef.current) return;
    setIsExporting(true);
    setShowExportModal(false);
    try {
      // @ts-ignore
      await html2pdf().set({
        margin: 0,
        filename: `${bible.brandName.replace(/\s+/g, '_')}_BrandBible.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(pdfTemplateRef.current).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const capturePNG = async (ref: React.RefObject<HTMLDivElement>, name: string) => {
    if (!ref.current) return;
    setIsExporting(true);
    try {
      // @ts-ignore
      const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
      const link = document.createElement('a');
      link.download = `${bible.brandName.replace(/\s+/g, '_')}_${name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("PNG capture failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllPNGs = async () => {
    const sections = [
      { ref: headerRef, name: 'Brand_Header' }, { ref: identityGridRef, name: 'Identity_Standards' },
      { ref: logoVariationsRef, name: 'Logo_Variations' }, { ref: markVariationsRef, name: 'Mark_Variations' },
      { ref: paletteRef, name: 'Color_Palette' }, { ref: typographyRef, name: 'Typography' }, { ref: socialRef, name: 'Social_Identity' }
    ];
    setShowExportModal(false);
    for (const section of sections) {
      await capturePNG(section.ref, section.name);
      await new Promise(r => setTimeout(r, 500));
    }
  };

  const logoVariationMeta = [
    { title: "Wordmark Focus", subtitle: "Typographic purity and legibility", bg: "bg-white", icon: "Aa" },
    { title: "Combination Mark", subtitle: "Balanced icon and text layout", bg: "bg-slate-50/50", icon: "⬡" },
    { title: "Stacked Signature", subtitle: "Optimized for vertical spaces", bg: "bg-indigo-50/30", icon: "☰" }
  ];

  const markVariationMeta = [
    { title: "Core Brand Glyph", subtitle: "Primary abstract symbol", bg: "bg-white", icon: "✦" },
    { title: "Condensed Icon", subtitle: "Digital utility & favicons", bg: "bg-slate-50/50", icon: "◈" },
    { title: "Geometric Pattern", subtitle: "Structural brand elements", bg: "bg-blue-50/30", icon: "◍" }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      {/* Action Bar */}
      {!isGeneratingStrategy && (
        <div className="flex flex-wrap justify-end sticky top-[100px] z-20 pointer-events-none gap-3 items-center">
          <div className="pointer-events-auto bg-white border border-slate-200 rounded-2xl p-1.5 flex gap-1 shadow-xl shadow-slate-200/20 mr-2">
            {Object.values(ImageSize).map((size) => (
              <button key={size} onClick={() => setImageSize(size)}
                className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${imageSize === size ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                {size}
              </button>
            ))}
          </div>
          <button onClick={handleDownloadJSON} className="pointer-events-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200/20 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95">
            JSON
          </button>
          <button onClick={() => setShowExportModal(true)} disabled={isExporting} className="pointer-events-auto bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/20 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 disabled:opacity-50">
            {isExporting ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
            Export Assets
          </button>
        </div>
      )}

      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} onDownloadPDF={handleDownloadPDF} onDownloadAllPNG={exportAllPNGs} />}
      <BrandBiblePDF ref={pdfTemplateRef} bible={bible} selectedStyle={selectedStyle} />

      {/* Header */}
      <section ref={headerRef} className="text-center space-y-4 group relative">
        <button onClick={() => capturePNG(headerRef, 'Header')} className="absolute -right-2 top-0 p-2 bg-white rounded-full shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity z-10"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
        <h1 className="text-6xl font-black text-slate-900 tracking-tight font-brand">{bible.brandName}</h1>
        <p className="text-xl text-slate-500 font-medium italic">{isGeneratingStrategy ? <Shimmer className="h-6 w-64 mx-auto" /> : bible.tagline}</p>
        <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mt-8" />
      </section>

      {/* Primary Identity Section */}
      <div ref={identityGridRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative group">
        <button onClick={() => capturePNG(identityGridRef, 'Identity_Standards')} className="absolute -right-2 -top-2 p-2 bg-white rounded-full shadow-md border opacity-0 group-hover:opacity-100 transition-opacity z-10"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
        
        {/* Strategic Foundation */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10 overflow-hidden relative">
          <div className="relative z-10 space-y-10">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 mb-6">Mission & Vision</h2>
              {isGeneratingStrategy ? <Shimmer className="h-32 w-full" /> : <p className="text-slate-700 leading-relaxed text-2xl font-medium tracking-tight">{bible.missionStatement}</p>}
            </div>
            <div className="pt-10 border-t border-slate-50">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 mb-6">Brand Voice</h2>
              {isGeneratingStrategy ? <Shimmer className="h-10 w-full" /> : <p className="text-slate-600 leading-relaxed text-lg">{bible.brandVoice}</p>}
            </div>
          </div>
        </div>

        {/* Identity Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-between space-y-6">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Identity Piece</span>
              <h3 className="text-lg font-bold text-slate-900">Primary Logo</h3>
            </div>
            <SmartImage 
              src={bible.primaryLogoUrl} 
              alt="Primary Logo" 
              className="w-full h-auto rounded-2xl shadow-inner transition-transform hover:scale-110 cursor-zoom-in" 
              containerClass="w-full aspect-square bg-slate-50/50 rounded-3xl border border-slate-50 p-6 flex items-center justify-center"
            />
            <button 
              onClick={onRegenerateLogo} 
              disabled={isRegeneratingLogo || isGeneratingStrategy} 
              className="w-full py-3 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 font-bold text-xs rounded-2xl transition-all border border-transparent hover:border-blue-100"
            >
              {isRegeneratingLogo ? 'Architecting...' : 'Regenerate Logo'}
            </button>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-between space-y-6">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Identity Piece</span>
              <h3 className="text-lg font-bold text-slate-900">Brand Mark</h3>
            </div>
            <SmartImage 
              src={bible.secondaryMarkUrl} 
              alt="Brand Mark" 
              className="w-full h-auto rounded-2xl shadow-inner" 
              containerClass="w-full aspect-square bg-slate-50/50 rounded-3xl border border-slate-50 p-6 flex items-center justify-center"
            />
            <button 
              onClick={onRegenerateSecondaryMark} 
              disabled={isRegeneratingMark || isGeneratingStrategy} 
              className="w-full py-3 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 font-bold text-xs rounded-2xl transition-all border border-transparent hover:border-blue-100"
            >
              {isRegeneratingMark ? 'Drafting...' : 'Regenerate Mark'}
            </button>
          </div>
        </div>
      </div>

      {/* Logo Variations Section */}
      <section ref={logoVariationsRef} className="space-y-10 relative group">
        <button onClick={() => capturePNG(logoVariationsRef, 'Logo_Variations')} className="absolute -right-2 -top-2 p-2 bg-white rounded-full shadow-md border opacity-0 group-hover:opacity-100 transition-opacity z-10"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Logo Variations</h2>
            <p className="text-slate-400 text-sm font-medium">Alternative orientations and typographic explorations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {(bible.logoVariations || [null, null, null]).map((v, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6 flex flex-col transition-all group/card ${logoVariationMeta[i].bg}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-slate-400 text-xs border border-slate-50">
                    {logoVariationMeta[i].icon}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-900 tracking-tight text-sm">{logoVariationMeta[i].title}</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{logoVariationMeta[i].subtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onRegenerateVariation?.(i)} 
                  disabled={!v || isGeneratingStrategy} 
                  className="p-2 bg-white/80 rounded-full opacity-0 group-hover/card:opacity-100 transition-all text-blue-600 shadow-sm border border-slate-50"
                  title="Regenerate this specific variation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <SmartImage 
                src={v || undefined} 
                alt={logoVariationMeta[i].title} 
                className="w-full h-full object-contain" 
                containerClass="w-full aspect-square bg-white rounded-3xl shadow-inner border border-slate-50 p-8 flex items-center justify-center"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Secondary Mark Variations Section */}
      <section ref={markVariationsRef} className="space-y-10 relative group">
        <button onClick={() => capturePNG(markVariationsRef, 'Mark_Variations')} className="absolute -right-2 -top-2 p-2 bg-white rounded-full shadow-md border opacity-0 group-hover:opacity-100 transition-opacity z-10"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Secondary Mark Variations</h2>
            <p className="text-slate-400 text-sm font-medium">Alternative symbols and functional brand glyphs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {(bible.secondaryMarkVariations || [null, null, null]).map((v, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6 flex flex-col transition-all group/card ${markVariationMeta[i].bg}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-slate-400 text-xs border border-slate-50">
                    {markVariationMeta[i].icon}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-900 tracking-tight text-sm">{markVariationMeta[i].title}</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{markVariationMeta[i].subtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onRegenerateMarkVariation?.(i)} 
                  disabled={!v || isGeneratingStrategy} 
                  className="p-3 bg-blue-600 rounded-full opacity-0 group-hover/card:opacity-100 transition-all text-white shadow-lg hover:bg-blue-700 transform hover:scale-110"
                  title="Regenerate this specific mark"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <SmartImage 
                src={v || undefined} 
                alt={markVariationMeta[i].title} 
                className="w-full h-full object-contain" 
                containerClass="w-full aspect-square bg-white rounded-3xl shadow-inner border border-slate-50 p-8 flex items-center justify-center"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Colors & Typography Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div ref={paletteRef} className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative group">
          <button onClick={() => capturePNG(paletteRef, 'Color_Palette')} className="absolute -right-2 -top-2 p-2 bg-white rounded-full shadow-md border opacity-0 group-hover:opacity-100 transition-opacity z-10"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
          <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">Brand Palette</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            {isPaletteEmpty ? Array.from({ length: 5 }).map((_, i) => <Shimmer key={i} className="aspect-square rounded-2xl" />) : bible.palette.map((c, i) => (
              <div key={i} className="space-y-4">
                <div className="w-full aspect-square rounded-3xl shadow-md border border-slate-50" style={{ backgroundColor: c.hex }} />
                <div>
                  <p className="font-bold text-slate-900 text-sm truncate">{c.name}</p>
                  <p className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">{c.hex}</p>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">{c.usage}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div ref={typographyRef} className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl space-y-10 max-h-[600px] overflow-y-auto custom-scrollbar relative group">
          <button onClick={() => capturePNG(typographyRef, 'Typography')} className="absolute right-6 top-6 p-2 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"><svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
          <h2 className="text-2xl font-bold tracking-tight">Typography</h2>
          {isFontsEmpty ? <Shimmer className="h-60 w-full bg-white/10" /> : bible.fontPairings.map((p, i) => (
            <div key={i} className={`space-y-6 ${i !== 0 ? 'pt-10 border-t border-white/10' : ''}`}>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-30">Stack Option {i + 1}</span>
              <div className="space-y-3">
                <p className="text-4xl font-black leading-tight" style={{ fontFamily: p.header }}>{p.header}</p>
                <p className="text-lg opacity-60" style={{ fontFamily: p.body }}>{p.body} - Professional Body Text</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-xs opacity-60 leading-relaxed italic">
                {p.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Presence Section */}
      <section ref={socialRef} className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 relative group overflow-hidden">
        <button onClick={() => capturePNG(socialRef, 'Social_Identity')} className="absolute -right-2 -top-2 p-2 bg-white rounded-full shadow-md border opacity-0 group-hover:opacity-100 transition-opacity z-10"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
        <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">Social Identity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialHandles.map((h, i) => (
            <div key={i} className="px-8 py-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex flex-col gap-2 group/item transition-all cursor-pointer hover:bg-white hover:shadow-lg hover:border-blue-100" onClick={() => { navigator.clipboard.writeText(h); alert(`Copied ${h}`); }}>
              <span className="text-[10px] uppercase font-bold text-slate-400 group-hover/item:text-blue-500 tracking-widest">Recommended Handle</span>
              <span className="text-2xl font-mono font-semibold text-slate-800 tracking-tighter">{h}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-12 border-t border-slate-100 text-slate-400 text-sm font-medium">
        © 2024 {bible.brandName} • Brand Bible generated by BrandForge AI • Powered by Gemini
      </footer>
    </div>
  );
};

export default BrandBibleView;
