'use client';
import { useState, useEffect } from 'react';
import SummaryCards from '@/components/admin/SummaryCards';
import Charts from '@/components/admin/Charts';
import ResponseTable from '@/components/admin/ResponseTable';
import ExportActions from '@/components/admin/ExportActions';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data');
      if (res.status === 401) {
        setIsAuthenticated(false);
      } else if (res.ok) {
        const json = await res.json();
        setResponses(json.data || []);
        setIsAuthenticated(true);
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결 오류');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        fetchResponses();
      } else {
        setError('비밀번호가 틀렸습니다.');
        setLoading(false);
      }
    } catch (err) {
      setError('서버 연결 오류');
      setLoading(false);
    }
  };

  if (isAuthenticated === null && loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">관리자 대시보드</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                접속 비밀번호
              </label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                placeholder="비밀번호 입력"
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '확인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fe] p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">설문 응답 대시보드</h1>
            <p className="text-sm text-gray-500 mt-1">국립중앙박물관 대기경험조사 실시간 데이터</p>
          </div>
          <button 
            onClick={fetchResponses}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-colors text-sm font-semibold flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            데이터 새로고침
          </button>
        </div>

        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">{error}</div>}
        
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-6">
            <ExportActions responses={responses} onDataChanged={fetchResponses} />
            <SummaryCards responses={responses} />
            
            <div className="mt-4">
              <h2 className="text-lg font-bold mb-4 text-gray-900 tracking-tight">통계 차트 <span className="text-sm font-normal text-gray-500 ml-2">(테스트 데이터 제외)</span></h2>
              <Charts responses={responses} />
            </div>

            <div className="mt-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-2">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                  응답 목록 전체 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (총 {responses.length}건 | 실제 {responses.filter((r: any) => !r.is_test).length}건 | 테스트 {responses.filter((r: any) => r.is_test).length}건)
                  </span>
                </h2>
                <div className="text-xs text-gray-500 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                  <div>
                    <span className="font-bold text-gray-400 mr-1">○</span>일치
                    <span className="font-bold text-red-500 ml-2 mr-1">✕</span>불일치
                    <span className="text-[10px] text-gray-400 ml-1">(평소 언어와 안내문 언어)</span>
                  </div>
                  <div>
                    <span className="font-bold bg-yellow-500 text-white px-1.5 py-0.5 rounded text-[10px] mr-1">일괄응답</span>
                    모두 같은 번호 선택 (주의 표시일 뿐 <strong>데이터는 유효함</strong>)
                  </div>
                </div>
              </div>
              <ResponseTable responses={responses} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
