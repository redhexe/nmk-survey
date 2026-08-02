'use client';
import React, { useState } from 'react';

export default function ResponseTable({ responses }: { responses: any[] }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // 유효성 검사 함수
  const getValidityTags = (r: any) => {
    const tags = [];
    if (r.is_test) tags.push({ label: '테스트 데이터', color: 'bg-gray-500' });
    
    // 장시간 / 단시간
    if (typeof r.duration_seconds === 'number') {
      if (r.duration_seconds > 5400) tags.push({ label: '장시간(90분+)', color: 'bg-yellow-500' });
      if (r.duration_seconds < 120) tags.push({ label: '단시간(2분-)', color: 'bg-yellow-500' });
    }

    // 일괄 응답 검사 (C4)
    let c4Valid = false;
    let firstC4 = null;
    let allSameC4 = true;
    for (let i = 1; i <= 8; i++) {
      const val = r[`c4_${i}`];
      if (typeof val === 'number') {
        c4Valid = true;
        if (firstC4 === null) firstC4 = val;
        else if (firstC4 !== val) allSameC4 = false;
      } else {
        allSameC4 = false; // 하나라도 없으면 일괄응답 아님
      }
    }
    if (c4Valid && allSameC4) tags.push({ label: 'C4 일괄응답', color: 'bg-yellow-500' });

    // 일괄 응답 검사 (D1)
    let d1Valid = false;
    let firstD1 = null;
    let allSameD1 = true;
    for (let i = 1; i <= 3; i++) {
      const val = r[`d1_${i}`];
      if (typeof val === 'number') {
        d1Valid = true;
        if (firstD1 === null) firstD1 = val;
        else if (firstD1 !== val) allSameD1 = false;
      } else {
        allSameD1 = false;
      }
    }
    if (d1Valid && allSameD1) tags.push({ label: 'D1 일괄응답', color: 'bg-yellow-500' });

    if (tags.length === 0 && r.is_complete && !r.is_test) {
      tags.push({ label: '정상', color: 'bg-green-500' });
    }

    return tags;
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">생성 일시</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">소요 시간(초)</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">진행 상태</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">선택 언어</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">유효성 태그</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">세부 보기</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {responses.map((r) => {
              const tags = getValidityTags(r);
              const isExpanded = expandedRow === r.id;
              
              return (
                <React.Fragment key={r.id}>
                  <tr className={`hover:bg-blue-50/30 transition-colors ${r.is_test ? 'bg-gray-50/50 opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {new Date(r.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {r.duration_seconds ? <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">{r.duration_seconds}s</span> : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-6 py-4">
                      {r.is_complete ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded-md">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          완료
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-400 font-medium text-xs bg-gray-50 px-2 py-1 rounded-md">
                          진행 중
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 uppercase text-gray-600 font-semibold text-xs tracking-wider">
                      {r.language || '-'}
                    </td>
                    <td className="px-6 py-4 flex gap-1.5 flex-wrap">
                      {tags.map((tag, i) => (
                        <span key={i} className={`${tag.color} text-white px-2 py-1 rounded-md text-[11px] font-bold shadow-sm`}>
                          {tag.label}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setExpandedRow(isExpanded ? null : r.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {isExpanded ? '닫기' : '상세보기'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <td colSpan={6} className="px-6 py-6">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-4 rounded-xl border border-gray-200 overflow-x-auto shadow-inner">
                          {JSON.stringify(r, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {responses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400 font-medium">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
