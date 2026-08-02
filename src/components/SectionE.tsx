'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/translations';

interface SectionProps {
  sessionId: string;
  onNext: () => void;
  onPrev: () => void;
}

export default function SectionE({ sessionId, onNext, onPrev }: SectionProps) {
  const [lang, setLang] = useState('en');
  
  useEffect(() => { 
    setLang(localStorage.getItem('survey_lang') || 'en'); 
    window.scrollTo(0, 0);
  }, []);

  const [e1, setE1] = useState<string[]>([]);
  const [e2, setE2] = useState<string[]>([]);
  const [e3, setE3] = useState('');
  const [e4, setE4] = useState<string[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [showWarning, setShowWarning] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsScrolledToBottom(true);
    });
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, []);

  const t = translations[lang]?.sectionE || translations['en'].sectionE;
  const enBase = translations['en'].sectionE;
  const tc = translations[lang]?.common || translations['en'].common;
  const ta = translations[lang]?.sectionA || translations['en'].sectionA;

  // e1_options[0] is "Looked at my phone"
  const lookedAtPhoneValue = enBase.e1_options[0];
  const showE2 = e1.includes(lookedAtPhoneValue);

  const handleNext = async () => {
    setIsSaving(true);
    await supabase.from('responses').update({ 
      e1_activities: e1.length > 0 ? e1 : null,
      e2_phone_content: showE2 && e2.length > 0 ? e2 : [], // if not shown or empty, empty array
      e3_signage_language: e3 || null,
      e4_difficulties: e4.length > 0 ? e4 : null
    }).eq('session_id', sessionId);
    setIsSaving(false);
    onNext();
  };

  const isRequiredAnswered = true; // No required questions in Section E
  const isReady = isScrolledToBottom && isRequiredAnswered;

  const handleNextClick = () => {
    if (!isScrolledToBottom) {
      setShowWarning(tc.scroll_warning);
      return;
    }
    setShowWarning('');
    handleNext();
  };

  const toggleArray = (val: string, arr: string[], setArr: (val: string[]) => void) => {
    if (arr.includes(val)) {
      setArr(arr.filter(v => v !== val));
    } else {
      setArr([...arr, val]);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative pb-28">
      <div className="pt-4 pb-2 px-6 flex items-center justify-between">
        <button onClick={onPrev} className="text-[#4e5968] font-medium p-2 -ml-2 hover:text-[#191f28]">← {ta.back}</button>
        <span className="text-[#8b95a1] font-bold bg-[#f2f4f6] px-3 py-1 rounded-full text-sm">5 / 6</span>
      </div>
      <div className="p-6 flex-1 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#191f28] mb-2">{t.title}</h1>
        </div>

        {/* E1 (Multiple) */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-1">{t.e1}</h2>
          <p className="text-[#8b95a1] text-[14px] mb-4 font-normal">{tc.multiple_select}</p>
          <div className="flex flex-col gap-3">
            {t.e1_options.map((opt: string, i: number) => {
              const baseValue = enBase.e1_options[i];
              const isSelected = e1.includes(baseValue);
              return (
                <button 
                  key={i} 
                  onClick={() => toggleArray(baseValue, e1, setE1)} 
                  className={`text-left p-4 rounded-2xl text-[16px] font-medium transition-all border ${isSelected ? 'bg-[#e8f3ff] text-[#3182f6] border-[#3182f6] shadow-sm' : 'bg-[#f2f4f6] text-[#4e5968] border-transparent hover:bg-[#e5e8eb]'}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* E2 (Multiple, Conditional) */}
        {showE2 && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-[19px] font-bold text-[#191f28] mb-1">{t.e2}</h2>
            <p className="text-[#8b95a1] text-[14px] mb-4 font-normal">{tc.multiple_select}</p>
            <div className="flex flex-wrap gap-2">
              {t.e2_options.map((opt: string, i: number) => {
                const baseValue = enBase.e2_options[i];
                const isSelected = e2.includes(baseValue);
                return (
                  <button 
                    key={i} 
                    onClick={() => toggleArray(baseValue, e2, setE2)} 
                    className={`text-left px-4 py-3 rounded-full text-[15px] font-medium transition-all border ${isSelected ? 'bg-[#e8f3ff] text-[#3182f6] border-[#3182f6]' : 'bg-white text-[#4e5968] border-[#e5e8eb] hover:bg-[#f2f4f6]'}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* E3 */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-4">{t.e3}</h2>
          <div className="flex flex-wrap gap-2">
            {t.e3_options.map((opt: string, i: number) => {
              const baseValue = enBase.e3_options[i];
              return (
                <button 
                  key={i} 
                  onClick={() => setE3(e3 === baseValue ? '' : baseValue)} 
                  className={`text-left px-4 py-3 rounded-full text-[15px] font-medium transition-all border ${e3 === baseValue ? 'bg-[#3182f6] text-white border-[#3182f6]' : 'bg-white text-[#4e5968] border-[#e5e8eb] hover:bg-[#f2f4f6]'}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* E4 (Multiple) */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-1">{t.e4}</h2>
          <p className="text-[#8b95a1] text-[14px] mb-4 font-normal">{tc.multiple_select}</p>
          <div className="flex flex-col gap-3">
            {t.e4_options.map((opt: string, i: number) => {
              const baseValue = enBase.e4_options[i];
              const isSelected = e4.includes(baseValue);
              return (
                <button 
                  key={i} 
                  onClick={() => toggleArray(baseValue, e4, setE4)} 
                  className={`text-left p-4 rounded-2xl text-[16px] font-medium transition-all border ${isSelected ? 'bg-[#e8f3ff] text-[#3182f6] border-[#3182f6] shadow-sm' : 'bg-[#f2f4f6] text-[#4e5968] border-transparent hover:bg-[#e5e8eb]'}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

      </div>
      <div ref={bottomRef} className="h-1" />
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 z-10">
        {showWarning && (
          <p className="text-center text-[#e53e3e] text-[13px] font-bold pt-3 px-4 leading-tight">{showWarning}</p>
        )}
        <div className="p-5 pb-8 flex gap-3">
          <button onClick={onPrev} className="flex-1 py-4 rounded-2xl text-[18px] font-bold text-[#4e5968] bg-[#f2f4f6] hover:bg-[#e5e8eb] transition-colors">
            {ta.back}
          </button>
          <button onClick={handleNextClick} disabled={isSaving} className={`flex-[2] py-4 rounded-2xl text-[18px] font-bold text-white transition-colors ${!isReady ? 'bg-[#d1d6db]' : 'bg-[#3182f6] hover:bg-[#1b64da] active:bg-[#1b64da] shadow-lg shadow-blue-500/20'}`}>
            {isSaving ? tc.saving : ta.next}
          </button>
        </div>
      </div>
    </div>
  );
}
