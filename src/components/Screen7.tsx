'use client';

import { useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

export default function Screen7() {
  const [lang, setLang] = useState('en');
  
  useEffect(() => { 
    setLang(localStorage.getItem('survey_lang') || 'en'); 
    window.scrollTo(0, 0);
  }, []);

  const t = translations[lang]?.screen7 || translations['en'].screen7;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 max-w-md mx-auto bg-white">
      <div className="text-center w-full">
        <h1 className="text-2xl font-bold mb-4 text-[#191f28] whitespace-pre-wrap leading-relaxed">{t.thankYou}</h1>
        <p className="text-[#4e5968] text-lg font-medium">{t.enjoy}</p>
      </div>
    </div>
  );
}
