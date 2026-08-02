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
    <div className="bg-white rounded shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">생성 일시</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">소요 시간(초)</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">진행 상태</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">선택 언어</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">유효성 태그</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">세부 보기</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {responses.map((r) => {
            const tags = getValidityTags(r);
            const isExpanded = expandedRow === r.id;
            
            return (
              <React.Fragment key={r.id}>
                <tr className={`hover:bg-gray-50 ${r.is_test ? 'bg-gray-100 opacity-70' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">{r.duration_seconds || '-'}</td>
                  <td className="px-4 py-3">
                    {r.is_complete ? (
                      <span className="text-green-600 font-medium">완료</span>
                    ) : (
                      <span className="text-gray-400">진행 중</span>
                    )}
                  </td>
                  <td className="px-4 py-3 uppercase">{r.language || '-'}</td>
                  <td className="px-4 py-3 flex gap-1 flex-wrap">
                    {tags.map((tag, i) => (
                      <span key={i} className={`${tag.color} text-white px-2 py-0.5 rounded text-xs font-bold`}>
                        {tag.label}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setExpandedRow(isExpanded ? null : r.id)}
                      className="text-blue-600 hover:underline"
                    >
                      {isExpanded ? '닫기' : '보기'}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-6 py-4">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
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
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
