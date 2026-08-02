'use client';
import { exportToCSV } from '@/lib/csvExport';
import { useState } from 'react';

export default function ExportActions({ responses, onDataChanged }: { responses: any[], onDataChanged: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportAll = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    exportToCSV(responses, `survey_responses_all_${timestamp}.csv`);
  };

  const handleExportValid = () => {
    const validResponses = responses.filter(r => !r.is_test);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    exportToCSV(validResponses, `survey_responses_valid_${timestamp}.csv`);
  };

  const handleDeleteTests = async () => {
    const testCount = responses.filter(r => r.is_test).length;
    if (testCount === 0) {
      alert("삭제할 테스트 데이터가 없습니다.");
      return;
    }

    if (confirm(`정말로 ${testCount}개의 테스트 데이터를 싹 다 지우시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      setIsDeleting(true);
      try {
        const res = await fetch('/api/admin/delete-tests', { method: 'DELETE' });
        if (res.ok) {
          alert("테스트 데이터가 모두 삭제되었습니다.");
          onDataChanged(); // 데이터 리로드
        } else {
          alert("테스트 데이터 삭제에 실패했습니다.");
        }
      } catch (err) {
        console.error(err);
        alert("오류가 발생했습니다.");
      }
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-5 bg-white rounded-[24px] shadow-sm">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          데이터 내보내기 (CSV)
        </h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExportAll}
            className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            전체 다운로드
          </button>
          <button 
            onClick={handleExportValid}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-500/30 hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            유효 응답만 다운로드
          </button>
        </div>
      </div>
      
      <div className="md:border-l border-gray-100 md:pl-6">
        <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          위험 구역
        </h3>
        <button 
          onClick={handleDeleteTests}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isDeleting ? '삭제 중...' : '테스트 데이터 싹 다 지우기'}
        </button>
      </div>
    </div>
  );
}
