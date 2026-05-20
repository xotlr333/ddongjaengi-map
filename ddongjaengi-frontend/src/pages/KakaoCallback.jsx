import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const KakaoCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const code = new URLSearchParams(location.search).get('code');
        if (code) {
            axios.post(`http://localhost:8080/api/auth/kakao?code=${code}`)
                .then(response => {
                    const token = response.data.token;
                    localStorage.setItem('accessToken', token);
                    navigate('/');
                })
                .catch(error => {
                    console.error('로그인 실패:', error);
                    alert('로그인에 실패했습니다.');
                    navigate('/login');
                });
        }
    }, [location, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">로그인 처리 중입니다...</p>
            </div>
        </div>
    );
};

export default KakaoCallback;
