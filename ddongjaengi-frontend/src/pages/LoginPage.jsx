import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const LoginPage = () => {
  const { loginWithKakao, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // 이미 로그인된 경우 메인 페이지로 이동
  useEffect(() => {
    if (!loading && isAuthenticated()) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4">
      <div className="w-full max-w-md">
        {/* 로그인 카드 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* 상단 그라데이션 바 */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500"></div>
          
          {/* 컨텐츠 */}
          <div className="p-8">
            {/* 로고 섹션 */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🚽</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                똥쟁이 지도
              </h1>
              <p className="text-gray-600 leading-relaxed">
                내가 다녀온 곳의<br />
                화장실 비밀번호를 기록하세요
              </p>
            </div>

            {/* 서비스 설명 */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                🗺️ 이런 기능을 제공해요
              </h3>
              <ul className="space-y-3">
                {[
                  { icon: '📍', text: '지도에서 건물 선택하여 화장실 정보 저장' },
                  { icon: '🔒', text: '비밀번호와 층수 정보 안전하게 보관' },
                  { icon: '⭐', text: '자주 가는 곳은 즐겨찾기로 관리' },
                  { icon: '🔐', text: '개인 정보만 저장, 공유하지 않음' },
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-lg flex-shrink-0">{feature.icon}</span>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 카카오 로그인 버튼 */}
            <Button 
              variant="kakao" 
              onClick={loginWithKakao}
              className="mb-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-900 rounded flex items-center justify-center text-white text-xs font-bold">
                  K
                </div>
                <span>카카오로 간편 시작하기</span>
              </div>
            </Button>

            {/* 개인정보 안내 */}
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 leading-relaxed">
              로그인 시{' '}
              <a href="#" className="text-primary hover:underline">
                개인정보처리방침
              </a>{' '}
              및{' '}
              <a href="#" className="text-primary hover:underline">
                서비스 이용약관
              </a>
              에 동의하는 것으로 간주됩니다.
              <br />
              최소한의 정보(닉네임, 이메일)만 수집하며, 언제든지 탈퇴할 수 있습니다.
            </div>
          </div>
        </div>

        {/* 버전 정보 */}
        <div className="text-center mt-6 text-sm text-gray-500">
          v1.0.0 Beta | 똥쟁이 지도
        </div>
      </div>
    </div>
  );
};

export default LoginPage;