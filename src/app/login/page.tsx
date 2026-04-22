"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup' | 'find'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupCompany, setSignupCompany] = useState('');
  
  // 찾기 상태
  const [findSearchType, setFindSearchType] = useState<'name' | 'company'>('name');
  const [findSearchValue, setFindSearchValue] = useState('');
  const [findResult, setFindResult] = useState<{username: string, password: string} | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('aloeSession');
    if (session) router.push('/');
  }, [router]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    // 관리자 로그인
    if (username === 'lk2204' && password === 'aloe4989') {
      localStorage.setItem('aloeSession', JSON.stringify({ username: 'lk2204', name: '관리자', role: 'ADMIN' }));
      router.push('/');
      return;
    }

    // 사업자 로그인
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    setLoading(false);

    if (!data) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    if (data.status === 'pending') {
      setError('관리자 승인 대기 중입니다. 승인 후 로그인 가능합니다.');
      return;
    }

    if (data.status === 'rejected') {
      setError('가입이 거절되었습니다. 관리자에게 문의하세요.');
      return;
    }

    localStorage.setItem('aloeSession', JSON.stringify({ username: data.username, name: data.name, role: 'BUSINESS' }));
    router.push('/');
  };

  const handleSignup = async () => {
    setError('');
    setSuccess('');
    if (!signupName || !signupUsername || !signupPassword) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    setLoading(true);

    const { error: insertError } = await supabase.from('users').insert({
      id: 'u' + Date.now(),
      username: signupUsername,
      password: signupPassword,
      name: signupName,
      company: signupCompany,
      role: 'BUSINESS',
      status: 'pending',
    });

    setLoading(false);

    if (insertError) {
      if (insertError.message.includes('unique')) {
        setError('이미 사용 중인 아이디입니다.');
      } else {
        setError('가입 중 오류가 발생했습니다.');
      }
      return;
    }

    setSuccess('가입 신청이 완료됐습니다. 관리자 승인 후 로그인 가능합니다.');
    setSignupName('');
    setSignupUsername('');
    setSignupPassword('');
    setSignupCompany('');
  };

  const handleFind = async () => {
    setError('');
    setFindResult(null);
    if (!findSearchValue) {
      setError('정보를 입력해주세요.');
      return;
    }
    setLoading(true);

    const { data, error: findDbError } = await supabase
      .from('users')
      .select('username, password')
      .ilike(findSearchType, `%${findSearchValue}%`);

    setLoading(false);

    if (findDbError || !data || data.length === 0) {
      setError('일치하는 계정 정보를 찾을 수 없습니다.');
      return;
    }

    // 결과 여러 개인 경우 첫 번째 계정 표시
    setFindResult(data[0]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4e8]" style={{ backgroundImage: 'url(/watercolor.png)', backgroundSize: 'auto', backgroundRepeat: 'repeat' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* 로고 */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="김정문알로에" width={180} height={60} className="object-contain mb-2" />
          <p className="text-[13px] text-gray-400 font-medium">프리미엄 내부 플랫폼</p>
        </div>

        {/* 탭 */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 text-[13px] font-bold transition-colors ${mode === 'login' || mode === 'find' ? 'bg-[#7a9a52] text-white' : 'bg-white text-gray-500'}`}
          >
            로그인
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 text-[13px] font-bold transition-colors ${mode === 'signup' ? 'bg-[#7a9a52] text-white' : 'bg-white text-gray-500'}`}
          >
            사업자 가입 신청
          </button>
        </div>

        {mode === 'login' ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full p-3.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#7a9a52]/50"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full p-3.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#7a9a52]/50"
            />
            {error && (
              <div className="mb-2">
                <p className="text-red-500 text-[13px] font-medium">{error}</p>
                {error === '아이디 또는 비밀번호가 올바르지 않습니다.' && (
                  <button
                    onClick={() => { setMode('find'); setError(''); setFindResult(null); setFindSearchValue(username); }}
                    className="w-full mt-3 bg-[#f0f4e8] text-[#7a9a52] py-3 rounded-xl font-bold text-[14px] border border-[#7a9a52]/30 hover:bg-[#e4ebda] transition-colors"
                  >
                    이름이나 거래처명으로 계정 확인하기
                  </button>
                )}
              </div>
            )}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#7a9a52] text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-[#5f7d3a] transition-colors disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
            <div className="flex justify-center mt-4 text-center">
              <button
                onClick={() => { setMode('find'); setError(''); setFindResult(null); setFindSearchValue(''); }}
                className="text-[13px] text-gray-500 hover:text-[#7a9a52] font-medium transition-colors"
              >
                아이디나 비밀번호를 잊으셨나요?
              </button>
            </div>
          </div>
        ) : mode === 'signup' ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="이름"
              value={signupName}
              onChange={e => setSignupName(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#7a9a52]/50"
            />
            <input
              type="text"
              placeholder="거래처명"
              value={signupCompany}
              onChange={e => setSignupCompany(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#7a9a52]/50"
            />
            <input
              type="text"
              placeholder="사용할 아이디"
              value={signupUsername}
              onChange={e => setSignupUsername(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#7a9a52]/50"
            />
            <input
              type="password"
              placeholder="사용할 비밀번호"
              value={signupPassword}
              onChange={e => setSignupPassword(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#7a9a52]/50"
            />
            {error && <p className="text-red-500 text-[13px] font-medium">{error}</p>}
            {success && <p className="text-green-600 text-[13px] font-medium">{success}</p>}
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-[#7a9a52] text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-[#5f7d3a] transition-colors disabled:opacity-50"
            >
              {loading ? '신청 중...' : '가입 신청'}
            </button>
            <p className="text-[12px] text-gray-400 text-center">관리자 승인 후 로그인 가능합니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-4 bg-gray-50">
              <button
                onClick={() => { setFindSearchType('name'); setFindResult(null); setError(''); setFindSearchValue(''); }}
                className={`flex-1 py-3 text-[13px] font-bold transition-colors ${findSearchType === 'name' ? 'bg-[#7a9a52] text-white' : 'text-gray-500'}`}
              >
                이름으로 찾기
              </button>
              <button
                onClick={() => { setFindSearchType('company'); setFindResult(null); setError(''); setFindSearchValue(''); }}
                className={`flex-1 py-3 text-[13px] font-bold transition-colors ${findSearchType === 'company' ? 'bg-[#7a9a52] text-white' : 'text-gray-500'}`}
              >
                거래처명으로 찾기
              </button>
            </div>
            
            <input
              type="text"
              placeholder={findSearchType === 'name' ? '가입된 이름을 입력하세요' : '가입된 거래처명을 입력하세요'}
              value={findSearchValue}
              onChange={e => setFindSearchValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFind()}
              className="w-full p-3.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#7a9a52]/50"
            />

            {error && <p className="text-red-500 text-[13px] font-medium">{error}</p>}
            
            {findResult ? (
              <div className="p-5 bg-[#f0f4e8] rounded-xl border border-[#7a9a52]/20 mt-4 mx-auto w-full">
                <p className="text-[14px] text-gray-700 mb-3 flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <span>아이디</span>
                  <span className="font-bold text-[#7a9a52] text-[15px]">{findResult.username}</span>
                </p>
                <p className="text-[14px] text-gray-700 flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <span>비밀번호</span>
                  <span className="font-bold text-[#7a9a52] text-[15px]">{findResult.password}</span>
                </p>
                
                <button
                  onClick={() => { setMode('login'); setUsername(findResult.username); setPassword(''); setFindResult(null); setError(''); }}
                  className="w-full mt-4 bg-[#7a9a52] text-white py-3 rounded-lg font-bold text-[14px] hover:bg-[#5f7d3a] transition-colors"
                >
                  로그인 화면으로
                </button>
              </div>
            ) : (
              <button
                onClick={handleFind}
                disabled={loading}
                className="w-full bg-[#7a9a52] text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-[#5f7d3a] transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? '확인 중...' : '계정 확인하기'}
              </button>
            )}

            {!findResult && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => { setMode('login'); setError(''); setFindResult(null); }}
                  className="text-[13px] text-gray-400 hover:text-gray-600 font-medium underline underline-offset-4"
                >
                  로그인으로 돌아가기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
