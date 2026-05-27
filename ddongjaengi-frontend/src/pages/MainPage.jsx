import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import KakaoMap from '../components/map/KakaoMap';
import { restroomAPI } from '../services/api';

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
        memo: regMemo
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
    alert('비밀번호가 클립보드에 안전하게 복사되었습니다!');
  };

  // 건물 선택 시 모바일에서 사이드바를 닫고 상세 패널을 표시
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
      className="bg-white/80 border border-slate-200/50 hover:border-amber-400 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          {r.floor}
        </span>
        {showFavoriteToggle && (
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(r.id); }}
            className="text-amber-400 hover:scale-125 transition-transform p-1"
          >
            {r.isFavorite ? '★' : '☆'}
          </button>
        )}
      </div>
      <h3 className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors mb-1 leading-snug">
        {r.building.name}
      </h3>
      <p className="text-[11px] text-slate-500 mb-2 truncate">{r.building.roadAddress || r.building.address}</p>
      {r.memo && (
        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2 leading-relaxed">
          {r.memo}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800">

      {/* 모바일 사이드바 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 사이드바: 모바일=바텀시트, PC=좌측 고정 패널 */}
      <aside className={`
        fixed bottom-0 left-0 right-0 z-40
        ${isSidebarOpen ? 'translate-y-0 pointer-events-auto visible' : 'translate-y-full pointer-events-none invisible'}
        h-[80vh] rounded-t-3xl
        md:static md:bottom-auto md:left-auto md:right-auto md:translate-y-0 md:z-20 md:h-full md:w-[380px] md:rounded-none md:pointer-events-auto md:visible
        flex flex-col bg-white/90 backdrop-blur-xl shadow-2xl
        border-t border-slate-200/50 md:border-t-0 md:border-r md:border-slate-200/50
        transition-transform duration-300 ease-in-out
      `}>

        {/* 모바일 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* 헤더 */}
        <div className="flex-shrink-0 px-5 pt-4 pb-5 border-b border-slate-200/40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white md:rounded-br-3xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-bounce">🚽</span>
              <h1 className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                똥쟁이 지도
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={logout}
                  className="text-[11px] px-2.5 py-1 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-slate-300 rounded-full border border-white/10"
                >
                  로그아웃
                </button>
              )}
              {/* 모바일에서 닫기 버튼 */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all active:scale-90"
              >
                ✕
              </button>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="프로필"
                  className="w-9 h-9 rounded-full border-2 border-amber-500/50 flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.nickname ? user.nickname[0] : 'U'}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-slate-400">안녕하세요!</span>
                <span className="text-sm font-bold text-slate-100 truncate">{user.nickname} 님</span>
              </div>
            </div>
          )}
        </div>

        {/* 검색 폼 */}
        <div className="flex-shrink-0 p-4 border-b border-slate-200/30">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="장소나 키워드를 입력하세요..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner transition-all text-sm font-medium text-slate-700 placeholder-slate-400"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl active:scale-90 transition-transform shadow-md"
            >
              🔍
            </button>
          </form>
        </div>

        {/* 탭 */}
        <div className="flex-shrink-0 flex px-3 py-2 gap-1.5 border-b border-slate-200/30 overflow-x-auto select-none no-scrollbar">
          {[
            { key: 'all', label: `🗺️ 주변`, count: restrooms.length },
            { key: 'favorites', label: `⭐ 즐겨찾기`, count: favorites.length },
            { key: 'my', label: `✍️ 내가 쓴`, count: myRestrooms.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSidebarTab(tab.key)}
              className={`flex-1 py-2 px-2.5 text-[11px] font-black rounded-xl whitespace-nowrap transition-all ${
                sidebarTab === tab.key
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* 화장실 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {sidebarTab === 'favorites' && (
            favorites.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="text-4xl block mb-2">⭐</span>
                <p className="text-xs font-semibold">즐겨찾는 화장실이 없습니다.</p>
              </div>
            ) : favorites.map(r => <RestroomCard key={r.id} r={r} />)
          )}

          {sidebarTab === 'my' && (
            myRestrooms.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="text-4xl block mb-2">✍️</span>
                <p className="text-xs font-semibold">직접 등록한 화장실이 없습니다.</p>
                <p className="text-[10px] text-slate-400/80 mt-1">지도를 직접 선택해 화장실을 알려주세요!</p>
              </div>
            ) : myRestrooms.map(r => <RestroomCard key={r.id} r={r} />)
          )}

          {sidebarTab === 'all' && (
            restrooms.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="text-4xl block mb-2">📍</span>
                <p className="text-xs font-semibold">현재 영역 내에 등록된<br/>화장실이 없습니다.</p>
                <p className="text-[10px] text-slate-400/80 mt-1">지도를 드래그하여 다른 장소를 찾아보세요!</p>
              </div>
            ) : restrooms.map(r => <RestroomCard key={r.id} r={r} />)
          )}
        </div>
      </aside>

      {/* 지도 메인 */}
      <main className="flex-1 min-w-0 h-full relative z-10">
        <KakaoMap
          restrooms={restrooms}
          onBoundsChange={setBounds}
          onSelectBuilding={handleBuildingSelect}
          searchKeyword={searchKeyword}
          center={mapCenter}
        />

        {/* 모바일 FAB: 목록 토글 버튼 */}
        {!selectedBuildingInfo && (
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 md:hidden
              flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm text-white
              px-5 py-3 rounded-2xl shadow-xl active:scale-95 transition-transform whitespace-nowrap"
          >
            <span>🚽</span>
            <span className="text-sm font-bold">화장실 목록</span>
            <span className="bg-amber-500 text-xs font-black px-2 py-0.5 rounded-full">
              {restrooms.length}
            </span>
          </button>
        )}

        {/* 건물 상세 패널: 모바일=바텀시트, PC=우측 플로팅 패널 */}
        {selectedBuildingInfo && (
          <div className="
            fixed bottom-0 left-0 right-0 z-50
            h-[65vh] rounded-t-3xl
            md:absolute md:right-4 md:top-4 md:bottom-4 md:left-auto
            md:w-[360px] md:h-auto md:rounded-3xl
            bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200/50
            flex flex-col overflow-hidden
          ">

            {/* 모바일 드래그 핸들 */}
            <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* 패널 헤더 */}
            <div className="flex-shrink-0 px-5 pt-4 pb-5 bg-gradient-to-br from-amber-500 to-orange-500 text-white relative">
              <button
                onClick={() => setSelectedBuildingInfo(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
              >
                ✕
              </button>
              <span className="text-xs font-semibold text-amber-100 bg-white/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                Building info
              </span>
              <h2 className="text-base font-black leading-tight drop-shadow-md pr-8">
                {selectedBuildingInfo.building.name}
              </h2>
              <p className="text-xs text-amber-50/90 mt-1 leading-normal font-medium truncate">
                {selectedBuildingInfo.building.roadAddress || selectedBuildingInfo.building.address}
              </p>
            </div>

            {/* 패널 컨텐츠 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400">
                  등록된 화장실 정보 ({selectedBuildingInfo.restrooms.length})
                </span>
                <button
                  onClick={() => setIsRegModalOpen(true)}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-all"
                >
                  ➕ 신규 등록
                </button>
              </div>

              {selectedBuildingInfo.restrooms.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="text-4xl block mb-2">🧻</span>
                  <p className="text-xs font-bold">아직 등록된 화장실이 없습니다.</p>
                  <p className="text-[10px] text-slate-400/80 mt-1">최초로 화장실 비밀번호를 공유해 주세요!</p>
                </div>
              ) : (
                selectedBuildingInfo.restrooms.map(r => (
                  <div key={r.id} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 space-y-3">

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                        {r.floor}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFavorite(r.id)}
                          className="text-amber-400 hover:scale-125 transition-transform p-1"
                        >
                          {r.isFavorite ? '★' : '☆'}
                        </button>
                        {r.isCreator && (
                          <>
                            <button
                              onClick={() => startEdit(r)}
                              className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
                              title="수정"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/40 p-3 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Password</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-800 font-mono tracking-widest truncate">
                            {showPasswordMap[r.id] ? r.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => toggleShowPassword(r.id)}
                            className="text-xs opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            {showPasswordMap[r.id] ? '👁️‍🗨️' : '👁️'}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyPassword(r.password)}
                        className="flex-shrink-0 text-xs px-3 py-2 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg font-bold text-slate-500 active:scale-95 transition-all"
                      >
                        복사
                      </button>
                    </div>

                    {r.memo && (
                      <div className="text-xs text-slate-600 bg-white/40 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                        {r.memo}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span>작성자: {r.creatorNickname}</span>
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full sm:w-[90%] sm:max-w-[420px] bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 relative">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <span>🚽</span> 화장실 정보 공유하기
            </h3>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">층수 정보</label>
                <input
                  type="text"
                  placeholder="예: 2F, B1, 10층 등"
                  value={regFloor}
                  onChange={(e) => setRegFloor(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm font-medium text-slate-800 transition-all placeholder-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">비밀번호</label>
                <input
                  type="text"
                  placeholder="비밀번호(평문) 입력"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm font-medium text-slate-800 transition-all placeholder-slate-400 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">추가 메모 (옵션)</label>
                <textarea
                  placeholder="예: 휴지 비치됨, 문이 무거움 등"
                  value={regMemo}
                  onChange={(e) => setRegMemo(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm font-medium text-slate-800 transition-all placeholder-slate-400 h-20 resize-none"
                />
              </div>
              <div className="flex gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsRegModalOpen(false)}
                  className="flex-1 !w-auto"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="flex-1 !w-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold"
                >
                  등록 완료
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 화장실 수정 모달 */}
      {editingRestroom && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full sm:w-[90%] sm:max-w-[420px] bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 relative">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <span>✏️</span> 화장실 정보 수정하기
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">층수 정보</label>
                <input
                  type="text"
                  placeholder="예: 2F, B1, 10층 등"
                  value={editFloor}
                  onChange={(e) => setEditFloor(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm font-medium text-slate-800 transition-all placeholder-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">비밀번호</label>
                <input
                  type="text"
                  placeholder="비밀번호(평문) 입력"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm font-medium text-slate-800 transition-all placeholder-slate-400 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">추가 메모 (옵션)</label>
                <textarea
                  placeholder="예: 휴지 비치됨, 문이 무거움 등"
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm font-medium text-slate-800 transition-all placeholder-slate-400 h-20 resize-none"
                />
              </div>
              <div className="flex gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingRestroom(null)}
                  className="flex-1 !w-auto"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="flex-1 !w-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold"
                >
                  수정 완료
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MainPage;
