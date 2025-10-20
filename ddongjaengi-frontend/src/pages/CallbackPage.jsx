import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * 카카오 로그인 콜백 페이지
 * 카카오에서 리다이렉트된 후 인증 코드를 처리
 */
const CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { handleKakaoCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      // URL에서 인증 코드 추출
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      // 에러가 있는 경우
      if (errorParam) {
        setError('카카오 로그인이 취소되었습니다.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // 코드가 없는 경우
      if (!code) {
        setError('인증 코드가 없습니다.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // 카카오 콜백 처리
      const result = await handleKakaoCallback(code);
      
      if (!result.success) {
        setError(result.error);
        setTimeout(() => navigate('/login'), 2000);
      }
      // 성공 시 useAuth 훅에서 자동으로 메인 페이지로 이동
    };

    processCallback();
  }, [searchParams, handleKakaoCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        {error ? (
          // 에러 상태
          <>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              로그인 실패
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              잠시 후 로그인 페이지로 이동합니다...
            </p>
          </>
        ) : (
          // 로딩 상태
          <>
            <div className="text-6xl mb-4">🚽</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              로그인 중...
            </h2>
            <p className="text-gray-600 mb-6">
              카카오 계정 정보를 확인하고 있습니다
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CallbackPage;