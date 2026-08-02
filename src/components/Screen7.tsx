'use client';

import { useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

export default function Screen7() {
  const [lang, setLang] = useState('en');
  
  useEffect(() => { 
    setLang(localStorage.getItem('survey_lang') || 'en'); 
    window.scrollTo(0, 0);

    // 설문이 완료되었으므로 다음 참여자를 위해 로컬 스토리지 초기화
    localStorage.removeItem('survey_session_id');
    localStorage.removeItem('survey_scan_at');
    localStorage.removeItem('survey_section_timestamps');
    localStorage.removeItem('survey_is_test');
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
