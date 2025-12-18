
import React, { useState, useCallback } from 'react';
import { BrandBible, ImageSize } from './types';
import { generateBrandStrategy, generateBrandImage } from './geminiService';
import ApiKeySelector from './components/ApiKeySelector';
import BrandBibleView from './components/BrandBibleView';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [brandName, setBrandName] = useState('');
  const [mission, setMission] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.S1K);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [brandBible, setBrandBible] = useState<BrandBible | null>(null);
  const [showKeySelector, setShowKeySelector] = useState(false);
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);

    if (!brandName.trim()) {
      setError("Please enter a brand name.");
      return;
    }
    if (brandName.trim().length < 2) {
      setError("Brand name must be at least 2 characters long.");
      return;
    }
    if (!mission.trim()) {
      setError("Please describe your company mission.");
      return;
    }
    if (mission.trim().length < 10) {
      setError("Mission description is too short. Please provide more detail (min 10 characters).");
      return;
    }

    // @ts-ignore
    const hasKey = window.aistudio && await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      setShowKeySelector(true);
      return;
    }

    setIsGenerating(true);
    
    setBrandBible({
      brandName: brandName.trim(),
      tagline: 'Architecting your vision...',
      missionStatement: mission.trim(),
      brandVoice: '',
      palette: [],
      fontPairings: [],
      logoVariations: [undefined as any, undefined as any, undefined as any],
      secondaryMarkVariations: [undefined as any, undefined as any, undefined as any],
    });
    
    try {
      setGenerationStep('Architecting brand strategy...');
      const strategy = await generateBrandStrategy(mission, brandName);
      setBrandBible({ 
        ...strategy, 
        logoVariations: [undefined as any, undefined as any, undefined as any],
        secondaryMarkVariations: [undefined as any, undefined as any, undefined as any]
      });

      setGenerationStep('Illustrating primary identity...');
      const primaryLogoUrl = await generateBrandImage(
        `Professional primary logo for "${strategy.brandName}". Tagline: "${strategy.tagline}". Mission focus: "${strategy.missionStatement}". Style: ${strategy.brandVoice}, minimalist, flat vector, high contrast. White background.`,
        imageSize
      );
      setBrandBible(prev => prev ? { ...prev, primaryLogoUrl } : null);

      setGenerationStep('Drafting brand marks...');
      const secondaryMarkUrl = await generateBrandImage(
        `Iconic secondary brand mark symbol for "${strategy.brandName}". Symbolic of ${strategy.missionStatement}. Minimal, geometric, vector style. White background.`,
        imageSize
      );
      setBrandBible(prev => prev ? { ...prev, secondaryMarkUrl } : null);

      setGenerationStep('Creating logo variations...');
      const logoVariationPrompts = [
        `Logo variation for "${strategy.brandName}": Bold, modern typographic focus. Style: ${strategy.brandVoice}. White background.`,
        `Logo variation for "${strategy.brandName}": Abstract geometric symbol combined with brand name. Style: ${strategy.brandVoice}. White background.`,
        `Logo variation for "${strategy.brandName}": Elegant, minimalist icon-focused design. Style: ${strategy.brandVoice}. White background.`
      ];

      const logoVariations = await Promise.all(logoVariationPrompts.map(p => generateBrandImage(p, imageSize)));
      setBrandBible(prev => prev ? { ...prev, logoVariations } : null);

      setGenerationStep('Exploring mark variations...');
      const markVariationPrompts = [
        `Secondary mark variation for "${strategy.brandName}": Minimalist geometric icon. Style: ${strategy.brandVoice}. White background.`,
        `Secondary mark variation for "${strategy.brandName}": Abstract organic shape inspired by ${strategy.missionStatement}. White background.`,
        `Secondary mark variation for "${strategy.brandName}": Symbolic monogram or lettermark variation. White background.`
      ];

      const markVariations = await Promise.all(markVariationPrompts.map(p => generateBrandImage(p, imageSize)));
      setBrandBible(prev => prev ? { ...prev, secondaryMarkVariations: markVariations } : null);

    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('Requested entity was not found')) {
        setShowKeySelector(true);
        setBrandBible(null);
      } else {
        alert("An error occurred during generation. Please try again.");
        setBrandBible(null);
      }
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleRegenerateLogo = async () => {
    if (!brandBible) return;
    setBrandBible(prev => prev ? { ...prev, primaryLogoUrl: undefined } : null);
    try {
      const newLogoUrl = await generateBrandImage(
        `Professional primary logo for "${brandBible.brandName}". Tagline: "${brandBible.tagline}". Mission focus: "${brandBible.missionStatement}". Style: ${brandBible.brandVoice}, minimalist, flat vector, high contrast. White background.`,
        imageSize
      );
      setBrandBible(prev => prev ? { ...prev, primaryLogoUrl: newLogoUrl } : null);
    } catch (error) {
      console.error(error);
      alert("Failed to regenerate logo.");
    }
  };

  const handleRegenerateSecondaryMark = async () => {
    if (!brandBible) return;
    setBrandBible(prev => prev ? { ...prev, secondaryMarkUrl: undefined } : null);
    try {
      const newMarkUrl = await generateBrandImage(
        `Iconic secondary brand mark symbol for "${brandBible.brandName}". Symbolic of ${brandBible.missionStatement}. Minimal, geometric, vector style. White background.`,
        imageSize
      );
      setBrandBible(prev => prev ? { ...prev, secondaryMarkUrl: newMarkUrl } : null);
    } catch (error) {
      console.error(error);
      alert("Failed to regenerate brand mark.");
    }
  };

  const handleRegenerateVariation = async (index: number) => {
    if (!brandBible || !brandBible.logoVariations) return;
    
    const newVariations = [...brandBible.logoVariations];
    newVariations[index] = undefined as any;
    setBrandBible(prev => prev ? { ...prev, logoVariations: newVariations } : null);

    const variationPrompts = [
      `Logo variation for "${brandBible.brandName}": Bold, modern typographic focus. Style: ${brandBible.brandVoice}. White background.`,
      `Logo variation for "${brandBible.brandName}": Abstract geometric symbol combined with brand name. Style: ${brandBible.brandVoice}. White background.`,
      `Logo variation for "${brandBible.brandName}": Elegant, minimalist icon-focused design. Style: ${brandBible.brandVoice}. White background.`
    ];

    try {
      const newUrl = await generateBrandImage(variationPrompts[index], imageSize);
      const updatedVariations = [...(brandBible.logoVariations || [])];
      updatedVariations[index] = newUrl;
      setBrandBible(prev => prev ? { ...prev, logoVariations: updatedVariations } : null);
    } catch (error) {
      console.error(error);
      alert("Failed to regenerate variation.");
    }
  };

  const handleRegenerateMarkVariation = async (index: number) => {
    if (!brandBible || !brandBible.secondaryMarkVariations) return;
    
    const newVariations = [...brandBible.secondaryMarkVariations];
    newVariations[index] = undefined as any;
    setBrandBible(prev => prev ? { ...prev, secondaryMarkVariations: newVariations } : null);

    const variationPrompts = [
      `Secondary mark variation for "${brandBible.brandName}": Minimalist geometric icon. Style: ${brandBible.brandVoice}. White background.`,
      `Secondary mark variation for "${brandBible.brandName}": Abstract organic shape inspired by ${brandBible.missionStatement}. White background.`,
      `Secondary mark variation for "${brandBible.brandName}": Symbolic monogram or lettermark variation. White background.`
    ];

    try {
      const newUrl = await generateBrandImage(variationPrompts[index], imageSize);
      const updatedVariations = [...(brandBible.secondaryMarkVariations || [])];
      updatedVariations[index] = newUrl;
      setBrandBible(prev => prev ? { ...prev, secondaryMarkVariations: updatedVariations } : null);
    } catch (error) {
      console.error(error);
      alert("Failed to regenerate mark variation.");
    }
  };

  const onKeySelected = () => {
    setShowKeySelector(false);
    setIsKeyValid(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {showKeySelector && <ApiKeySelector onKeySelected={onKeySelected} />}

      <nav className="p-6 flex justify-between items-center border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 115.656 5.656L10 17.657" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight">BrandForge <span className="text-blue-600">AI</span></span>
        </div>
        
        {brandBible && !isGenerating && (
          <button 
            onClick={() => {
              setBrandBible(null);
              setBrandName('');
              setMission('');
            }}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Create New Brand
          </button>
        )}
      </nav>

      <main>
        {!brandBible ? (
          <div className="max-w-4xl mx-auto pt-20 px-6">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                Your Brand Vision, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Perfectly Architected.</span>
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Define your name and mission, and let our world-class AI agent craft a comprehensive Brand Bible with high-fidelity 4K assets.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-20">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g., Lumina"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Company Mission</label>
                  <textarea
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    placeholder="e.g., We are a sustainable footwear company focused on extreme comfort and urban style for the modern commuter..."
                    className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-lg resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Asset Quality</label>
                      <div className="relative group">
                        <svg className="w-4 h-4 text-slate-300 hover:text-blue-500 cursor-help transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50">
                          <div className="space-y-2">
                            <p><strong className="text-blue-400">1K:</strong> Standard (1024px) - Fast & efficient generation.</p>
                            <p><strong className="text-blue-400">2K:</strong> High (2048px) - Enhanced detail for web and digital displays.</p>
                            <p><strong className="text-blue-400">4K:</strong> Ultra (4096px) - Maximum fidelity, perfect for print and high-end media.</p>
                          </div>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex p-1 bg-slate-50 rounded-xl">
                      {Object.values(ImageSize).map((size) => (
                        <button
                          key={size}
                          onClick={() => setImageSize(size)}
                          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                            imageSize === size 
                              ? 'bg-white shadow-sm text-blue-600' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleStart}
                  disabled={isGenerating || !mission || !brandName}
                  className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-bold text-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {generationStep}
                    </div>
                  ) : (
                    "Generate Brand Bible"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {isGenerating && (
              <div className="fixed top-[88px] left-0 right-0 z-20 flex justify-center pointer-events-none">
                <div className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-2xl font-bold text-sm animate-bounce flex items-center gap-3">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {generationStep}
                </div>
              </div>
            )}
            <BrandBibleView 
              bible={brandBible} 
              onRegenerateLogo={handleRegenerateLogo} 
              onRegenerateSecondaryMark={handleRegenerateSecondaryMark}
              onRegenerateVariation={handleRegenerateVariation}
              onRegenerateMarkVariation={handleRegenerateMarkVariation}
              imageSize={imageSize}
              setImageSize={setImageSize}
              isGeneratingStrategy={!brandBible.palette.length}
            />
          </div>
        )}
      </main>

      <ChatBot brandDetails={brandBible || undefined} />
    </div>
  );
};

export default App;
