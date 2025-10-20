import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

/**
 * 메인 페이지 (임시 버전)
 * 나중에 지도 기능이 추가될 예정
 */
const MainPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚽</span>
            <h1 className="text-xl font-bold text-gray-800">똥쟁이 지도</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="flex items-center gap-2">
                  {user.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt="프로필" 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">{user.nickname}님</span>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={logout}
                  className="!w-auto !px-4 !py-2 text-sm"
                >
                  로그아웃
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            지도 기능 준비 중
          </h2>
          <p className="text-gray-600 mb-6">
            백엔드 API가 완성되면 지도 기능을 추가할 예정입니다.
          </p>
          
          {user && (
            <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-800 mb-3">로그인 정보</h3>
              <div className="space-y-2 text-sm text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">카카오 ID:</span>
                  <span className="font-medium">{user.kakaoId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">닉네임:</span>
                  <span className="font-medium">{user.nickname}</span>
                </div>
                {user.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">이메일:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 개발 예정 기능 안내 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: '🗺️',
              title: '지도 기반 검색',
              description: '카카오맵으로 건물을 쉽게 찾고 선택',
            },
            {
              icon: '🔒',
              title: '화장실 정보 저장',
              description: '층수, 비밀번호, 메모를 안전하게 보관',
            },
            {
              icon: '⭐',
              title: '즐겨찾기 관리',
              description: '자주 가는 곳을 빠르게 접근',
            },
            {
              icon: '📱',
              title: '모바일 최적화',
              description: '언제 어디서나 편리하게 사용',
            },
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow p-6">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MainPage;