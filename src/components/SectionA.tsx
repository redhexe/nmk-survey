'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { translations, getCountries } from '@/lib/translations';
import Select from 'react-select';

interface SectionProps {
  sessionId: string;
  onNext: () => void;
  onPrev: () => void;
}

export default function SectionA({ sessionId, onNext, onPrev }: SectionProps) {
  const [lang, setLang] = useState('en');
  
  useEffect(() => { 
    setLang(localStorage.getItem('survey_lang') || 'en'); 
    window.scrollTo(0, 0);
  }, []);

  const [a1, setA1] = useState<any>(null); // react-select option
  const [a2, setA2] = useState('');
  const [a3, setA3] = useState('');
  const [a4, setA4] = useState('');
  const [a4Other, setA4Other] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [showWarning, setShowWarning] = useState('');

  const t = translations[lang]?.sectionA || translations['en'].sectionA;
  const enBase = translations['en'].sectionA;
  const tc = translations[lang]?.common || translations['en'].common;

  const countries = useMemo(() => getCountries(lang), [lang]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsScrolledToBottom(true);
    });
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, []);

  const handleNext = async () => {
    setIsSaving(true);
    await supabase.from('responses').update({ 
      a1_country: a1.value, 
      a2_age: a2 || null, 
      a3_gender: a3 || null, 
      a4_language: a4 || null, 
      a4_language_other: a4 === enBase.a4_options[6] ? a4Other : null 
    }).eq('session_id', sessionId);
    setIsSaving(false);
    onNext();
  };

  const isRequiredAnswered = !!a1;
  const isReady = isScrolledToBottom && isRequiredAnswered;

  const handleNextClick = () => {
    if (!isScrolledToBottom) {
      setShowWarning(tc.scroll_warning);
      return;
    }
    if (!isRequiredAnswered) {
      setShowWarning(tc.incomplete_warning);
      return;
    }
    setShowWarning('');
    handleNext();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative pb-28">
      <div className="pt-4 pb-2 px-6 flex items-center justify-between">
        <button onClick={onPrev} className="text-[#4e5968] font-medium p-2 -ml-2 hover:text-[#191f28]">← {t.back}</button>
        <span className="text-[#8b95a1] font-bold bg-[#f2f4f6] px-3 py-1 rounded-full text-sm">1 / 6</span>
      </div>
      <div className="p-6 flex-1 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#191f28] mb-2">{t.title}</h1>
        </div>
        
        {/* A1 Country (Required) */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-4">{t.a1} <span className="text-[#3182f6]">*</span></h2>
          <Select
            value={a1}
            onChange={(selected) => setA1(selected)}
            options={countries}
            placeholder={t.a1_placeholder}
            noOptionsMessage={() => "..."}
            className="text-[17px]"
            styles={{
              control: (base) => ({
                ...base,
                border: 'none',
                backgroundColor: '#f2f4f6',
                borderRadius: '16px',
                padding: '8px 16px',
                boxShadow: 'none',
                minHeight: '60px'
              }),
              menu: (base) => ({
                ...base,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid #e5e8eb'
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? '#3182f6' : state.isFocused ? '#f2f4f6' : 'white',
                color: state.isSelected ? 'white' : '#191f28',
                padding: '12px 16px',
                cursor: 'pointer'
              })
            }}
          />
        </div>

        {/* A2 Age */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-4">{t.a2}</h2>
          <div className="flex flex-col gap-3">
            {t.a2_options.map((opt: string, i: number) => {
              const baseValue = enBase.a2_options[i];
              return (
                <button key={i} onClick={() => setA2(baseValue)} className={`text-left p-5 rounded-2xl text-[17px] font-medium transition-all ${a2 === baseValue ? 'bg-[#3182f6] text-white shadow-md' : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'}`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* A3 Gender (Optional, No "Prefer not to say") */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-4">{t.a3}</h2>
          <div className="flex flex-col gap-3">
            {t.a3_options.map((opt: string, i: number) => {
              const baseValue = enBase.a3_options[i];
              return (
                <button key={i} onClick={() => setA3(a3 === baseValue ? '' : baseValue)} className={`text-left p-5 rounded-2xl text-[17px] font-medium transition-all ${a3 === baseValue ? 'bg-[#3182f6] text-white shadow-md' : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'}`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* A4 Language */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-4">{t.a4}</h2>
          <div className="flex flex-col gap-3">
            {t.a4_options.map((opt: string, i: number) => {
              const baseValue = enBase.a4_options[i];
              const isOther = i === 6;
              return (
                <div key={i} className="flex flex-col gap-2">
                  <button onClick={() => setA4(baseValue)} className={`text-left p-5 rounded-2xl text-[17px] font-medium transition-all ${a4 === baseValue ? 'bg-[#3182f6] text-white shadow-md' : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'}`}>
                    {opt}
                  </button>
                  {isOther && a4 === baseValue && (
                    <input 
                      type="text" 
                      value={a4Other} 
                      onChange={(e) => setA4Other(e.target.value)} 
                      placeholder={t.a4_placeholder} 
                      className="w-full mt-2 p-5 bg-[#f2f4f6] rounded-2xl text-[17px] text-[#191f28] outline-none focus:ring-2 focus:ring-[#3182f6]"
                    />
                  )}
                </div>
              );
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
            {t.back}
          </button>
          <button onClick={handleNextClick} disabled={isSaving} className={`flex-[2] py-4 rounded-2xl text-[18px] font-bold text-white transition-colors ${!isReady ? 'bg-[#d1d6db]' : 'bg-[#3182f6] hover:bg-[#1b64da] active:bg-[#1b64da] shadow-lg shadow-blue-500/20'}`}>
            {isSaving ? tc.saving : t.next}
          </button>
        </div>
      </div>
    </div>
  );
}
