import React, { useEffect, useRef, useState } from 'react';

const KakaoMap = ({ restrooms = [], onBoundsChange, onSelectBuilding, searchKeyword, center }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [searchMarkers, setSearchMarkers] = useState([]);
    const [sdkError, setSdkError] = useState(false);
    const psRef = useRef(null);
    const clickMarkerRef = useRef(null);

    // 1. 지도 로드 및 초기화
    useEffect(() => {
        const scriptId = 'kakao-map-script';
        
        const initMap = () => {
            if (!window.kakao || !window.kakao.maps) {
                setSdkError(true);
                return;
            }
            if (mapRef.current && !map) {
                const options = {
                    center: new window.kakao.maps.LatLng(37.566826, 126.978656), // 기본 서울시청
                    level: 3,
                };
                const newMap = new window.kakao.maps.Map(mapRef.current, options);
                
                // 지도 드래그/줌 종료 이벤트 리스너 추가
                window.kakao.maps.event.addListener(newMap, 'idle', () => {
                    handleBoundsChange(newMap);
                });

                // 지도 클릭 이벤트 리스너 추가 (역지오코딩 연동)
                window.kakao.maps.event.addListener(newMap, 'click', (mouseEvent) => {
                    handleMapClick(newMap, mouseEvent.latLng);
                });

                setMap(newMap);
                // 첫 로드 시 바운드 변경 및 크기 재계산 호출
                setTimeout(() => {
                    newMap.relayout();
                    handleBoundsChange(newMap);
                }, 500);
            }
        };

        const handleScriptLoad = () => {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    initMap();
                });
            } else {
                setSdkError(true);
            }
        };

        let script = document.getElementById(scriptId);

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_APP_KEY}&libraries=services&autoload=false`;
            script.onerror = () => {
                setSdkError(true);
            };
            script.onload = handleScriptLoad;
            document.head.appendChild(script);
        } else {
            // 이미 스크립트 태그가 존재하는 경우
            if (window.kakao && window.kakao.maps) {
                // 이미 객체가 존재하는 경우 즉시 지도 초기화
                window.kakao.maps.load(() => {
                    initMap();
                });
            } else {
                // 태그는 있지만 아직 로드가 완료되지 않은 시점인 경우, load 이벤트를 구독하여 기다림
                script.addEventListener('load', handleScriptLoad);
                script.addEventListener('error', () => setSdkError(true));
            }
        }

        // 언마운트 시 리스너 클린업
        return () => {
            if (script) {
                script.removeEventListener('load', handleScriptLoad);
            }
        };
    }, [map]);

    // 2. 지도 범위 변경 핸들러
    const handleBoundsChange = (currentMap) => {
        if (!currentMap || !onBoundsChange) return;
        const bounds = currentMap.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        onBoundsChange({
            southWestLat: sw.getLat(),
            southWestLng: sw.getLng(),
            northEastLat: ne.getLat(),
            northEastLng: ne.getLng()
        });
    };

    // 지도를 직접 클릭하여 위치를 선택하는 핸들러
    const handleMapClick = (currentMap, latLng) => {
        if (!currentMap || !onSelectBuilding) return;

        const lat = latLng.getLat();
        const lng = latLng.getLng();

        // 역지오코더를 사용해 해당 좌표의 실제 주소를 색인
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
                const addr = result[0];
                const addressName = addr.address ? addr.address.address_name : '주소 정보 없음';
                const roadAddressName = addr.road_address ? addr.road_address.address_name : '';
                const buildingName = addr.road_address?.building_name ? 
                    addr.road_address.building_name : 
                    `${addressName} 주변`;

                // 카카오 Place ID가 없는 가상 장소이므로, 고유한 가상 ID를 부여
                const virtualBuilding = {
                    kakaoPlaceId: `CLI_${lat.toFixed(6)}_${lng.toFixed(6)}`,
                    name: buildingName,
                    address: addressName,
                    roadAddress: roadAddressName,
                    latitude: lat,
                    longitude: lng,
                    phone: '',
                    category: '사용자 지정 위치'
                };

                // 기존 임시 클릭 마커가 있다면 지도에서 지웁니다.
                if (clickMarkerRef.current) {
                    clickMarkerRef.current.setMap(null);
                }

                // 새로운 📍 핀 오버레이 생성
                const content = document.createElement('div');
                content.className = 'cursor-pointer transform scale-110 animate-bounce transition-transform duration-200';
                content.innerHTML = `
                    <div class="flex items-center justify-center w-8 h-8 bg-gradient-to-tr from-rose-600 to-pink-500 text-white rounded-full shadow-lg border-2 border-white relative">
                        <span class="text-sm">📍</span>
                    </div>
                `;

                const overlay = new window.kakao.maps.CustomOverlay({
                    position: latLng,
                    content: content,
                    yAnchor: 1.2
                });

                overlay.setMap(currentMap);
                clickMarkerRef.current = overlay;

                // MainPage로 가상 건물 선택 정보 전송
                onSelectBuilding({
                    building: virtualBuilding,
                    restrooms: []
                });
            }
        });
    };

    // 3. 백엔드에서 받은 화장실 목록 기반 마커 렌더링
    useEffect(() => {
        if (!map) return;

        // 기존 화장실 마커들 제거
        markers.forEach(m => m.setMap(null));

        // 건물별로 화장실 그룹화 (한 건물에 여러 마커 중복 방지)
        const buildingGroups = {};
        restrooms.forEach(r => {
            const bId = r.building.kakaoPlaceId;
            if (!buildingGroups[bId]) {
                buildingGroups[bId] = {
                    building: r.building,
                    restrooms: []
                };
            }
            buildingGroups[bId].restrooms.push(r);
        });

        const newMarkers = Object.values(buildingGroups).map(group => {
            const latLng = new window.kakao.maps.LatLng(group.building.latitude, group.building.longitude);
            
            // 프리미엄 🚽 이모티콘 커스텀 오버레이
            const content = document.createElement('div');
            content.className = 'cursor-pointer transform hover:scale-110 transition-transform duration-200';
            content.innerHTML = `
                <div class="flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-400 text-white rounded-full shadow-lg border-2 border-white relative">
                    <span class="text-xl">🚽</span>
                    <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
                        ${group.restrooms.length}
                    </span>
                </div>
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-gray-700 pointer-events-none">
                    ${group.building.name}
                </div>
            `;

            const overlay = new window.kakao.maps.CustomOverlay({
                position: latLng,
                content: content,
                yAnchor: 1.2,
                clickable: true // 클릭 이벤트가 지도를 뚫고 지나가지 않도록 설정
            });

            overlay.setMap(map);

            content.addEventListener('click', (e) => {
                e.stopPropagation(); // 지도의 클릭 이벤트(임시 핀 생성 등)로 전파되는 것을 차단
                if (clickMarkerRef.current) {
                    clickMarkerRef.current.setMap(null);
                    clickMarkerRef.current = null;
                }
                if (onSelectBuilding) {
                    onSelectBuilding({
                        building: group.building,
                        restrooms: group.restrooms
                    });
                }
            });

            return overlay;
        });

        setMarkers(newMarkers);
    }, [map, restrooms]);

    // 4. 카카오 Places API 키워드 장소 검색 연동
    useEffect(() => {
        if (!map || !searchKeyword) return;

        if (!psRef.current) {
            psRef.current = new window.kakao.maps.services.Places();
        }

        // 기존 검색 마커 및 임시 클릭 마커 지우기
        searchMarkers.forEach(m => m.setMap(null));
        if (clickMarkerRef.current) {
            clickMarkerRef.current.setMap(null);
            clickMarkerRef.current = null;
        }

        psRef.current.keywordSearch(searchKeyword, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const bounds = new window.kakao.maps.LatLngBounds();
                const newSearchMarkers = data.map(place => {
                    const latLng = new window.kakao.maps.LatLng(place.y, place.x);
                    bounds.extend(latLng);

                    // 검색 마커 생성
                    const content = document.createElement('div');
                    content.className = 'cursor-pointer transform hover:scale-110 transition-transform duration-200';
                    content.innerHTML = `
                        <div class="flex items-center justify-center w-8 h-8 bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-full shadow-lg border-2 border-white relative">
                            <span class="text-sm">📍</span>
                        </div>
                    `;

                    const overlay = new window.kakao.maps.CustomOverlay({
                        position: latLng,
                        content: content,
                        yAnchor: 1.2,
                        clickable: true // 클릭 이벤트가 지도를 뚫고 지나가지 않도록 설정
                    });

                    overlay.setMap(map);

                    content.addEventListener('click', (e) => {
                        e.stopPropagation(); // 지도의 클릭 이벤트(임시 핀 생성 등)로 전파되는 것을 차단
                        if (clickMarkerRef.current) {
                            clickMarkerRef.current.setMap(null);
                            clickMarkerRef.current = null;
                        }
                        if (onSelectBuilding) {
                            onSelectBuilding({
                                building: {
                                    kakaoPlaceId: place.id,
                                    name: place.place_name,
                                    address: place.address_name,
                                    roadAddress: place.road_address_name,
                                    latitude: place.y,
                                    longitude: place.x,
                                    phone: place.phone,
                                    category: place.category_name
                                },
                                restrooms: [] // 백엔드에서 건물 선택 시 화장실 정보를 동적으로 가져옴
                            });
                        }
                    });

                    return overlay;
                });

                setSearchMarkers(newSearchMarkers);
                map.setBounds(bounds); // 검색 결과 영역으로 지도 이동
            }
        });

    }, [map, searchKeyword]);

    // 5. center prop 변경 시 지도 중심 부드럽게 이동
    useEffect(() => {
        if (!map || !center) return;
        const latLng = new window.kakao.maps.LatLng(center.lat, center.lng);
        map.panTo(latLng);
    }, [map, center]);

    // 6. 브라우저 리사이즈 시 지도 크기 재계산 (반응형 대응)
    useEffect(() => {
        if (!map) return;
        
        let lastWidth = window.innerWidth;

        const handleResize = () => {
            const currentWidth = window.innerWidth;
            const isMobile = window.innerWidth < 768; // md 분기점 기준

            if (isMobile) {
                // 모바일 환경: 상하 터치 스크롤 시 주소창 높이 변화에 의한 relayout 방지를 위해 가로 너비가 변했을 때만 실행
                if (currentWidth !== lastWidth) {
                    map.relayout();
                    lastWidth = currentWidth;
                }
            } else {
                // PC 환경: 미세 렌더링 오차를 칼같이 동기화하기 위해 리사이즈 가드 없이 즉시 실행
                map.relayout();
                lastWidth = currentWidth;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [map]);

    if (sdkError) {
        return (
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white p-6 relative">
                <div className="max-w-md text-center space-y-4">
                    <span className="text-6xl animate-pulse block">⚠️</span>
                    <h3 className="text-xl font-bold text-amber-400">카카오 지도 SDK 로드 실패</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        카카오 지도 API를 불러오지 못했습니다. 아래 원인을 확인해 주세요.
                    </p>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left text-[11px] font-medium text-slate-300 space-y-2">
                        <p>1. <strong>도메인 등록 유무</strong>: 카카오 디벨로퍼스 콘솔의 [플랫폼 &gt; Web] 설정에 <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">http://localhost:5173</code>이 사이트 도메인으로 등록되었는지 확인해 주세요.</p>
                        <p>2. <strong>앱 키 설정</strong>: <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">.env</code> 파일의 <code className="text-indigo-300">VITE_KAKAO_MAP_APP_KEY</code>가 올바른 <strong>JavaScript 키</strong>인지 확인해 주세요. (REST API 키를 대입하면 403 Forbidden 에러가 발생합니다.)</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={mapRef} 
            className="w-full h-full bg-gray-100 relative"
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default KakaoMap;
