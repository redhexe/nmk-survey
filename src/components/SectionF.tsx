'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/translations';

interface SectionProps {
  sessionId: string;
  onNext: () => void;
  onPrev: () => void;
}

export default function SectionF({ sessionId, onNext, onPrev }: SectionProps) {
  const [lang, setLang] = useState('en');
  
  useEffect(() => { 
    setLang(localStorage.getItem('survey_lang') || 'en'); 
    window.scrollTo(0, 0);
  }, []);

  const [f1, setF1] = useState<string[]>([]);
  const [f2, setF2] = useState<string[]>([]);
  const [f3, setF3] = useState('');
  
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

  const t = translations[lang]?.sectionF || translations['en'].sectionF;
  const enBase = translations['en'].sectionF;
  const tc = translations[lang]?.common || translations['en'].common;
  const ta = translations[lang]?.sectionA || translations['en'].sectionA;

  const handleNext = async () => {
    setIsSaving(true);
    await supabase.from('responses').update({ 
      f1_wanted_info: f1.length > 0 ? f1 : null,
      f2_would_use: f2.length > 0 ? f2 : null,
      f3_priority: f3 || null,
      is_complete: true,
      submitted_at: new Date().toISOString()
    }).eq('session_id', sessionId);
    setIsSaving(false);
    onNext();
  };

  const isRequiredAnswered = true; // No required questions in Section F
  const isReady = isScrolledToBottom && isRequiredAnswered;

  const handleNextClick = () => {
    if (!isScrolledToBottom) {
      setShowWarning(tc.scroll_warning);
      return;
    }
    setShowWarning('');
    handleNext();
  };

  const toggleF1 = (val: string) => {
    if (f1.includes(val)) {
      setF1(f1.filter(v => v !== val));
    } else {
      if (f1.length >= 2) {
        alert(t.f1_limit);
        return;
      }
      setF1([...f1, val]);
    }
  };

  const toggleF2 = (val: string) => {
    if (f2.includes(val)) {
      setF2(f2.filter(v => v !== val));
    } else {
      setF2([...f2, val]);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col w-full max-w-md mx-auto relative pb-28">
      <div className="pt-4 pb-2 px-6 flex items-center justify-between">
        <button onClick={onPrev} className="text-[#4e5968] font-medium p-2 -ml-2 hover:text-[#191f28]">← {ta.back}</button>
        <span className="text-[#8b95a1] font-bold bg-[#f2f4f6] px-3 py-1 rounded-full text-sm">6 / 6</span>
      </div>
      <div className="p-6 flex-1 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#191f28] mb-2">{t.title}</h1>
        </div>

        {/* F1 (Multiple, max 2) */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-1">{t.f1}</h2>
          <p className="text-[#8b95a1] text-[15px] mb-4 font-medium">{t.f1_sub}</p>
          <div className="flex flex-col gap-3">
            {t.f1_options.map((opt: string, i: number) => {
              const baseValue = enBase.f1_options[i];
              const isSelected = f1.includes(baseValue);
              return (
                <button 
                  key={i} 
                  onClick={() => toggleF1(baseValue)} 
                  className={`text-left p-4 rounded-2xl text-[16px] font-medium transition-all border ${isSelected ? 'bg-[#e8f3ff] text-[#3182f6] border-[#3182f6] shadow-sm' : 'bg-[#f2f4f6] text-[#4e5968] border-transparent hover:bg-[#e5e8eb]'}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* F2 (Multiple) */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-1">{t.f2}</h2>
          <p className="text-[#8b95a1] text-[14px] mb-4 font-normal">{tc.multiple_select}</p>
          <div className="flex flex-col gap-3">
            {t.f2_options.map((opt: string, i: number) => {
              const baseValue = enBase.f2_options[i];
              const isSelected = f2.includes(baseValue);
              return (
                <button 
                  key={i} 
                  onClick={() => toggleF2(baseValue)} 
                  className={`text-left p-4 rounded-2xl text-[16px] font-medium transition-all border ${isSelected ? 'bg-[#e8f3ff] text-[#3182f6] border-[#3182f6] shadow-sm' : 'bg-[#f2f4f6] text-[#4e5968] border-transparent hover:bg-[#e5e8eb]'}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* F3 (Single) */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-4 leading-relaxed">{t.f3}</h2>
          <div className="flex flex-col gap-3">
            {t.f3_options.map((opt: string, i: number) => {
              const baseValue = enBase.f3_options[i];
              return (
                <button 
                  key={i} 
                  onClick={() => setF3(f3 === baseValue ? '' : baseValue)} 
                  className={`text-left p-4 rounded-2xl text-[16px] font-medium transition-all ${f3 === baseValue ? 'bg-[#3182f6] text-white shadow-md' : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'}`}
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
            {isSaving ? t.submitting : t.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
