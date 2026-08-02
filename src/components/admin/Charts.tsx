'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Charts({ responses }: { responses: any[] }) {
  const validResponses = responses.filter(r => !r.is_test && r.is_complete);

  if (validResponses.length === 0) {
    return <div className="p-12 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">통계를 표시할 유효한 완료 응답이 없습니다.</div>;
  }

  // 1. C1 체감 대기 시간 분포
  const c1Counts = [1, 2, 3, 4, 5].map(score => ({
    score: String(score),
    count: validResponses.filter(r => r.c1_perceived_wait === score).length
  }));

  // 2. C4 8문항 평균
  const c4Avg = Array.from({ length: 8 }, (_, i) => {
    const key = `c4_${i + 1}` as keyof typeof validResponses[0];
    const answered = validResponses.filter(r => typeof r[key] === 'number');
    const avg = answered.length > 0 
      ? answered.reduce((acc, r) => acc + (r[key] as number), 0) / answered.length 
      : 0;
    return { item: `C4-${i + 1}`, avg: Number(avg.toFixed(2)) };
  });

  // 3. D1 3문항 평균
  const d1Avg = Array.from({ length: 3 }, (_, i) => {
    const key = `d1_${i + 1}` as keyof typeof validResponses[0];
    const answered = validResponses.filter(r => typeof r[key] === 'number');
    const avg = answered.length > 0 
      ? answered.reduce((acc, r) => acc + (r[key] as number), 0) / answered.length 
      : 0;
    return { item: `D1-${i + 1}`, avg: Number(avg.toFixed(2)) };
  });

  // 4. C3 가장 불편했던 구간
  const c3Options = [
    "Walking from the subway station to the museum",
    "The outdoor plaza and stairs in front of the museum",
    "The outdoor queue in front of the building",
    "The bag security check line",
    "The long indoor corridor before the exhibition halls",
    "Nothing felt particularly uncomfortable"
  ];
  const c3Counts = c3Options.map(opt => ({
    section: opt.substring(0, 15) + '...',
    count: validResponses.filter(r => r.c3_worst_section === opt).length
  }));

  // 7. A4(평소 언어) vs E3(안내 이해 언어) 불일치 비율
  const mismatchCount = validResponses.filter(r => {
    if (!r.a4_language || !r.e3_signage_language) return false;
    if (r.e3_signage_language === 'None of these (there was no guidance in my language)') return true;
    return r.a4_language !== r.e3_signage_language;
  }).length;
  const mismatchRate = Math.round((mismatchCount / validResponses.length) * 100);

  // 8. E1 "짐 때문에 휴대폰" 비율
  const hardToUsePhoneCount = validResponses.filter(r => 
    r.e1_activities && Array.isArray(r.e1_activities) && r.e1_activities.includes("It was hard to use my phone because of my bags or belongings")
  ).length;
  const hardToUsePhoneRate = Math.round((hardToUsePhoneCount / validResponses.length) * 100);

  // 9. 교차표 1: C1(체감) vs C5(자기보고 시간)
  // C5 옵션들
  const c5Options = [
    "Less than 5 minutes", "5–10 minutes", "10–20 minutes", 
    "20–30 minutes", "More than 30 minutes"
  ];
  const crossTab1 = c5Options.map(time => {
    const group = validResponses.filter(r => r.c5_estimated_wait === time);
    const counts = [1, 2, 3, 4, 5].map(score => group.filter(r => r.c1_perceived_wait === score).length);
    return {
      time: time.replace(' minutes', 'm').replace('Less than', '<'),
      'Score 1': counts[0], 'Score 2': counts[1], 'Score 3': counts[2], 'Score 4': counts[3], 'Score 5': counts[4]
    };
  });

  // 10. 교차표 2: B5(소지품) vs E1("짐 때문에 휴대폰 보기 어려움")
  const b5Options = ["No bag", "Small bag (backpack, handbag, etc.)", "Large bag or luggage"];
  const crossTab2 = b5Options.map(bag => {
    const group = validResponses.filter(r => r.b5_baggage === bag);
    const hardCount = group.filter(r => r.e1_activities?.includes("It was hard to use my phone because of my bags or belongings")).length;
    return {
      bag: bag.split(' ')[0],
      hard: hardCount,
      not_hard: group.length - hardCount
    };
  });

  return (
    <div className="space-y-6">
      {/* 핵심 지표 하이라이트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">A4 vs E3 언어 불일치 (안내 사각지대)</h3>
            <span className="p-2 bg-red-50 text-red-500 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </span>
          </div>
          <p className="text-4xl font-black text-gray-900">{mismatchRate}<span className="text-xl text-gray-400 font-bold ml-1">%</span> <span className="text-sm font-medium text-gray-400 ml-2">({mismatchCount}명)</span></p>
          <p className="text-xs text-gray-400 mt-3">평소 사용하는 언어와 박물관 안내 언어가 다른 비율</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">E1 짐 때문에 스마트폰 사용 제약</h3>
            <span className="p-2 bg-orange-50 text-orange-500 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </span>
          </div>
          <p className="text-4xl font-black text-gray-900">{hardToUsePhoneRate}<span className="text-xl text-gray-400 font-bold ml-1">%</span> <span className="text-sm font-medium text-gray-400 ml-2">({hardToUsePhoneCount}명)</span></p>
          <p className="text-xs text-gray-400 mt-3">대기 중 짐 때문에 휴대폰을 보기 어려웠다고 응답한 비율</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 h-80 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 mb-6">C1 체감 대기 시간 분포 (1~5)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={c1Counts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="score" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cross Tab 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 h-80 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 mb-6">C5(자기보고) vs C1(체감) 교차표</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crossTab1} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis dataKey="time" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px', color: '#6b7280', paddingTop: '10px'}} />
                <Bar dataKey="Score 1" stackId="a" fill="#bfdbfe" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Score 2" stackId="a" fill="#93c5fd" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Score 3" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Score 4" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Score 5" stackId="a" fill="#1d4ed8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 & 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 h-80 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 mb-6">C4 / D1 하위문항 평균 (1~5)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...c4Avg, ...d1Avg]} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" domain={[0, 5]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis dataKey="item" type="category" width={50} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="avg" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cross Tab 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 h-80 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 mb-6">B5(소지품) vs 스마트폰 사용 제약</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crossTab2} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="bag" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px', color: '#6b7280', paddingTop: '10px'}} />
                <Bar dataKey="hard" name="제약 있음" stackId="a" fill="#f97316" barSize={40} />
                <Bar dataKey="not_hard" name="제약 없음" stackId="a" fill="#e5e7eb" barSize={40} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
