import React from 'react';

const LoginPage = () => {
    const KAKAO_CLIENT_ID = 'cc48f53c9e0af83b1eacd10419b494ab';
    const REDIRECT_URI = 'http://localhost:5173/oauth/callback/kakao';
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    const handleLogin = () => {
        window.location.href = KAKAO_AUTH_URL;
    };

    return (
        <div className="min-h-screen bg-amber-50 flex flex-col justify-center py-12 px-4">
            <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-lg flex flex-col items-center space-y-6 w-full max-w-sm mx-auto">
                <h1 className="text-3xl font-bold text-amber-900 mb-2">💩 똥쟁이 지도</h1>
                <p className="text-gray-600 text-center mb-4">
                    급할 때 가장 필요한 지도!<br/>지금 로그인하고 안심하고 외출하세요.
                </p>
                <button 
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center space-x-3 bg-[#FEE500] hover:bg-[#F4DC00] text-black font-semibold py-3.5 px-6 rounded-xl transition-colors duration-200"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3c-5.52 0-10 3.52-10 7.87 0 2.8 1.8 5.25 4.54 6.64l-1.16 4.3c-.05.18.15.34.3.24l5-3.35c.44.06.88.1 1.32.1 5.52 0 10-3.52 10-7.87s-4.48-7.87-10-7.87z" />
                    </svg>
                    <span>카카오로 시작하기</span>
                </button>
            </div>
        </div>
    );
};

export default LoginPage;