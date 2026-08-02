'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Screen0 from '@/components/Screen0';
import SectionA from '@/components/SectionA';
import SectionB from '@/components/SectionB';
import SectionC from '@/components/SectionC';
import SectionD from '@/components/SectionD';
import SectionE from '@/components/SectionE';
import SectionF from '@/components/SectionF';
import Screen7 from '@/components/Screen7';

export default function SurveyApp() {
  const [step, setStep] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existingSession = localStorage.getItem('survey_session_id');
    if (existingSession) {
      setSessionId(existingSession);
      if (!localStorage.getItem('survey_section_timestamps')) {
        localStorage.setItem('survey_section_timestamps', '{}');
      }
      setStep(0);
    } else {
      const initSession = async () => {
        const generateUUID = () => {
          if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
          }
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
        const newSessionId = generateUUID();
        const scanAt = new Date().toISOString();
        const urlParams = new URLSearchParams(window.location.search);
        const isTest = urlParams.get('test') === '1';
        try {
          const { error: dbError } = await supabase.from('responses').insert([
            { 
              session_id: newSessionId, 
              scan_at: scanAt,
              user_agent: navigator.userAgent,
              is_test: isTest
            }
          ]);
          if (dbError) throw dbError;
          localStorage.setItem('survey_session_id', newSessionId);
          localStorage.setItem('survey_scan_at', scanAt);
          localStorage.setItem('survey_section_timestamps', '{}');
          setSessionId(newSessionId);
          setStep(0);
        } catch (err) {
          console.error(err);
          setError("Sorry, there was a problem. Please try again in a moment.");
        }
      };
      initSession();
    }
  }, []);

  if (error) return <div className="min-h-screen flex items-center justify-center p-6 bg-white"><div className="text-xl text-center text-red-600 font-bold">{error}</div></div>;
  if (step === null) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="text-xl font-bold text-[#3182f6] animate-pulse">Loading...</div></div>;

  if (step === 0) return <Screen0 sessionId={sessionId!} onNext={() => setStep(1)} />;
  if (step === 1) return <SectionA sessionId={sessionId!} onNext={() => setStep(2)} onPrev={() => setStep(0)} />;
  if (step === 2) return <SectionB sessionId={sessionId!} onNext={() => setStep(3)} onPrev={() => setStep(1)} />;
  if (step === 3) return <SectionC sessionId={sessionId!} onNext={() => setStep(4)} onPrev={() => setStep(2)} />;
  if (step === 4) return <SectionD sessionId={sessionId!} onNext={() => setStep(5)} onPrev={() => setStep(3)} />;
  if (step === 5) return <SectionE sessionId={sessionId!} onNext={() => setStep(6)} onPrev={() => setStep(4)} />;
  if (step === 6) return <SectionF sessionId={sessionId!} onNext={() => setStep(7)} onPrev={() => setStep(5)} />;
  if (step === 7) return <Screen7 />;

  return null;
}
