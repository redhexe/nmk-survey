'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { saveSectionDataBackground, getInitData } from '@/lib/syncData';
import { translations } from '@/lib/translations';

interface SectionProps {
  sessionId: string;
  onNext: () => void;
  onPrev: () => void;
}

const SelectionGroup = ({ question, options, value, onChange, enOptions }: any) => (
  <div className="mb-8">
    <h2 className="text-[19px] font-bold text-[#191f28] mb-4">{question}</h2>
    <div className="flex flex-col gap-3">
      {options.map((opt: string, i: number) => {
        const baseValue = enOptions[i];
        return (
          <button 
            key={i} 
            onClick={() => onChange(value === baseValue ? '' : baseValue)} 
            className={`text-left p-5 rounded-2xl text-[17px] font-medium transition-all ${value === baseValue ? 'bg-[#3182f6] text-white shadow-md' : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'}`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  </div>
);

export default function SectionB({ sessionId, onNext, onPrev }: SectionProps) {
  const [lang, setLang] = useState('en');
  
  useEffect(() => { 
    setLang(localStorage.getItem('survey_lang') || 'en'); 
    window.scrollTo(0, 0);
  }, []);

  const [b1, setB1] = useState(getInitData('b1_purpose', ''));
  const [b2, setB2] = useState(getInitData('b2_first_visit', ''));
  const [b3, setB3] = useState(getInitData('b3_group_size', ''));
  const [b4, setB4] = useState(getInitData('b4_prior_search', ''));
  const [b5, setB5] = useState(getInitData('b5_baggage', ''));
  const [b6, setB6] = useState<string[]>(getInitData('b_pre_info', []));

  const toggleArray = (val: string, arr: string[], setArr: (val: string[]) => void) => {
    if (arr.includes(val)) {
      setArr(arr.filter(v => v !== val));
    } else {
      setArr([...arr, val]);
    }
  };


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

  const t = translations[lang]?.sectionB || translations['en'].sectionB;
  const enBase = translations['en'].sectionB;
  const tc = translations[lang]?.common || translations['en'].common;
  const ta = translations[lang]?.sectionA || translations['en'].sectionA;

  const handleNext = () => {
    const timestamps = JSON.parse(localStorage.getItem('survey_section_timestamps') || '{}');
    timestamps['B'] = new Date().toISOString();
    localStorage.setItem('survey_section_timestamps', JSON.stringify(timestamps));
    
    saveSectionDataBackground(sessionId, { 
      b1_purpose: b1 || null, 
      b2_first_visit: b2 || null, 
      b3_group_size: b3 || null, 
      b4_prior_search: b4 || null,
      b5_baggage: b5 || null,
      b_pre_info: b6.length > 0 ? b6 : null,
      section_timestamps: timestamps
    });
    
    onNext();
  };

  useEffect(() => {
    import('@/lib/syncData').then(({ saveSectionDataDebounced }) => {
      saveSectionDataDebounced(sessionId, {
        b1_purpose: b1 || null, 
        b2_first_visit: b2 || null,
        b3_group_size: b3 || null,
        b4_prior_search: b4 || null,
        b5_baggage: b5 || null,
        b_pre_info: b6.length > 0 ? b6 : null,
      });
    });
  }, [sessionId, b1, b2, b3, b4, b5, b6]);

  const isRequiredAnswered = true; // No required questions in Section B
  const isReady = isScrolledToBottom && isRequiredAnswered;

  const handleNextClick = () => {
    if (!isScrolledToBottom) {
      setShowWarning(tc.scroll_warning);
      return;
    }
    setShowWarning('');
    handleNext();
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col w-full max-w-md mx-auto relative pb-28">
      <div className="pt-4 pb-2 px-6 flex items-center justify-between">
        <button onClick={onPrev} className="text-[#4e5968] font-medium p-2 -ml-2 hover:text-[#191f28]">← {ta.back}</button>
        <span className="text-[#8b95a1] font-bold bg-[#f2f4f6] px-3 py-1 rounded-full text-sm">2 / 6</span>
      </div>
      <div className="p-6 flex-1 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#191f28] mb-2">{t.title}</h1>
        </div>

        <SelectionGroup question={t.b1} options={t.b1_options} enOptions={enBase.b1_options} value={b1} onChange={setB1} />
        <SelectionGroup question={t.b2} options={t.b2_options} enOptions={enBase.b2_options} value={b2} onChange={setB2} />
        <SelectionGroup 
          question={t.b3} 
          options={t.b3_options} 
          enOptions={["Alone", "2 people", "3–4 people", "5 or more"]} 
          value={b3} 
          onChange={setB3} 
        />
        <SelectionGroup question={t.b4} options={t.b4_options} enOptions={enBase.b4_options} value={b4} onChange={setB4} />
        <SelectionGroup question={t.b5} options={t.b5_options} enOptions={enBase.b5_options} value={b5} onChange={setB5} />

        {/* B6 (Multiple) */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-1">{t.b6}</h2>
          <p className="text-[#8b95a1] text-[14px] mb-4 font-normal">{tc.multiple_select}</p>
          <div className="flex flex-col gap-3">
            {t.b6_options?.map((opt: string, i: number) => {
              const baseValue = enBase.b6_options[i];
              const isSelected = b6.includes(baseValue);
              return (
                <button 
                  key={i} 
                  onClick={() => toggleArray(baseValue, b6, setB6)} 
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
          <button onClick={handleNextClick} className={`flex-[2] py-4 rounded-2xl text-[18px] font-bold text-white transition-colors ${!isReady ? 'bg-[#d1d6db]' : 'bg-[#3182f6] hover:bg-[#1b64da] active:bg-[#1b64da] shadow-lg shadow-blue-500/20'}`}>
            {ta.next}
          </button>
        </div>
      </div>
    </div>
  );
}
