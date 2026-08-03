import { Scan, CheckCircle2, Percent, Clock, CalendarDays, AlertTriangle, Search } from 'lucide-react';

export default function SummaryCards({ responses }: { responses: any[] }) {
  // 테스트 데이터 제외 (실제 데이터만 계산)
  const validResponses = responses.filter(r => !r.is_test);
  // 미시작 제외 (language가 없고 section_timestamps가 비어있는 경우)
  const consentedResponses = validResponses.filter(r => !(r.language === null && (!r.section_timestamps || Object.keys(r.section_timestamps).length === 0)));

  const totalConsents = consentedResponses.length;
  const completedResponses = consentedResponses.filter(r => r.is_complete).length;
  const completionRate = totalConsents > 0 ? Math.round((completedResponses / totalConsents) * 100) : 0;

  // 평균 소요 시간 (완료된 응답 기준)
  const completedWithDuration = validResponses.filter(r => r.is_complete && typeof r.duration_seconds === 'number');
  const avgDurationSeconds = completedWithDuration.length > 0
    ? Math.round(completedWithDuration.reduce((acc, r) => acc + r.duration_seconds, 0) / completedWithDuration.length)
    : 0;
  
  const avgMinutes = Math.floor(avgDurationSeconds / 60);
  const avgSeconds = avgDurationSeconds % 60;

  // 오늘 수집 건수 (KST 기준)
  const today = new Date();
  today.setHours(today.getHours() + 9);
  const todayString = today.toISOString().split('T')[0];
  
  const todayCount = validResponses.filter(r => {
    if (!r.scan_at) return false;
    const scanDate = new Date(r.scan_at);
    scanDate.setHours(scanDate.getHours() + 9);
    return scanDate.toISOString().split('T')[0] === todayString;
  }).length;

  // 중도 이탈 구간 TOP 1
  const incompleteResponses = validResponses.filter(r => !r.is_complete && r.section_timestamps);
  const dropoffCounts: Record<string, number> = {};
  incompleteResponses.forEach(r => {
    const timestamps = r.section_timestamps as Record<string, string>;
    const keys = Object.keys(timestamps).filter(k => timestamps[k]);
    if (keys.length > 0) {
      keys.sort((a, b) => new Date(timestamps[b]).getTime() - new Date(timestamps[a]).getTime());
      const lastSection = keys[0];
      dropoffCounts[lastSection] = (dropoffCounts[lastSection] || 0) + 1;
    }
  });
  let topDropoffSection = '-';
  let topDropoffCount = 0;
  Object.entries(dropoffCounts).forEach(([section, count]) => {
    if (count > topDropoffCount) {
      topDropoffCount = count;
      topDropoffSection = `섹션 ${section}`;
    }
  });

  // A4 vs E3 언어 불일치 비율
  const completedValid = validResponses.filter(r => r.is_complete);
  const mismatchCount = completedValid.filter(r => {
    if (!r.a4_language || !r.e3_signage_language) return false;
    if (r.e3_signage_language === 'None of these (there was no guidance in my language)') return true;
    return r.a4_language !== r.e3_signage_language;
  }).length;
  const mismatchRate = completedValid.length > 0 ? Math.round((mismatchCount / completedValid.length) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {/* 1. 동의 응답 수 */}
      <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_24px_rgba(49,130,246,0.06)] flex flex-col justify-between border border-[#e8f3ff] hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-[#e8f3ff] text-[#3182f6] p-2.5 rounded-2xl">
            <Scan className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="bg-[#e8f3ff] text-[#3182f6] text-xs font-bold px-2.5 py-1 rounded-full">Total</span>
        </div>
        <div>
          <p className="text-3xl font-extrabold text-[#191f28] mb-1">{totalConsents}</p>
          <p className="text-[13px] font-semibold text-[#8b95a1]">동의 응답 수</p>
        </div>
      </div>

      {/* 2. 완료 응답 수 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col justify-between border border-[#f2f4f6] hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-[#f2f4f6] text-[#3182f6] p-2.5 rounded-2xl">
            <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#191f28] mb-1">{completedResponses}</p>
          <p className="text-[13px] font-medium text-[#8b95a1]">완료 응답 수</p>
        </div>
      </div>

      {/* 3. 완료율 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col justify-between border border-[#f2f4f6] hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-[#f2f4f6] text-[#3182f6] p-2.5 rounded-2xl">
            <Percent className="w-5 h-5" strokeWidth={2.5} />
          </div>
          {completionRate > 80 && <span className="bg-[#e8f3ff] text-[#3182f6] text-xs font-bold px-2.5 py-1 rounded-full">+Good</span>}
        </div>
        <div>
          <p className="text-3xl font-bold text-[#191f28] mb-1">{completionRate}<span className="text-lg text-[#8b95a1] ml-0.5">%</span></p>
          <p className="text-[13px] font-medium text-[#8b95a1]">완료율</p>
        </div>
      </div>

      {/* 4. 평균 소요 시간 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col justify-between border border-[#f2f4f6] hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-[#f2f4f6] text-[#3182f6] p-2.5 rounded-2xl">
            <Clock className="w-5 h-5" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#191f28] mb-1">{avgMinutes}<span className="text-base text-[#8b95a1] mx-0.5">m</span> {avgSeconds}<span className="text-base text-[#8b95a1] ml-0.5">s</span></p>
          <p className="text-[13px] font-medium text-[#8b95a1]">평균 소요 시간</p>
        </div>
      </div>

      {/* 5. 오늘 수집 건수 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col justify-between border border-[#f2f4f6] hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-[#f2f4f6] text-[#3182f6] p-2.5 rounded-2xl">
            <CalendarDays className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="bg-[#f2f4f6] text-[#8b95a1] text-xs font-bold px-2.5 py-1 rounded-full">Today</span>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#191f28] mb-1">{todayCount}</p>
          <p className="text-[13px] font-medium text-[#8b95a1]">오늘 수집 건수</p>
        </div>
      </div>

      {/* 6. 중도 이탈 1위 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col justify-between border border-[#f2f4f6] hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-[#f2f4f6] text-[#e53e3e] p-2.5 rounded-2xl">
            <AlertTriangle className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="bg-[#f2f4f6] text-[#e53e3e] text-xs font-bold px-2.5 py-1 rounded-full">Drop-off</span>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#191f28] mb-1">{topDropoffSection} <span className="text-sm font-medium text-[#8b95a1] ml-1">({topDropoffCount}건)</span></p>
          <p className="text-[13px] font-medium text-[#8b95a1]">중도 이탈 구간 1위</p>
        </div>
      </div>

      {/* 7. 언어 불일치 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col justify-between border border-[#f2f4f6] hover:-translate-y-1 transition-transform col-span-2 md:col-span-1">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-[#f2f4f6] text-[#3182f6] p-2.5 rounded-2xl">
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="bg-[#f2f4f6] text-[#8b95a1] text-xs font-bold px-2.5 py-1 rounded-full">Mismatch</span>
        </div>
        <div>
          <p className="text-3xl font-bold text-[#191f28] mb-1">{mismatchRate}<span className="text-lg text-[#8b95a1] mx-0.5">%</span> <span className="text-sm font-medium text-[#8b95a1] ml-1">({mismatchCount}명)</span></p>
          <div className="group relative inline-block">
            <p className="text-[13px] font-medium text-[#8b95a1] border-b border-dashed border-[#8b95a1] cursor-help">정보접근 불일치율</p>
            <div className="absolute bottom-full left-0 mb-2 hidden w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg group-hover:block z-10">
              평소 언어(A4) ≠ 금번 방문 시 안내를 받을 언어(E3)인 응답 비율
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
