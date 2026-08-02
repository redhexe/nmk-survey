'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/translations';

interface SectionProps {
  sessionId: string;
  onNext: () => void;
  onPrev: () => void;
}

const RatingMatrix = ({ question, value, onChange, minText, maxText }: any) => (
  <div className="mb-6">
    <h3 className="text-[17px] font-medium text-[#191f28] mb-3 leading-relaxed">{question}</h3>
    <div className="flex justify-between items-center bg-[#f2f4f6] p-4 rounded-3xl mb-1">
      {[1, 2, 3, 4, 5].map(num => (
        <button 
          key={num} 
          onClick={() => onChange(num)}
          className={`w-11 h-11 rounded-full font-bold text-lg transition-all ${value === num ? 'bg-[#3182f6] text-white shadow-md transform scale-110' : 'bg-white text-[#4e5968] hover:bg-gray-100 shadow-sm'}`}
        >
          {num}
        </button>
      ))}
    </div>
    <div className="flex justify-between px-4 text-[10px] text-[#AAAAAA] font-bold mt-1">
      <span className="text-center w-[64px] -ml-[10px] leading-[1.2] whitespace-pre-line break-keep">{minText.replace(' ', '\n')}</span>
      <span className="text-center w-[64px] -mr-[10px] leading-[1.2] whitespace-pre-line break-keep">{maxText.replace(' ', '\n')}</span>
    </div>
  </div>
);

export default function SectionD({ sessionId, onNext, onPrev }: SectionProps) {
  const [lang, setLang] = useState('en');
  
  useEffect(() => { 
    setLang(localStorage.getItem('survey_lang') || 'en'); 
    window.scrollTo(0, 0);
  }, []);

  const [d1_1, setD1_1] = useState<number | null>(null);
  const [d1_2, setD1_2] = useState<number | null>(null);
  const [d1_3, setD1_3] = useState<number | null>(null);
  const [d2, setD2] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  const t = translations[lang]?.sectionD || translations['en'].sectionD;
  const enBase = translations['en'].sectionD;
  const tc = translations[lang]?.common || translations['en'].common;
  const ta = translations[lang]?.sectionA || translations['en'].sectionA;

  const handleNext = async () => {
    // D1 is required (all 3)
    if (d1_1 === null || d1_2 === null || d1_3 === null) return;
    
    setIsSaving(true);
    await supabase.from('responses').update({ 
      d1_1, d1_2, d1_3,
      d2_expectation_change: d2 || null
    }).eq('session_id', sessionId);
    setIsSaving(false);
    onNext();
  };

  const isNextDisabled = d1_1 === null || d1_2 === null || d1_3 === null || isSaving;

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative pb-28">
      <div className="pt-4 pb-2 px-6 flex items-center justify-between">
        <button onClick={onPrev} className="text-[#4e5968] font-medium p-2 -ml-2 hover:text-[#191f28]">← {ta.back}</button>
        <span className="text-[#8b95a1] font-bold bg-[#f2f4f6] px-3 py-1 rounded-full text-sm">4 / 6</span>
      </div>
      <div className="p-6 flex-1 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#191f28] mb-2">{t.title}</h1>
        </div>

        {/* D1 Matrix (Required) */}
        <div className="bg-[#fafafa] p-5 rounded-3xl border border-gray-100">
          <h2 className="text-[19px] font-bold text-[#191f28] mb-6">{t.d1} <span className="text-[#3182f6]">*</span></h2>
          <RatingMatrix question={t.d1_q[0]} value={d1_1} onChange={setD1_1} minText={t.disagree} maxText={t.agree} />
          <RatingMatrix question={t.d1_q[1]} value={d1_2} onChange={setD1_2} minText={t.disagree} maxText={t.agree} />
          <RatingMatrix question={t.d1_q[2]} value={d1_3} onChange={setD1_3} minText={t.disagree} maxText={t.agree} />
        </div>

        {/* D2 */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-4">{t.d2}</h2>
          <div className="flex flex-col gap-3">
            {t.d2_options.map((opt: string, i: number) => {
              const baseValue = enBase.d2_options[i];
              return (
                <button 
                  key={i} 
                  onClick={() => setD2(d2 === baseValue ? '' : baseValue)} 
                  className={`text-left p-5 rounded-2xl text-[17px] font-medium transition-all ${d2 === baseValue ? 'bg-[#3182f6] text-white shadow-md' : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-5 pb-8 bg-white border-t border-gray-100 flex gap-3">
        <button onClick={onPrev} className="flex-1 py-4 rounded-2xl text-[18px] font-bold text-[#4e5968] bg-[#f2f4f6] hover:bg-[#e5e8eb] transition-colors">
          {ta.back}
        </button>
        <button onClick={handleNext} disabled={isNextDisabled} className={`flex-[2] py-4 rounded-2xl text-[18px] font-bold text-white transition-colors ${isNextDisabled ? 'bg-[#d1d6db] cursor-not-allowed' : 'bg-[#3182f6] hover:bg-[#1b64da] active:bg-[#1b64da] shadow-lg shadow-blue-500/20'}`}>
          {isSaving ? tc.saving : ta.next}
        </button>
      </div>
    </div>
  );
}
