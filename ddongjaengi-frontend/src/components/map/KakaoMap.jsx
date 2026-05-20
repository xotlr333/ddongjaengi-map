import React, { useEffect, useRef, useState } from 'react';

const KakaoMap = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);

    useEffect(() => {
        const scriptId = 'kakao-map-script';
        
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_APP_KEY}&autoload=false`;
            document.head.appendChild(script);

            script.onload = () => {
                window.kakao.maps.load(() => {
                    initMap();
                });
            };
        } else {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    initMap();
                });
            }
        }

        const initMap = () => {
            if (mapRef.current && !map) {
                const options = {
                    center: new window.kakao.maps.LatLng(37.566826, 126.978656), // 기본 중심 좌표 (서울시청)
                    level: 3,
                };
                const newMap = new window.kakao.maps.Map(mapRef.current, options);
                setMap(newMap);
            }
        };
    }, [map]);

    return (
        <div 
            ref={mapRef} 
            className="w-full h-full bg-gray-200"
            style={{ width: '100%', height: '100vh' }}
        />
    );
};

export default KakaoMap;
