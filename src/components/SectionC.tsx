'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { saveSectionDataBackground } from '@/lib/syncData';
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

export default function SectionC({ sessionId, onNext, onPrev }: SectionProps) {
  const [lang, setLang] = useState('en');
  
  useEffect(() => { 
    setLang(localStorage.getItem('survey_lang') || 'en'); 
    window.scrollTo(0, 0);
  }, []);

  const [c1, setC1] = useState<number | null>(null);
  const [c2, setC2] = useState<string[]>([]);
  const [c3, setC3] = useState('');
  const [c5, setC5] = useState('');
  const [c4_1, setC4_1] = useState<number | null>(null);
  const [c4_2, setC4_2] = useState<number | null>(null);
  const [c4_3, setC4_3] = useState<number | null>(null);
  const [c4_4, setC4_4] = useState<number | null>(null);
  const [c4_5, setC4_5] = useState<number | null>(null);
  const [c4_6, setC4_6] = useState<number | null>(null);
  const [c4_7, setC4_7] = useState<number | null>(null);
  const [c4_8, setC4_8] = useState<number | null>(null);
  


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

  const t = translations[lang]?.sectionC || translations['en'].sectionC;
  const enBase = translations['en'].sectionC;
  const tc = translations[lang]?.common || translations['en'].common;
  const ta = translations[lang]?.sectionA || translations['en'].sectionA;

  const handleNext = () => {
    const timestamps = JSON.parse(localStorage.getItem('survey_section_timestamps') || '{}');
    timestamps['C'] = new Date().toISOString();
    localStorage.setItem('survey_section_timestamps', JSON.stringify(timestamps));
    
    saveSectionDataBackground(sessionId, { 
      c1_perceived_wait: c1,
      c2_feelings: c2.length > 0 ? c2 : null,
      c3_worst_section: c3 || null,
      c5_estimated_wait: c5 || null,
      c4_1: c4_1, c4_2: c4_2, c4_3: c4_3, c4_4: c4_4,
      c4_5: c4_5, c4_6: c4_6, c4_7: c4_7, c4_8: c4_8,
      section_timestamps: timestamps
    });
    
    onNext();
  };
  const isRequiredAnswered = c1 !== null;
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



  const toggleC2 = (val: string) => {
    if (c2.includes(val)) {
      setC2(c2.filter(v => v !== val));
    } else {
      setC2([...c2, val]);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col w-full max-w-md mx-auto relative pb-28">
      <div className="pt-4 pb-2 px-6 flex items-center justify-between">
        <button onClick={onPrev} className="text-[#4e5968] font-medium p-2 -ml-2 hover:text-[#191f28]">← {ta.back}</button>
        <span className="text-[#8b95a1] font-bold bg-[#f2f4f6] px-3 py-1 rounded-full text-sm">3 / 6</span>
      </div>
      <div className="p-6 flex-1 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#191f28] mb-2">{t.title}</h1>
        </div>

        {/* C1 */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-4">{t.c1} <span className="text-[#3182f6]">*</span></h2>
          <div className="flex flex-col gap-3">
            {t.c1_options.map((opt: string, i: number) => {
              const numVal = i + 1;
              return (
                <button 
                  key={i} 
                  onClick={() => setC1(numVal)} 
                  className={`text-left p-5 rounded-2xl text-[17px] font-medium transition-all ${c1 === numVal ? 'bg-[#3182f6] text-white shadow-md' : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* C2 (Multiple) */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-1">{t.c2}</h2>
          <p className="text-[#8b95a1] text-[14px] mb-4 font-normal">{tc.multiple_select}</p>
          <div className="flex flex-wrap gap-2">
            {t.c2_options.map((opt: string, i: number) => {
              const baseValue = enBase.c2_options[i];
              const isSelected = c2.includes(baseValue);
              return (
                <button 
                  key={i} 
                  onClick={() => toggleC2(baseValue)} 
                  className={`text-left px-5 py-3 rounded-full text-[15px] font-medium transition-all border ${isSelected ? 'bg-[#e8f3ff] text-[#3182f6] border-[#3182f6]' : 'bg-white text-[#4e5968] border-[#e5e8eb] hover:bg-[#f2f4f6]'}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* C3 */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-4">{t.c3}</h2>
          <div className="flex flex-col gap-3">
            {t.c3_options.map((opt: string, i: number) => {
              const baseValue = enBase.c3_options[i];
              return (
                <button 
                  key={i} 
                  onClick={() => setC3(c3 === baseValue ? '' : baseValue)} 
                  className={`text-left p-4 rounded-2xl text-[16px] font-medium transition-all ${c3 === baseValue ? 'bg-[#3182f6] text-white shadow-md' : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* C5 */}
        <div>
          <h2 className="text-[19px] font-bold text-[#191f28] mb-4">{t.c5}</h2>
          <div className="flex flex-col gap-3">
            {t.c5_options.map((opt: string, i: number) => {
              const baseValue = enBase.c5_options[i];
              return (
                <button 
                  key={i} 
                  onClick={() => setC5(c5 === baseValue ? '' : baseValue)} 
                  className={`text-left p-5 rounded-2xl text-[17px] font-medium transition-all ${c5 === baseValue ? 'bg-[#3182f6] text-white shadow-md' : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* C4 Matrix */}
        <div className="bg-[#fafafa] p-5 rounded-3xl border border-gray-100">
          <h2 className="text-[19px] font-bold text-[#191f28] mb-6">{t.c4}</h2>
          <RatingMatrix question={t.c4_q[0]} value={c4_1} onChange={setC4_1} minText={t.disagree} maxText={t.agree} />
          <RatingMatrix question={t.c4_q[1]} value={c4_2} onChange={setC4_2} minText={t.disagree} maxText={t.agree} />
          <RatingMatrix question={t.c4_q[2]} value={c4_3} onChange={setC4_3} minText={t.disagree} maxText={t.agree} />
          <RatingMatrix question={t.c4_q[3]} value={c4_4} onChange={setC4_4} minText={t.disagree} maxText={t.agree} />
          <RatingMatrix question={t.c4_q[4]} value={c4_5} onChange={setC4_5} minText={t.disagree} maxText={t.agree} />
          <RatingMatrix question={t.c4_q[5]} value={c4_6} onChange={setC4_6} minText={t.disagree} maxText={t.agree} />
          <RatingMatrix question={t.c4_q[6]} value={c4_7} onChange={setC4_7} minText={t.disagree} maxText={t.agree} />
          <RatingMatrix question={t.c4_q[7]} value={c4_8} onChange={setC4_8} minText={t.disagree} maxText={t.agree} />
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
