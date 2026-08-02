export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert("내보낼 데이터가 없습니다.");
    return;
  }

  // PRD 3-1절 테이블 순서대로 헤더 정의
  const headers = [
    'id', 'session_id', 'scan_at', 'submitted_at', 'duration_seconds',
    'is_complete', 'language', 'consent', 'a1_country', 'a2_age',
    'a3_gender', 'a4_language', 'a4_language_other', 'b1_purpose', 'b2_first_visit',
    'b3_group_size', 'b4_prior_search', 'b5_baggage', 'c1_perceived_wait', 'c2_feelings',
    'c3_worst_section', 'c5_estimated_wait', 'c4_1', 'c4_2', 'c4_3',
    'c4_4', 'c4_5', 'c4_6', 'c4_7', 'c4_8',
    'd1_1', 'd1_2', 'd1_3', 'd2_expectation_change', 'e1_activities',
    'e2_phone_content', 'e3_signage_language', 'e4_difficulties', 'f1_wanted_info', 'f2_would_use',
    'f3_priority', 'section_timestamps', 'user_agent', 'is_test', 'created_at', 'updated_at'
  ];

  // 데이터 행 변환
  const rows = data.map(row => {
    return headers.map(header => {
      let value = row[header];

      // null, undefined 처리
      if (value === null || value === undefined) {
        return '';
      }

      // 복수 선택 배열은 세미콜론(;)으로 결합
      if (Array.isArray(value)) {
        value = value.join(';');
      } else if (typeof value === 'object') {
        // section_timestamps 같은 JSON 객체는 문자열로
        value = JSON.stringify(value);
      }

      // 문자열 내에 콤마, 줄바꿈, 큰따옴표가 있으면 이스케이프 처리
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
      }

      return value;
    }).join(',');
  });

  // 헤더와 데이터 결합
  const csvContent = [headers.join(','), ...rows].join('\n');

  // UTF-8 with BOM (\uFEFF) 엑셀 한글 깨짐 방지
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
