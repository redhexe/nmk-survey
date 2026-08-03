import { supabase } from './supabase';

let pendingSaves = 0;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', (e) => {
    if (pendingSaves > 0) {
      e.preventDefault();
      e.returnValue = '진행 중인 저장이 있습니다. 페이지를 나가시겠습니까?';
      return e.returnValue;
    }
  });
}

/**
 * 백그라운드 저장용 함수 (A~E 섹션)
 * 에러가 나도 UI를 멈추지 않고 조용히 재시도(간단 구현) 또는 실패 무시
 * 
 * 실제 오프라인 환경을 위해 더 고도화하려면 localStorage 큐를 만들어야 하지만,
 * SPA 라우팅 중의 네트워크 지연/일시 끊김을 방지하기 위해 
 * 백그라운드 비동기 통신 + pending 카운트만 유지합니다.
 */
export async function saveSectionDataBackground(sessionId: string, data: any) {
  pendingSaves++;
  try {
    // 1회 재시도 로직 포함
    for (let i = 0; i < 2; i++) {
      const { error } = await supabase.from('responses').update(data).eq('session_id', sessionId);
      if (!error) break;
      if (i === 0) await new Promise(res => setTimeout(res, 1000)); // 1초 후 1번 재시도
    }
  } catch (err) {
    console.error('Background save failed', err);
  } finally {
    pendingSaves--;
  }
}

/**
 * 최종 제출용 함수 (F 섹션)
 * 최대 3회 재시도하며, 실패 여부를 명시적으로 반환합니다.
 */
export async function submitFinalData(sessionId: string, data: any): Promise<boolean> {
  pendingSaves++;
  let success = false;
  
  try {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { error } = await supabase.from('responses').update(data).eq('session_id', sessionId);
        if (!error) {
          success = true;
          break;
        }
        console.warn(`Submit attempt ${attempt} failed:`, error);
      } catch (e) {
        console.error(`Submit attempt ${attempt} exception:`, e);
      }
      
      if (attempt < 3) {
        // 재시도 전 대기 (1초, 2초)
        await new Promise(res => setTimeout(res, attempt * 1000));
      }
    }
  } finally {
    pendingSaves--;
  }
  
  return success;
}
