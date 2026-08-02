'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export default function Charts({ responses }: { responses: any[] }) {
  const validResponses = responses.filter(r => !r.is_test && r.is_complete);
  const isEmpty = validResponses.length === 0;

  const EmptyState = () => (
    <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 mt-2">
      <p className="text-gray-400 text-sm font-medium">응답 데이터가 없습니다</p>
    </div>
  );

  // 1. D2 기대 변화 분포 (새로 추가, 가장 첫번째)
  const d2Options = [
    "It made me expect more from the exhibition",
    "It didn't affect my expectations",
    "It made me expect less from the exhibition"
  ];
  const d2Counts = isEmpty ? [] : d2Options.map(opt => ({
    name: opt.includes("expect more") ? "기대 커짐" : opt.includes("didn't affect") ? "변화 없음" : "기대 줄었음",
    count: validResponses.filter(r => r.d2_expectation_change === opt).length
  }));

  // 2. C1 체감 대기 시간 분포
  const c1Counts = isEmpty ? [] : [1, 2, 3, 4, 5].map(score => ({
    score: String(score),
    count: validResponses.filter(r => r.c1_perceived_wait === score).length
  }));

  // 3. E1 응답 분포 (짐/리플릿 강조)
  const e1Options = [
    "I checked my smartphone (SNS, messages, web surfing, etc.)",
    "I took photos or videos of the surroundings",
    "I picked up a map/leaflet at the entrance",
    "I read the exhibition information on the wall/screen",
    "I talked with my companions",
    "I just waited without doing anything in particular",
    "It was hard to use my phone because of my bags or belongings",
    "I used the restroom or amenities"
  ];
  const e1Counts = isEmpty ? [] : e1Options.map(opt => ({
    name: opt.substring(0, 20) + '...',
    full: opt,
    count: validResponses.filter(r => r.e1_activities?.includes(opt)).length,
    isHighlighted: opt.includes("bags or belongings") || opt.includes("map/leaflet")
  })).sort((a, b) => b.count - a.count);

  // 4. B2 재방문 여부
  const b2Counts = isEmpty ? [] : [
    { name: '첫 방문', count: validResponses.filter(r => r.b2_is_first_visit === "Yes, this is my first time").length },
    { name: '재방문', count: validResponses.filter(r => r.b2_is_first_visit === "No, I have been here before").length }
  ];

  // 5. C4 / D1 평균
  const c4Avg = isEmpty ? [] : Array.from({ length: 8 }, (_, i) => {
    const key = `c4_${i + 1}` as keyof typeof validResponses[0];
    const answered = validResponses.filter(r => typeof r[key] === 'number');
    const avg = answered.length > 0 ? answered.reduce((acc, r) => acc + (r[key] as number), 0) / answered.length : 0;
    return { item: `C4-${i + 1}`, avg: Number(avg.toFixed(2)) };
  });
  const d1Avg = isEmpty ? [] : Array.from({ length: 3 }, (_, i) => {
    const key = `d1_${i + 1}` as keyof typeof validResponses[0];
    const answered = validResponses.filter(r => typeof r[key] === 'number');
    const avg = answered.length > 0 ? answered.reduce((acc, r) => acc + (r[key] as number), 0) / answered.length : 0;
    return { item: `D1-${i + 1}`, avg: Number(avg.toFixed(2)) };
  });

  // 6. 교차표 1: C1(체감) vs C5(자기보고)
  const c5Options = ["Less than 5 minutes", "5–10 minutes", "10–20 minutes", "20–30 minutes", "More than 30 minutes"];
  const crossTab1 = isEmpty ? [] : c5Options.map(time => {
    const group = validResponses.filter(r => r.c5_estimated_wait === time);
    const counts = [1, 2, 3, 4, 5].map(score => group.filter(r => r.c1_perceived_wait === score).length);
    return {
      time: time.replace(' minutes', 'm').replace('Less than', '<'),
      'Score 1': counts[0], 'Score 2': counts[1], 'Score 3': counts[2], 'Score 4': counts[3], 'Score 5': counts[4]
    };
  });

  // 7. A4 vs E3 교차 불일치 테이블
  const mismatches = isEmpty ? [] : validResponses.filter(r => {
    if (!r.a4_language || !r.e3_signage_language) return false;
    if (r.e3_signage_language === 'None of these (there was no guidance in my language)') return true;
    return r.a4_language !== r.e3_signage_language;
  }).reduce((acc: Record<string, number>, r) => {
    const key = `${r.a4_language} -> ${r.e3_signage_language}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const mismatchList = Object.entries(mismatches).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* 1열: 가장 중요한 D2 문항 크게 */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 h-96 flex flex-col">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">D2 기다린 시간이 기대에 영향을 주었습니까?</h3>
        {isEmpty ? <EmptyState /> : (
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d2Counts} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* E1 활동 분포 */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 h-[400px] flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">E1 대기 중 주요 활동 (짐/안내도 강조)</h3>
          {isEmpty ? <EmptyState /> : (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={e1Counts} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis dataKey="name" type="category" width={140} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {e1Counts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isHighlighted ? '#f97316' : '#93c5fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* A4 vs E3 교차 불일치 */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 h-[400px] flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">A4 vs E3 언어 불일치 케이스</h3>
          {isEmpty ? <EmptyState /> : (
            <div className="flex-1 min-h-0 overflow-auto">
              {mismatchList.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-400 text-sm">불일치 케이스가 없습니다.</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-4 py-2 rounded-l-lg">평소 언어 (A4)</th>
                      <th className="px-4 py-2">안내 이해 (E3)</th>
                      <th className="px-4 py-2 rounded-r-lg text-right">인원 수</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mismatchList.map(([key, count], i) => {
                      const [a4, e3] = key.split(' -> ');
                      return (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-800">{a4}</td>
                          <td className="px-4 py-3 text-red-500">{e3 === 'None of these (there was no guidance in my language)' ? '지원 안됨' : e3}</td>
                          <td className="px-4 py-3 text-right font-bold">{count}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* B2 재방문 */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 h-80 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">B2 재방문 여부</h3>
          {isEmpty ? <EmptyState /> : (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={b2Counts} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                    {b2Counts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#10b981'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* C1 분포 */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 h-80 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">C1 체감 대기 시간 분포</h3>
          {isEmpty ? <EmptyState /> : (
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
          )}
        </div>

        {/* C5 vs C1 */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 h-80 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">C5(자기보고) vs C1(체감) 교차표</h3>
          {isEmpty ? <EmptyState /> : (
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
          )}
        </div>

        {/* C4 / D1 */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 h-80 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">C4 / D1 하위문항 평균 (1~5)</h3>
          {isEmpty ? <EmptyState /> : (
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
          )}
        </div>
      </div>
    </div>
  );
}
