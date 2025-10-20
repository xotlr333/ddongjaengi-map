import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../services/api';
import { STORAGE_KEYS, KAKAO_CONFIG } from '../utils/constants';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          // 토큰이 있으면 사용자 정보 조회
          const response = await userAPI.getMe();
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        // 토큰이 유효하지 않으면 삭제
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 카카오 로그인 시작
  const loginWithKakao = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CONFIG.clientId}&redirect_uri=${KAKAO_CONFIG.redirectUri}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  // 카카오 콜백 처리
  const handleKakaoCallback = async (code) => {
    try {
      setLoading(true);
      const response = await authAPI.kakaoCallback(code);
      const { accessToken, refreshToken, user: userData } = response.data.data;

      // 토큰 및 사용자 정보 저장
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));

      setUser(userData);
      
      // 메인 페이지로 이동
      navigate('/');
      
      return { success: true };
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || '로그인에 실패했습니다.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      // API 실패해도 로컬 정보는 삭제
      localStorage.clear();
      setUser(null);
      navigate('/login');
    }
  };

  // 로그인 여부 확인
  const isAuthenticated = () => {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  };

  return {
    user,
    loading,
    loginWithKakao,
    handleKakaoCallback,
    logout,
    isAuthenticated,
  };
};