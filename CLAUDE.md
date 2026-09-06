# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**똥쟁이 지도** — 카카오 OAuth로 로그인 후 카카오 지도에서 건물을 선택해 화장실 비밀번호를 등록·조회하는 커뮤니티 서비스. 모노레포 구조로 프론트엔드와 백엔드가 한 저장소에 있다.

---

## 개발 명령어

### 프론트엔드 (`ddongjaengi-frontend/`)

```bash
npm run dev       # 개발 서버 (포트 5173, 사용 중이면 5174)
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
npm run preview   # 빌드 결과 로컬 미리보기
```

### 백엔드 (`ddongjaengi-backend/`)

```bash
./gradlew bootRun          # 개발 서버 실행 (포트 8080)
./gradlew build            # 빌드 + 테스트
./gradlew test             # 테스트만 실행
./gradlew build -x test    # 테스트 제외 빌드
```

---

## 환경변수 설정

### 프론트엔드 (`ddongjaengi-frontend/.env`)

| 키 | 설명 |
|---|---|
| `VITE_KAKAO_MAP_APP_KEY` | 카카오 지도 JavaScript 키 (REST API 키 아님) |
| `VITE_KAKAO_CLIENT_ID` | 카카오 OAuth 클라이언트 ID |
| `VITE_KAKAO_REDIRECT_URI` | OAuth 리다이렉트 URI |
| `VITE_API_BASE_URL` | 백엔드 URL (기본값: `http://localhost:8080/api`) |

### 백엔드 (`application-local.yml`)

활성 프로파일은 `local`이 기본. MySQL은 `localhost:3306/ddongjaengi`, `ddl-auto: validate`이므로 **스키마 변경은 `docs/ddl.sql`을 직접 수정해서 반영**해야 한다.

---

## 아키텍처

### 프론트엔드

```
App.jsx  (BrowserRouter + PrivateRoute)
├── /login           → LoginPage.jsx         (공개)
├── /oauth/callback/kakao → KakaoCallback.jsx (OAuth 리다이렉트 수신)
└── /               → MainPage.jsx           (PrivateRoute: localStorage accessToken 필수)
```

**인증 흐름:**
1. `LoginPage` → 카카오 인가 URL로 직접 이동
2. `KakaoCallback` → `http://localhost:8080/api/auth/kakao?code=...` 에 raw axios 호출 → `accessToken` localStorage 저장 후 `/` 이동
3. `useAuth` 훅 → 마운트 시 `userAPI.getMe()`로 사용자 정보 로드

**주의:** `KakaoCallback.jsx`는 `api.js`의 인터셉터를 거치지 않는 raw axios 호출을 사용한다. 백엔드 URL이 하드코딩(`http://localhost:8080`)되어 있어 환경변수가 적용되지 않는다.

**API 계층 (`src/services/api.js`):**
- axios 인스턴스에 요청 인터셉터(Bearer 토큰 자동 삽입)와 응답 인터셉터(401 시 refresh 토큰으로 자동 갱신) 포함
- React Query가 `main.jsx`에 설정되어 있지만 현재 페이지들은 `useQuery`를 쓰지 않고 `useState` + `useEffect` + 직접 API 호출 방식 사용

**CSS 주의사항:**
`tailwind.config.js`에 커스텀 색상(`primary`, `surface`, `bg` 등)이 정의되어 있으나, Tailwind JIT가 이 색상 클래스를 CSS로 생성하지 못하는 경우가 있었다. 색상을 적용할 때는 반드시 **인라인 `style={{ }}` 또는 `bg-[#hex]` 형태의 arbitrary value**를 사용한다.

```jsx
// 위험 — bg-surface가 CSS에 포함되지 않을 수 있음
<div className="bg-surface">

// 안전
<div style={{ backgroundColor: '#FFFFFF' }}>
<div className="bg-[#F2F4F6]">
```

### 백엔드

```
Controller → Service → Repository (JPA)
```

**인증:** Spring Security 미사용. `JwtInterceptor`(HandlerInterceptor)가 `Authorization: Bearer` 헤더를 검증하고 `userId`를 request attribute에 저장. `@LoginUser` 커스텀 어노테이션 + `LoginUserArgumentResolver`가 컨트롤러 파라미터로 주입.

**핵심 엔티티 관계:**
- `Restroom` → `Building` (N:1, LAZY), `User` (N:1, LAZY), `Category` (N:1, LAZY, nullable)
- `Building`은 카카오 PlaceID(`kakaoPlaceId`)로 중복 방지. 지도 직접 클릭 시 `CLI_{lat}_{lng}` 형태의 가상 ID 사용
- `isFavorite`은 `Restroom` 엔티티에 직접 저장 (사용자별 즐겨찾기 테이블 없음 — 현재 구조의 제약)

**비밀번호 암호화:**
`AesUtil`이 `crypto.aes-secret-key` 값으로 AES-CBC/PKCS5Padding 암호화. DB에는 암호화된 값만 저장, 응답 DTO에서 복호화해서 반환.

**카카오 OAuth 처리 (`KakaoAuthService`):**
Spring WebFlux(`WebClient`)로 카카오 토큰 교환 및 사용자 정보 조회. 사용자는 `kakaoId`로 찾거나 신규 생성.

**지도 범위 검색:**
프론트에서 지도 이동이 멈출 때(`idle` 이벤트) 현재 뷰포트의 SW/NE 좌표를 쿼리파라미터로 전송 → `BuildingRepository.findByLatitudeBetweenAndLongitudeBetween` → Fetch Join으로 화장실 목록 반환.

---

## 커밋 컨벤션

형식: `<type>(<scope>): <subject>` (한글 우선, 50자 이내, 명령형, 마침표 없음)

**타입:** `feat` `fix` `design` `style` `refactor` `docs` `test` `chore` `perf` `init`

**프론트엔드 스코프:** `map` `auth` `restroom` `modal` `list` `search` `ui` `config`

**백엔드 스코프:** `api` `service` `repository` `security` `config` `entity`

**브랜치:** `<type>/<issue-number>-<short-description>` (예: `feat/12-kakao-map-integration`)
