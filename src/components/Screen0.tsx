'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/translations';

interface Screen0Props {
  sessionId: string;
  onNext: () => void;
}

const languages = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文 (简体)' },
  { code: 'ja', label: '日本語' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' }
];

export default function Screen0({ sessionId, onNext }: Screen0Props) {
  const [lang, setLang] = useState<string>('en');
  const [consent, setConsent] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.body.className = `min-h-full flex flex-col font-${lang}`;
    localStorage.setItem('survey_lang', lang);
  }, [lang]);

  const t = translations[lang]?.screen0 || translations['en'].screen0;

  const handleNext = async () => {
    if (!consent) return;
    
    setIsSaving(true);
    await supabase
      .from('responses')
      .update({ language: lang, consent })
      .eq('session_id', sessionId);
      
    setIsSaving(false);
    onNext();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-md mx-auto relative bg-white pb-40">
      <div className="p-6 flex-1 flex flex-col justify-start pt-2">
        
        <div className="text-center mb-1 text-[#999999] text-[12px] font-medium leading-relaxed">
          본 설문은 외국인 관람객을 대상으로 하는 연구 설문입니다.<br/>
          This survey is for international visitors only.
        </div>

        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Kookmin University Logo" className="h-11 object-contain" />
        </div>

        <div className="h-[360px] flex flex-col justify-center mb-8">
          <h1 className="text-2xl font-bold text-[#191f28] text-center mb-5 leading-tight">
            {t.welcome}
          </h1>

          <div 
            className="text-[#4e5968] text-[15px] font-normal text-center leading-[1.6] px-2"
            dangerouslySetInnerHTML={{ __html: t.intro }}
          />
        </div>
        
        <div className="bg-[#f2f4f6] rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-[17px] text-[#191f28]">{t.selectLanguage}</span>
          </div>
          <div className="relative">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full p-4 bg-white text-[#191f28] rounded-2xl text-[17px] font-bold border-none shadow-sm focus:ring-2 focus:ring-[#3182f6] outline-none appearance-none cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="#8b95a1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setConsent(!consent)}
          className="flex items-center space-x-3 p-4 mb-6 bg-[#f2f4f6] rounded-2xl cursor-pointer w-full text-left transition-colors"
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${consent ? 'bg-[#3182f6]' : 'bg-gray-300'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[17px] font-bold text-[#191f28]">{t.consent}</span>
        </button>
        
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-5 pb-8 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10">
        <p className="text-[#3182f6] text-[14px] font-bold text-center mb-3">
          {t.instruction}
        </p>
        <button 
          onClick={handleNext}
          disabled={!consent || isSaving}
          className={`w-full py-4 rounded-2xl text-[18px] font-bold text-white transition-colors
            ${!consent || isSaving 
              ? 'bg-[#d1d6db] text-white cursor-not-allowed' 
              : 'bg-[#3182f6] hover:bg-[#1b64da] active:bg-[#1b64da] shadow-lg shadow-blue-500/20'}`}
        >
          {isSaving ? translations[lang]?.common?.saving || 'Saving...' : t.ok}
        </button>
      </div>
    </div>
  );
}
