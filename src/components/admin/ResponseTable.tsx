'use client';
import React, { useState, useRef } from 'react';
import isoCountries from 'i18n-iso-countries';
import koCountries from 'i18n-iso-countries/langs/ko.json';

isoCountries.registerLocale(koCountries);

const getKoreanCountryName = (code: string) => {
  if (!code) return '-';
  const name = isoCountries.getName(code, 'ko');
  return name || code;
};

const getKoreanLanguageName = (lang: string) => {
  const map: Record<string, string> = {
    'English': '영어',
    'Chinese': '중국어',
    'Japanese': '일본어',
    'Korean': '한국어',
    'Spanish': '스페인어',
    'French': '프랑스어',
    'None of these (there was no guidance in my language)': '지원 안됨'
  };
  return map[lang] || lang;
};

const toKST = (utcStr: string | null | undefined): string => {
  if (!utcStr) return '-';
  return new Date(utcStr).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export default function ResponseTable({ responses }: { responses: any[] }) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const tableRef = useRef<HTMLDivElement>(null);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const totalPages = Math.ceil(responses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResponses = responses.slice(startIndex, startIndex + itemsPerPage);

  const langMap: Record<string, string> = {
    en: '🇬🇧 English',
    es: '🇪🇸 Español',
    zh: '🇨🇳 中文',
    ja: '🇯🇵 日本語',
    fr: '🇫🇷 Français'
  };

  // 유효성 검사 함수
  const getValidityTags = (r: any) => {
    const tags = [];
    if (r.is_test) tags.push({ label: '테스트 데이터', color: 'bg-gray-500' });
    
    // 미시작 검사 (빈 껍데기)
    if (r.language === null && (!r.section_timestamps || Object.keys(r.section_timestamps).length === 0)) {
      tags.push({ label: '미시작', color: 'bg-gray-400' });
    }
    
    // 장시간 / 단시간
    if (typeof r.duration_seconds === 'number') {
      if (r.duration_seconds > 5400) tags.push({ label: '장시간(90분+)', color: 'bg-yellow-500' });
      if (r.duration_seconds < 120) tags.push({ label: '단시간(2분-)', color: 'bg-yellow-500' });
    }

    // 제출 실패 의심
    if (!r.is_complete && r.section_timestamps && r.section_timestamps['F']) {
      tags.push({ label: '제출 실패 의심', color: 'bg-red-500' });
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
    <div className="bg-white rounded-[24px] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">생성 일시</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">소요 시간(초)</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">진행 상태</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">최종 도달</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">설문 언어</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">국적</th>
              <th 
                className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-dashed border-gray-400"
              >
                언어 사용 (평소 → 관람 시)
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">유효성 태그</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">세부 보기</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {currentResponses.map((r) => {
              const tags = getValidityTags(r);
              const isExpanded = expandedRow === r.id;
              
              let lastSection = '-';
              if (!r.is_complete && r.section_timestamps) {
                const keys = Object.keys(r.section_timestamps).filter(k => r.section_timestamps[k]);
                if (keys.length > 0) {
                  keys.sort((a, b) => new Date(r.section_timestamps[b]).getTime() - new Date(r.section_timestamps[a]).getTime());
                  lastSection = keys[0];
                }
              } else if (r.is_complete) {
                lastSection = '완료(F)';
              }

              return (
                <React.Fragment key={r.id}>
                  <tr className={`hover:bg-blue-50/30 transition-colors ${r.is_test ? 'bg-gray-50/50 opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      <div>{toKST(r.created_at)}</div>
                      {r.scan_at && <div className="text-[10px] text-gray-400 mt-0.5">입장: {toKST(r.scan_at)}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {r.duration_seconds ? (
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs whitespace-nowrap">
                          {Math.floor(r.duration_seconds / 60) > 0 ? `${Math.floor(r.duration_seconds / 60)}분 ` : ''}
                          {r.duration_seconds % 60}초
                        </span>
                      ) : <span className="text-gray-300">-</span>}
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
                    <td className="px-6 py-4">
                      {lastSection !== '-' ? <span className="font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs">{lastSection}</span> : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 font-semibold text-xs tracking-wider">
                        {r.language ? langMap[r.language.toLowerCase()] || r.language.toUpperCase() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-600">
                      {getKoreanCountryName(r.a1_country)}
                    </td>
                    <td className="px-6 py-4 text-center text-xs">
                      {r.a4_language && r.e3_signage_language ? (
                        (() => {
                          const a4Ko = getKoreanLanguageName(r.a4_language);
                          const e3Ko = getKoreanLanguageName(r.e3_signage_language);
                          const isMismatch = r.e3_signage_language === 'None of these (there was no guidance in my language)' || r.a4_language !== r.e3_signage_language;
                          return (
                            <span className={`font-bold ${isMismatch ? 'text-red-500' : 'text-green-500'}`}>
                              {a4Ko} → {e3Ko}
                            </span>
                          );
                        })()
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
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
                      <td colSpan={9} className="px-6 py-6">
                        <div className="text-xs text-gray-500 mb-3 flex gap-6">
                          <div><span className="font-semibold text-gray-600">QR 스캔:</span> {toKST(r.scan_at)}</div>
                          <div><span className="font-semibold text-gray-600">제출 완료:</span> {toKST(r.submitted_at)}</div>
                          <div><span className="font-semibold text-gray-600">생성(UTC→KST):</span> {toKST(r.created_at)}</div>
                        </div>
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
                <td colSpan={9} className="px-6 py-16 text-center text-gray-400 font-medium">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-2">
          <button 
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {'< 이전'}
          </button>
          
          {(() => {
            const pages = [];
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
              } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
              } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
              }
            }
            return pages.map((page, i) => 
              typeof page === 'number' ? (
                <button
                  key={i}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              ) : (
                <span key={i} className="px-1 text-gray-400">...</span>
              )
            );
          })()}
          
          <button 
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {'다음 >'}
          </button>
        </div>
      )}
    </div>
  );
}
