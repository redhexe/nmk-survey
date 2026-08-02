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

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div className="bg-white p-4 rounded shadow border border-gray-100">
        <h3 className="text-sm text-gray-500 mb-1">총 스캔 수 (유효)</h3>
        <p className="text-2xl font-bold">{totalScans}</p>
      </div>
      <div className="bg-white p-4 rounded shadow border border-gray-100">
        <h3 className="text-sm text-gray-500 mb-1">완료 응답 수</h3>
        <p className="text-2xl font-bold">{completedResponses}</p>
      </div>
      <div className="bg-white p-4 rounded shadow border border-gray-100">
        <h3 className="text-sm text-gray-500 mb-1">완료율</h3>
        <p className="text-2xl font-bold">{completionRate}%</p>
      </div>
      <div className="bg-white p-4 rounded shadow border border-gray-100">
        <h3 className="text-sm text-gray-500 mb-1">평균 소요 시간</h3>
        <p className="text-2xl font-bold">{avgDurationText}</p>
      </div>
      <div className="bg-white p-4 rounded shadow border border-gray-100">
        <h3 className="text-sm text-gray-500 mb-1">오늘 수집 건수</h3>
        <p className="text-2xl font-bold text-blue-600">{todayCount}</p>
      </div>
    </div>
  );
}
