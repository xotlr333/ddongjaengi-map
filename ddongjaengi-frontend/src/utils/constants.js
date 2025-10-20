// 환경변수 및 상수 관리
// .env 파일에서 실제 값을 설정해야 합니다

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1';

// 카카오 로그인 설정
export const KAKAO_CONFIG = {
  clientId: import.meta.env.VITE_KAKAO_CLIENT_ID || 'YOUR_KAKAO_CLIENT_ID',
  redirectUri: import.meta.env.VITE_KAKAO_REDIRECT_URI || 'http://localhost:5173/auth/callback',
};

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
};

// API 엔드포인트
export const API_ENDPOINTS = {
  AUTH: {
    KAKAO_CALLBACK: '/auth/kakao/callback',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USER: {
    ME: '/users/me',
  },
  RESTROOMS: {
    LIST: '/restrooms',
    DETAIL: (id) => `/restrooms/${id}`,
  },
};