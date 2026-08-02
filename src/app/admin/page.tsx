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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">설문 응답 대시보드</h1>
          <button 
            onClick={fetchResponses}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-medium"
          >
            데이터 새로고침
          </button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        
        {loading && <div className="text-center py-4 text-gray-500">데이터를 불러오는 중입니다...</div>}

        {!loading && (
          <>
            <ExportActions responses={responses} onDataChanged={fetchResponses} />
            <SummaryCards responses={responses} />
            
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">통계 차트 (테스트 데이터 제외)</h2>
              <Charts responses={responses} />
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">응답 목록 전체 (테스트 포함)</h2>
              <ResponseTable responses={responses} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
