import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS, API_ENDPOINTS } from '../utils/constants';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 시 자동 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 토큰 만료 에러 && 재시도 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // 토큰 갱신 요청
        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken }
        );

        const { accessToken } = response.data.data;
        
        // 새 토큰 저장
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        
        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그인 페이지로 이동
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API 함수들
export const authAPI = {
  // 카카오 로그인 콜백 처리
  kakaoCallback: (code) => 
    api.post(API_ENDPOINTS.AUTH.KAKAO_CALLBACK, {
      code,
      redirectUri: import.meta.env.VITE_KAKAO_REDIRECT_URI,
    }),
  
  // 로그아웃
  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),
  
  // 토큰 갱신
  refreshToken: (refreshToken) => 
    api.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),
};

export const userAPI = {
  // 내 정보 조회
  getMe: () => api.get(API_ENDPOINTS.USER.ME),
  
  // 내 정보 수정
  updateMe: (data) => api.patch(API_ENDPOINTS.USER.ME, data),
  
  // 회원 탈퇴
  deleteMe: () => api.delete(API_ENDPOINTS.USER.ME),
};

export default api;