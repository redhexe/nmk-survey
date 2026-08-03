'use client';
import { exportToCSV } from '@/lib/csvExport';
import { useState } from 'react';

export default function ExportActions({ responses, onDataChanged }: { responses: any[], onDataChanged: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
    setShowConfirmModal(true);
  };

  const executeDelete = async () => {
    setShowConfirmModal(false);
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
  };

  const testCount = responses.filter(r => r.is_test).length;
  const realCount = responses.filter(r => !r.is_test).length;

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

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              테스트 데이터 삭제 경고
            </h2>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6">
              <p className="text-red-800 font-bold mb-2">테스트 데이터 {testCount}건을 삭제합니다.</p>
              <p className="text-green-700 font-bold">실제 응답 {realCount}건은 유지됩니다.</p>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              이 작업은 즉각적으로 반영되며 복구할 수 없습니다. 삭제하시겠습니까?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 text-white font-medium bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-600/30 transition-colors"
              >
                네, 삭제합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
