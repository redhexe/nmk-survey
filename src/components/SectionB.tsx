'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
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

  const [b1, setB1] = useState('');
  const [b2, setB2] = useState('');
  const [b3, setB3] = useState('');
  const [b4, setB4] = useState('');
  const [b5, setB5] = useState('');
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

  const t = translations[lang]?.sectionB || translations['en'].sectionB;
  const enBase = translations['en'].sectionB;
  const tc = translations[lang]?.common || translations['en'].common;
  const ta = translations[lang]?.sectionA || translations['en'].sectionA;

  const handleNext = async () => {
    setIsSaving(true);
    await supabase.from('responses').update({ 
      b1_purpose: b1 || null, 
      b2_first_visit: b2 || null, 
      b3_group_size: b3 || null, 
      b4_prior_search: b4 || null,
      b5_baggage: b5 || null
    }).eq('session_id', sessionId);
    setIsSaving(false);
    onNext();
  };

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
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative pb-28">
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
        <SelectionGroup question={t.b3} options={t.b3_options} enOptions={enBase.b3_options} value={b3} onChange={setB3} />
        <SelectionGroup question={t.b4} options={t.b4_options} enOptions={enBase.b4_options} value={b4} onChange={setB4} />
        <SelectionGroup question={t.b5} options={t.b5_options} enOptions={enBase.b5_options} value={b5} onChange={setB5} />

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
