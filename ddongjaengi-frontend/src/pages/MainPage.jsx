import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import KakaoMap from '../components/map/KakaoMap';
import { restroomAPI } from '../services/api';

const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const IconClose = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconEye = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconEyeOff = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const IconStarFill = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const IconStar = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

/* 색상 상수 — Tailwind arbitrary value로 직접 지정 */
const C = {
  blue:        '#1B64DA',
  blueLight:   '#EBF1FD',
  bg:          '#F2F4F6',
  text:        '#191F28',
  textSub:     '#8B95A1',
  border:      '#E5E8EB',
  danger:      '#F04452',
};

const MainPage = () => {
  const { user, logout } = useAuth();

  const [bounds, setBounds] = useState(null);
  const [restrooms, setRestrooms] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [myRestrooms, setMyRestrooms] = useState([]);
  const [selectedBuildingInfo, setSelectedBuildingInfo] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sidebarTab, setSidebarTab] = useState('all');
  const [mapCenter, setMapCenter] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regFloor, setRegFloor] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMemo, setRegMemo] = useState('');

  const [editingRestroom, setEditingRestroom] = useState(null);
  const [editFloor, setEditFloor] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editMemo, setEditMemo] = useState('');

  const [showPasswordMap, setShowPasswordMap] = useState({});

  useEffect(() => {
    if (!bounds) return;
    fetchRestroomsInBounds();
  }, [bounds]);

  const fetchRestroomsInBounds = async () => {
    try {
      const response = await restroomAPI.search(bounds);
      setRestrooms(response.data);
      if (selectedBuildingInfo) {
        const placeId = selectedBuildingInfo.building.kakaoPlaceId;
        const matchingRestrooms = response.data.filter(r => r.building.kakaoPlaceId === placeId);
        setSelectedBuildingInfo(prev => ({ ...prev, restrooms: matchingRestrooms }));
      }
    } catch (error) {
      console.error('영역 내 화장실 조회 실패:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchMyRestrooms();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const response = await restroomAPI.getFavorites();
      setFavorites(response.data);
    } catch (error) {
      console.error('즐겨찾기 목록 조회 실패:', error);
    }
  };

  const fetchMyRestrooms = async () => {
    try {
      const response = await restroomAPI.getMyRestrooms();
      setMyRestrooms(response.data);
    } catch (error) {
      console.error('내가 등록한 화장실 목록 조회 실패:', error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBuildingInfo) return;
    try {
      const data = {
        building: selectedBuildingInfo.building,
        floor: regFloor,
        password: regPassword,
        memo: regMemo,
      };
      await restroomAPI.create(data);
      setRegFloor('');
      setRegPassword('');
      setRegMemo('');
      setIsRegModalOpen(false);
      fetchRestroomsInBounds();
      fetchFavorites();
      fetchMyRestrooms();
    } catch (error) {
      alert('화장실 등록에 실패했습니다: ' + error.message);
    }
  };

  const startEdit = (restroom) => {
    setEditingRestroom(restroom);
    setEditFloor(restroom.floor || '');
    setEditPassword(restroom.password || '');
    setEditMemo(restroom.memo || '');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRestroom) return;
    try {
      const data = { floor: editFloor, password: editPassword, memo: editMemo };
      await restroomAPI.update(editingRestroom.id, data);
      setEditingRestroom(null);
      fetchRestroomsInBounds();
      fetchFavorites();
      fetchMyRestrooms();
    } catch (error) {
      alert('화장실 수정에 실패했습니다: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 이 화장실 정보를 영구 삭제하시겠습니까?')) return;
    try {
      await restroomAPI.delete(id);
      fetchRestroomsInBounds();
      fetchFavorites();
      fetchMyRestrooms();
    } catch (error) {
      alert('삭제 권한이 없거나 오류가 발생했습니다.');
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await restroomAPI.toggleFavorite(id);
      fetchRestroomsInBounds();
      fetchFavorites();
      fetchMyRestrooms();
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchKeyword(searchInput);
    setSelectedBuildingInfo(null);
  };

  const toggleShowPassword = (id) => {
    setShowPasswordMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPassword = (password) => {
    navigator.clipboard.writeText(password);
    alert('비밀번호가 복사되었습니다.');
  };

  const handleBuildingSelect = (info) => {
    setSelectedBuildingInfo(info);
    setIsSidebarOpen(false);
  };

  const RestroomCard = ({ r, showFavoriteToggle = true, clickable = true }) => (
    <div
      onClick={clickable ? () => {
        setMapCenter({ lat: r.building.latitude, lng: r.building.longitude });
        handleBuildingSelect({ building: r.building, restrooms: [r] });
      } : undefined}
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E8EB' }}
      className="border hover:border-[#1B64DA] rounded-xl p-4 cursor-pointer transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <span
          style={{ color: C.blue, backgroundColor: C.blueLight }}
          className="text-xs font-medium px-2 py-0.5 rounded-full"
        >
          {r.floor}
        </span>
        {showFavoriteToggle && (
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(r.id); }}
            style={{ color: r.isFavorite ? C.blue : C.border }}
            className="p-1 rounded-lg transition-colors hover:text-[#8B95A1]"
          >
            {r.isFavorite ? <IconStarFill /> : <IconStar />}
          </button>
        )}
      </div>
      <h3 style={{ color: C.text }} className="font-semibold text-sm mb-1 leading-snug">{r.building.name}</h3>
      <p style={{ color: C.textSub }} className="text-xs truncate">{r.building.roadAddress || r.building.address}</p>
      {r.memo && (
        <p style={{ color: C.text, backgroundColor: C.bg }} className="text-xs p-2 rounded-lg mt-2 line-clamp-2 leading-relaxed">
          {r.memo}
        </p>
      )}
    </div>
  );

  const tabs = [
    { key: 'all', label: '주변', count: restrooms.length },
    { key: 'favorites', label: '즐겨찾기', count: favorites.length },
    { key: 'my', label: '내가 쓴', count: myRestrooms.length },
  ];

  return (
    <div style={{ backgroundColor: C.bg }} className="flex h-screen w-screen overflow-hidden font-sans antialiased">

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        style={{ backgroundColor: '#FFFFFF', borderColor: C.border }}
        className={`
          fixed bottom-0 left-0 right-0 z-40
          ${isSidebarOpen ? 'translate-y-0 pointer-events-auto visible' : 'translate-y-full pointer-events-none invisible'}
          h-[80vh] rounded-t-2xl
          md:static md:bottom-auto md:left-auto md:right-auto md:translate-y-0 md:z-20 md:h-full md:w-[360px] md:rounded-none md:pointer-events-auto md:visible
          flex flex-col
          border-t md:border-t-0 md:border-r
          transition-transform duration-300 ease-in-out
        `}
      >
        {/* 모바일 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
          <div style={{ backgroundColor: C.border }} className="w-10 h-1 rounded-full" />
        </div>

        {/* 헤더 */}
        <div style={{ borderColor: C.border }} className="flex-shrink-0 px-5 pt-4 pb-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚽</span>
              <h1 style={{ color: C.text }} className="text-base font-bold">똥쟁이 지도</h1>
            </div>
            <div className="flex items-center gap-1.5">
              {user && (
                <button
                  onClick={logout}
                  style={{ color: C.textSub, backgroundColor: C.bg }}
                  className="text-xs px-3 py-1.5 hover:bg-[#E5E8EB] rounded-lg transition-colors"
                >
                  로그아웃
                </button>
              )}
              <button
                onClick={() => setIsSidebarOpen(false)}
                style={{ color: C.textSub }}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F2F4F6] transition-colors"
              >
                <IconClose />
              </button>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="프로필" className="w-9 h-9 rounded-full flex-shrink-0" />
              ) : (
                <div
                  style={{ backgroundColor: C.blue }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                >
                  {user.nickname ? user.nickname[0] : 'U'}
                </div>
              )}
              <div>
                <p style={{ color: C.textSub }} className="text-xs">안녕하세요</p>
                <p style={{ color: C.text }} className="text-sm font-semibold">{user.nickname} 님</p>
              </div>
            </div>
          )}
        </div>

        {/* 검색 */}
        <div style={{ borderColor: C.border }} className="flex-shrink-0 px-4 py-3 border-b">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="장소나 키워드로 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ backgroundColor: C.bg, color: C.text }}
              className="flex-1 px-4 py-2.5 border border-transparent focus:bg-white focus:border-[#1B64DA] rounded-xl focus:outline-none text-sm placeholder-[#8B95A1] transition-all"
            />
            <button
              type="submit"
              style={{ backgroundColor: C.blue }}
              className="w-10 h-10 flex items-center justify-center text-white rounded-xl active:scale-95 transition-transform flex-shrink-0"
            >
              <IconSearch />
            </button>
          </form>
        </div>

        {/* 탭 */}
        <div style={{ borderColor: C.border }} className="flex-shrink-0 flex border-b">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSidebarTab(tab.key)}
              style={{
                color: sidebarTab === tab.key ? C.blue : C.textSub,
                borderBottomColor: sidebarTab === tab.key ? C.blue : 'transparent',
              }}
              className="flex-1 py-3 text-sm transition-colors -mb-px border-b-2 font-medium"
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 text-xs">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {sidebarTab === 'favorites' && (
            favorites.length === 0 ? (
              <div className="text-center py-14">
                <p className="text-3xl mb-3">⭐</p>
                <p style={{ color: C.text }} className="text-sm font-semibold mb-1">즐겨찾는 화장실이 없습니다</p>
                <p style={{ color: C.textSub }} className="text-xs">화장실 카드의 별표를 눌러 추가하세요</p>
              </div>
            ) : favorites.map(r => <RestroomCard key={r.id} r={r} />)
          )}

          {sidebarTab === 'my' && (
            myRestrooms.length === 0 ? (
              <div className="text-center py-14">
                <p className="text-3xl mb-3">✏️</p>
                <p style={{ color: C.text }} className="text-sm font-semibold mb-1">직접 등록한 화장실이 없습니다</p>
                <p style={{ color: C.textSub }} className="text-xs">지도를 선택해 화장실을 등록해보세요</p>
              </div>
            ) : myRestrooms.map(r => <RestroomCard key={r.id} r={r} />)
          )}

          {sidebarTab === 'all' && (
            restrooms.length === 0 ? (
              <div className="text-center py-14">
                <p className="text-3xl mb-3">📍</p>
                <p style={{ color: C.text }} className="text-sm font-semibold mb-1">이 지역에 등록된 화장실이 없습니다</p>
                <p style={{ color: C.textSub }} className="text-xs">지도를 움직여 다른 장소를 찾아보세요</p>
              </div>
            ) : restrooms.map(r => <RestroomCard key={r.id} r={r} />)
          )}
        </div>
      </aside>

      {/* 지도 */}
      <main className="flex-1 min-w-0 h-full relative z-10">
        <KakaoMap
          restrooms={restrooms}
          onBoundsChange={setBounds}
          onSelectBuilding={handleBuildingSelect}
          searchKeyword={searchKeyword}
          center={mapCenter}
        />

        {/* 모바일 FAB */}
        {!selectedBuildingInfo && (
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            style={{ backgroundColor: C.blue }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 md:hidden
              flex items-center gap-2 text-white
              px-5 py-3 rounded-2xl shadow-lg active:scale-95 transition-transform whitespace-nowrap"
          >
            <span className="text-sm">🚽</span>
            <span className="text-sm font-semibold">화장실 목록</span>
            {restrooms.length > 0 && (
              <span style={{ color: C.blue }} className="bg-white text-xs font-bold px-2 py-0.5 rounded-full">
                {restrooms.length}
              </span>
            )}
          </button>
        )}

        {/* 건물 상세 패널 */}
        {selectedBuildingInfo && (
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: C.border }}
            className="
              fixed bottom-0 left-0 right-0 z-50
              h-[65vh] rounded-t-2xl
              md:absolute md:right-4 md:top-4 md:bottom-4 md:left-auto
              md:w-[360px] md:h-auto md:rounded-2xl
              border flex flex-col overflow-hidden shadow-xl
            "
          >
            {/* 모바일 드래그 핸들 */}
            <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
              <div style={{ backgroundColor: C.border }} className="w-10 h-1 rounded-full" />
            </div>

            {/* 패널 헤더 */}
            <div style={{ backgroundColor: '#FFFFFF', borderColor: C.border }} className="flex-shrink-0 px-5 pt-4 pb-4 border-b relative">
              <button
                onClick={() => setSelectedBuildingInfo(null)}
                style={{ color: C.textSub }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F2F4F6] transition-colors"
              >
                <IconClose />
              </button>
              <h2 style={{ color: C.text }} className="text-base font-bold leading-snug pr-10">
                {selectedBuildingInfo.building.name}
              </h2>
              <p style={{ color: C.textSub }} className="text-sm mt-0.5 truncate">
                {selectedBuildingInfo.building.roadAddress || selectedBuildingInfo.building.address}
              </p>
            </div>

            {/* 패널 컨텐츠 */}
            <div style={{ backgroundColor: '#FFFFFF' }} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div style={{ borderColor: C.border }} className="flex justify-between items-center pb-3 border-b">
                <p style={{ color: C.textSub }} className="text-sm">
                  화장실 {selectedBuildingInfo.restrooms.length}개 등록됨
                </p>
                <button
                  onClick={() => setIsRegModalOpen(true)}
                  style={{ color: C.blue }}
                  className="flex items-center gap-1.5 text-sm font-semibold hover:bg-[#EBF1FD] px-3 py-1.5 rounded-lg transition-colors"
                >
                  <IconPlus />
                  신규 등록
                </button>
              </div>

              {selectedBuildingInfo.restrooms.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-3xl mb-3">🧻</p>
                  <p style={{ color: C.text }} className="text-sm font-semibold mb-1">아직 등록된 화장실이 없습니다</p>
                  <p style={{ color: C.textSub }} className="text-xs">최초로 화장실 비밀번호를 공유해 주세요</p>
                </div>
              ) : (
                selectedBuildingInfo.restrooms.map(r => (
                  <div key={r.id} style={{ backgroundColor: C.bg }} className="rounded-xl p-4 space-y-3">

                    <div className="flex justify-between items-center">
                      <span style={{ color: C.blue, backgroundColor: C.blueLight }} className="text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {r.floor}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleToggleFavorite(r.id)}
                          style={{ color: r.isFavorite ? C.blue : C.textSub }}
                          className="p-1.5 rounded-lg transition-colors hover:text-[#1B64DA]"
                        >
                          {r.isFavorite ? <IconStarFill /> : <IconStar />}
                        </button>
                        {r.isCreator && (
                          <>
                            <button
                              onClick={() => startEdit(r)}
                              style={{ color: C.textSub }}
                              className="p-1.5 rounded-lg hover:bg-white hover:text-[#191F28] transition-colors"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              style={{ color: C.textSub }}
                              className="p-1.5 rounded-lg hover:bg-white hover:text-[#F04452] transition-colors"
                            >
                              <IconTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 비밀번호 표시 */}
                    <div style={{ backgroundColor: '#FFFFFF', borderColor: C.border }} className="rounded-xl border p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p style={{ color: C.textSub }} className="text-xs mb-1">비밀번호</p>
                        <div className="flex items-center gap-2">
                          <span style={{ color: C.text }} className="text-sm font-bold font-mono tracking-widest">
                            {showPasswordMap[r.id] ? r.password : '•'.repeat(Math.min((r.password || '').length, 8))}
                          </span>
                          <button
                            onClick={() => toggleShowPassword(r.id)}
                            style={{ color: C.textSub }}
                            className="hover:text-[#191F28] transition-colors flex-shrink-0"
                          >
                            {showPasswordMap[r.id] ? <IconEyeOff /> : <IconEye />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyPassword(r.password)}
                        style={{ color: C.blue }}
                        className="flex-shrink-0 text-sm font-semibold hover:bg-[#EBF1FD] px-3 py-2 rounded-lg transition-colors"
                      >
                        복사
                      </button>
                    </div>

                    {r.memo && (
                      <p style={{ color: C.text }} className="text-xs leading-relaxed">{r.memo}</p>
                    )}

                    <div className="flex justify-between items-center text-xs" style={{ color: C.textSub }}>
                      <span>{r.creatorNickname}</span>
                      <span>{new Date(r.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* 화장실 등록 모달 */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: C.border }}
            className="w-full sm:w-[90%] sm:max-w-[420px] rounded-t-2xl sm:rounded-2xl border shadow-xl p-6"
          >
            <h3 style={{ color: C.text }} className="text-lg font-bold mb-5">화장실 정보 공유하기</h3>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label style={{ color: C.text }} className="block text-sm font-semibold mb-2">층수 정보</label>
                <input
                  type="text"
                  placeholder="예: 2층, B1, 10F"
                  value={regFloor}
                  onChange={(e) => setRegFloor(e.target.value)}
                  style={{ backgroundColor: C.bg, color: C.text }}
                  className="w-full px-4 py-3 border border-transparent focus:bg-white focus:border-[#1B64DA] rounded-xl focus:outline-none text-sm placeholder-[#8B95A1] transition-all"
                  required
                />
              </div>
              <div>
                <label style={{ color: C.text }} className="block text-sm font-semibold mb-2">비밀번호</label>
                <input
                  type="text"
                  placeholder="화장실 비밀번호를 입력하세요"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{ backgroundColor: C.bg, color: C.text }}
                  className="w-full px-4 py-3 border border-transparent focus:bg-white focus:border-[#1B64DA] rounded-xl focus:outline-none text-sm font-mono placeholder-[#8B95A1] transition-all"
                  required
                />
              </div>
              <div>
                <label style={{ color: C.text }} className="block text-sm font-semibold mb-2">
                  메모 <span style={{ color: C.textSub }} className="font-normal">(선택)</span>
                </label>
                <textarea
                  placeholder="예: 휴지 비치됨, 문이 무거움 등"
                  value={regMemo}
                  onChange={(e) => setRegMemo(e.target.value)}
                  style={{ backgroundColor: C.bg, color: C.text }}
                  className="w-full px-4 py-3 border border-transparent focus:bg-white focus:border-[#1B64DA] rounded-xl focus:outline-none text-sm placeholder-[#8B95A1] transition-all h-20 resize-none"
                />
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegModalOpen(false)}
                  style={{ backgroundColor: C.bg, color: C.text }}
                  className="flex-1 py-3 hover:bg-[#E5E8EB] font-semibold text-sm rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: C.blue }}
                  className="flex-1 py-3 text-white font-semibold text-sm rounded-xl hover:bg-[#1557c0] transition-colors active:scale-95"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 화장실 수정 모달 */}
      {editingRestroom && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
          <div
            style={{ backgroundColor: '#FFFFFF', borderColor: C.border }}
            className="w-full sm:w-[90%] sm:max-w-[420px] rounded-t-2xl sm:rounded-2xl border shadow-xl p-6"
          >
            <h3 style={{ color: C.text }} className="text-lg font-bold mb-5">화장실 정보 수정하기</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label style={{ color: C.text }} className="block text-sm font-semibold mb-2">층수 정보</label>
                <input
                  type="text"
                  placeholder="예: 2층, B1, 10F"
                  value={editFloor}
                  onChange={(e) => setEditFloor(e.target.value)}
                  style={{ backgroundColor: C.bg, color: C.text }}
                  className="w-full px-4 py-3 border border-transparent focus:bg-white focus:border-[#1B64DA] rounded-xl focus:outline-none text-sm placeholder-[#8B95A1] transition-all"
                  required
                />
              </div>
              <div>
                <label style={{ color: C.text }} className="block text-sm font-semibold mb-2">비밀번호</label>
                <input
                  type="text"
                  placeholder="화장실 비밀번호를 입력하세요"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  style={{ backgroundColor: C.bg, color: C.text }}
                  className="w-full px-4 py-3 border border-transparent focus:bg-white focus:border-[#1B64DA] rounded-xl focus:outline-none text-sm font-mono placeholder-[#8B95A1] transition-all"
                  required
                />
              </div>
              <div>
                <label style={{ color: C.text }} className="block text-sm font-semibold mb-2">
                  메모 <span style={{ color: C.textSub }} className="font-normal">(선택)</span>
                </label>
                <textarea
                  placeholder="예: 휴지 비치됨, 문이 무거움 등"
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  style={{ backgroundColor: C.bg, color: C.text }}
                  className="w-full px-4 py-3 border border-transparent focus:bg-white focus:border-[#1B64DA] rounded-xl focus:outline-none text-sm placeholder-[#8B95A1] transition-all h-20 resize-none"
                />
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingRestroom(null)}
                  style={{ backgroundColor: C.bg, color: C.text }}
                  className="flex-1 py-3 hover:bg-[#E5E8EB] font-semibold text-sm rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: C.blue }}
                  className="flex-1 py-3 text-white font-semibold text-sm rounded-xl hover:bg-[#1557c0] transition-colors active:scale-95"
                >
                  수정하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MainPage;
