export default function SummaryCards({ responses }: { responses: any[] }) {
  // 테스트 데이터 제외 (실제 데이터만 계산)
  const validResponses = responses.filter(r => !r.is_test);

  const totalScans = validResponses.length;
  const completedResponses = validResponses.filter(r => r.is_complete).length;
  const completionRate = totalScans > 0 ? Math.round((completedResponses / totalScans) * 100) : 0;

  // 평균 소요 시간 (완료된 응답 기준)
  const completedWithDuration = validResponses.filter(r => r.is_complete && typeof r.duration_seconds === 'number');
  const avgDurationSeconds = completedWithDuration.length > 0
    ? Math.round(completedWithDuration.reduce((acc, r) => acc + r.duration_seconds, 0) / completedWithDuration.length)
    : 0;
  
  const avgMinutes = Math.floor(avgDurationSeconds / 60);
  const avgSeconds = avgDurationSeconds % 60;
  const avgDurationText = `${avgMinutes}분 ${avgSeconds}초`;

  // 오늘 수집 건수 (KST 기준)
  const today = new Date();
  today.setHours(today.getHours() + 9); // 한국 시간 변환
  const todayString = today.toISOString().split('T')[0];
  
  const todayCount = validResponses.filter(r => {
    if (!r.scan_at) return false;
    const scanDate = new Date(r.scan_at);
    scanDate.setHours(scanDate.getHours() + 9); // 한국 시간 변환
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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
        <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-2">총 스캔 수 (유효)</h3>
        <p className="text-3xl font-bold text-gray-900">{totalScans}</p>
      </div>
      <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
        <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-2">완료 응답 수</h3>
        <p className="text-3xl font-bold text-gray-900">{completedResponses}</p>
      </div>
      <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
        <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-2">완료율</h3>
        <p className="text-3xl font-bold text-gray-900">{completionRate}<span className="text-lg text-gray-400 ml-1">%</span></p>
      </div>
      <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
        <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-2">평균 소요 시간</h3>
        <p className="text-3xl font-bold text-gray-900">{avgMinutes}<span className="text-lg text-gray-400 mx-1">분</span>{avgSeconds}<span className="text-lg text-gray-400 ml-1">초</span></p>
      </div>
      <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-blue-100 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
        <h3 className="text-[13px] font-semibold text-blue-600 uppercase tracking-wider mb-2 relative z-10">오늘 수집 건수</h3>
        <p className="text-3xl font-bold text-blue-600 relative z-10">{todayCount}</p>
      </div>
      <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-red-100 flex flex-col justify-between relative overflow-hidden col-span-2 lg:col-span-1">
        <h3 className="text-[13px] font-semibold text-red-500 uppercase tracking-wider mb-2">중도 이탈 구간 1위</h3>
        <p className="text-3xl font-bold text-gray-900">{topDropoffSection} <span className="text-sm font-medium text-gray-400">({topDropoffCount}건)</span></p>
      </div>
      <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border-l-4 border-l-purple-500 flex flex-col justify-between col-span-2 lg:col-span-1">
        <h3 className="text-[13px] font-semibold text-purple-600 uppercase tracking-wider mb-2">언어 불일치 (A4≠E3)</h3>
        <p className="text-3xl font-bold text-gray-900">{mismatchRate}<span className="text-lg text-gray-400 mx-1">%</span> <span className="text-sm font-medium text-gray-400">({mismatchCount}명)</span></p>
      </div>
    </div>
  );
}
