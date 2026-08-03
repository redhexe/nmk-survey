import { Scan, CheckCircle2, Percent, Clock, CalendarDays, AlertTriangle, Languages } from 'lucide-react';

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
      {/* 1. 총 스캔 수 (Blue Card) */}
      <div className="bg-[#4338ca] text-white p-6 rounded-[24px] shadow-md flex flex-col justify-between hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-white text-[#4338ca] p-2.5 rounded-2xl">
            <Scan className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="bg-[#4f46e5] text-indigo-100 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-400/30">Total</span>
        </div>
        <div>
          <p className="text-3xl font-bold mb-1">{totalConsents}</p>
          <p className="text-[13px] font-medium text-indigo-200">동의 응답 수</p>
        </div>
      </div>

      {/* 2. 완료 응답 수 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col justify-between border border-gray-100 hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl">
            <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{completedResponses}</p>
          <p className="text-[13px] font-medium text-gray-500">완료 응답 수</p>
        </div>
      </div>

      {/* 3. 완료율 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col justify-between border border-gray-100 hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl">
            <Percent className="w-5 h-5" strokeWidth={2.5} />
          </div>
          {completionRate > 80 && <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full">+Good</span>}
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{completionRate}<span className="text-lg text-gray-400 ml-0.5">%</span></p>
          <p className="text-[13px] font-medium text-gray-500">완료율</p>
        </div>
      </div>

      {/* 4. 평균 소요 시간 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col justify-between border border-gray-100 hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-amber-50 text-amber-600 p-2.5 rounded-2xl">
            <Clock className="w-5 h-5" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{avgMinutes}<span className="text-base text-gray-400 mx-0.5">m</span> {avgSeconds}<span className="text-base text-gray-400 ml-0.5">s</span></p>
          <p className="text-[13px] font-medium text-gray-500">평균 소요 시간</p>
        </div>
      </div>

      {/* 5. 오늘 수집 건수 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col justify-between border border-gray-100 hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-sky-50 text-sky-600 p-2.5 rounded-2xl">
            <CalendarDays className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="bg-sky-50 text-sky-600 text-xs font-bold px-2.5 py-1 rounded-full">Today</span>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{todayCount}</p>
          <p className="text-[13px] font-medium text-gray-500">오늘 수집 건수</p>
        </div>
      </div>

      {/* 6. 중도 이탈 1위 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col justify-between border border-gray-100 hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-red-50 text-red-500 p-2.5 rounded-2xl">
            <AlertTriangle className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="bg-red-50 text-red-500 text-xs font-bold px-2.5 py-1 rounded-full">Drop-off</span>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{topDropoffSection} <span className="text-sm font-medium text-gray-400 ml-1">({topDropoffCount}건)</span></p>
          <p className="text-[13px] font-medium text-gray-500">중도 이탈 구간 1위</p>
        </div>
      </div>

      {/* 7. 언어 불일치 */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col justify-between border border-gray-100 hover:-translate-y-1 transition-transform col-span-2 md:col-span-1">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-purple-50 text-purple-600 p-2.5 rounded-2xl">
            <Languages className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="bg-purple-50 text-purple-600 text-xs font-bold px-2.5 py-1 rounded-full">Mismatch</span>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{mismatchRate}<span className="text-lg text-gray-400 mx-0.5">%</span> <span className="text-sm font-medium text-gray-400 ml-1">({mismatchCount}명)</span></p>
          <p className="text-[13px] font-medium text-gray-500">언어 불일치 비율 (A4≠E3)</p>
        </div>
      </div>
    </div>
  );
}
