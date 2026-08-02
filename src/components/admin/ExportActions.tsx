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
    <div className="flex gap-4 mb-8 p-4 bg-white rounded shadow border border-gray-100">
      <div className="flex-1">
        <h3 className="font-bold mb-2">CSV 내보내기</h3>
        <div className="flex gap-2">
          <button 
            onClick={handleExportAll}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            전체 다운로드 (테스트 포함)
          </button>
          <button 
            onClick={handleExportValid}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            유효 응답만 다운로드 (테스트 제외)
          </button>
        </div>
      </div>
      
      <div className="border-l pl-4">
        <h3 className="font-bold mb-2 text-red-600">위험 구역</h3>
        <button 
          onClick={handleDeleteTests}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 disabled:opacity-50"
        >
          {isDeleting ? '삭제 중...' : '테스트 데이터 싹 다 지우기'}
        </button>
      </div>
    </div>
  );
}
