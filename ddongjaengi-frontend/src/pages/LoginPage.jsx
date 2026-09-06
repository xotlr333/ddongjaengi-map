import React from 'react';

const LoginPage = () => {
    const KAKAO_CLIENT_ID = 'cc48f53c9e0af83b1eacd10419b494ab';
    const REDIRECT_URI = 'http://localhost:5173/oauth/callback/kakao';
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    const handleLogin = () => {
        window.location.href = KAKAO_AUTH_URL;
    };

    return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="bg-surface rounded-2xl border border-border p-8">
                    <div className="mb-8">
                        <p className="text-2xl mb-3">🚽</p>
                        <h1 className="text-2xl font-bold text-text-primary leading-snug mb-2">
                            지금 가장 가까운<br/>화장실을 찾아보세요
                        </h1>
                        <p className="text-sm text-text-sub leading-relaxed">
                            카카오로 로그인하면 주변 화장실 비밀번호를<br/>바로 확인할 수 있어요
                        </p>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full flex items-center justify-center gap-2.5 bg-kakao hover:bg-yellow-300 text-text-primary font-semibold text-sm py-3.5 px-6 rounded-xl transition-colors active:scale-95"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3c-5.52 0-10 3.52-10 7.87 0 2.8 1.8 5.25 4.54 6.64l-1.16 4.3c-.05.18.15.34.3.24l5-3.35c.44.06.88.1 1.32.1 5.52 0 10-3.52 10-7.87s-4.48-7.87-10-7.87z" />
                        </svg>
                        카카오로 시작하기
                    </button>
                </div>

                <p className="text-center text-xs text-text-sub mt-6">
                    똥쟁이 지도 — 급할 때 가장 필요한 지도
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
