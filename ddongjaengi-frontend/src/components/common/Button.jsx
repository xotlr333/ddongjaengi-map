import React from 'react';

/**
 * 공통 버튼 컴포넌트
 * @param {string} variant - 버튼 스타일 (primary, secondary, kakao)
 * @param {boolean} loading - 로딩 상태
 * @param {boolean} disabled - 비활성화 상태
 * @param {function} onClick - 클릭 이벤트
 * @param {React.ReactNode} children - 버튼 내용
 * @param {string} className - 추가 CSS 클래스
 */
const Button = ({ 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  onClick, 
  children, 
  className = '',
  ...props 
}) => {
  // 버튼 스타일 정의
  const baseStyles = 'w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-600 active:scale-95',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95',
    kakao: 'bg-kakao text-gray-900 hover:bg-yellow-400 active:scale-95',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg 
            className="animate-spin h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>처리중...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;