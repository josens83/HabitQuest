# 📱 PWA (Progressive Web App) 가이드

HabitQuest는 Progressive Web App으로 구현되어 모바일 앱처럼 설치하고 사용할 수 있습니다.

## ✨ 주요 기능

### 1. 앱 설치
- **홈 화면에 추가**: 브라우저 메뉴에서 "홈 화면에 추가" 선택
- **자동 설치 프롬프트**: 웹사이트 방문 시 설치 안내 자동 표시
- **크로스 플랫폼**: Android, iOS, Desktop에서 모두 설치 가능

### 2. 오프라인 지원
- **네트워크 우선 전략**: 온라인일 때는 최신 데이터, 오프라인일 때는 캐시 사용
- **오프라인 페이지**: 연결이 끊어졌을 때 안내 페이지 표시
- **자동 재연결**: 네트워크 복구 시 자동으로 최신 데이터 로드

### 3. 성능 최적화
- **Service Worker**: 백그라운드에서 리소스 캐싱 및 관리
- **빠른 로딩**: 캐시된 리소스로 즉시 로드
- **적은 데이터 사용**: 한 번 로드한 리소스 재사용

## 🚀 설치 방법

### Android (Chrome/Edge)
1. HabitQuest 웹사이트 방문
2. 주소창 오른쪽의 "설치" 아이콘 클릭
3. 또는 메뉴 → "앱 설치" 선택
4. "설치" 버튼 클릭

### iOS (Safari)
1. HabitQuest 웹사이트 방문
2. 하단 공유 버튼 (📤) 탭
3. "홈 화면에 추가" 선택
4. "추가" 버튼 탭

### Desktop (Chrome/Edge)
1. HabitQuest 웹사이트 방문
2. 주소창 오른쪽의 설치 아이콘 클릭
3. "설치" 버튼 클릭

## 📂 PWA 구성 파일

### 1. manifest.json
```json
{
  "name": "HabitQuest - 습관 형성 RPG 게임",
  "short_name": "HabitQuest",
  "start_url": "/dashboard",
  "display": "standalone",
  "theme_color": "#6366f1",
  "background_color": "#ffffff"
}
```

**위치**: `/public/manifest.json`

**주요 속성**:
- `name`: 앱 전체 이름
- `short_name`: 홈 화면 표시 이름
- `start_url`: 앱 시작 URL
- `display: standalone`: 브라우저 UI 없이 실행
- `theme_color`: 상단 바 색상
- `icons`: 다양한 크기의 앱 아이콘

### 2. Service Worker
Service Worker는 next-pwa가 자동 생성합니다.

**설정 위치**: `/next.config.js`

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [...],
})
```

**캐싱 전략**:
- **NetworkFirst**: 온라인 우선, 실패 시 캐시 사용
- 최대 200개 항목 캐시
- API 응답, 이미지, 정적 파일 모두 캐싱

### 3. 오프라인 페이지
**위치**: `/public/offline.html`

인터넷 연결이 끊어졌을 때 표시되는 페이지입니다.

**기능**:
- 연결 상태 안내
- 다시 시도 버튼
- 오프라인에서 가능한 기능 안내
- 자동 재연결 감지

### 4. 설치 프롬프트 컴포넌트
**위치**: `/components/pwa/install-prompt.tsx`

사용자에게 앱 설치를 안내하는 컴포넌트입니다.

**동작 방식**:
- 브라우저의 `beforeinstallprompt` 이벤트 감지
- 이미 설치된 경우 표시 안 함
- 사용자가 "나중에" 선택 시 localStorage에 저장

## 🧪 PWA 테스트

### 1. 로컬 환경에서 테스트
```bash
# 프로덕션 빌드 생성
npm run build

# 프로덕션 서버 실행
npm start
```

**주의**: PWA는 개발 모드에서 비활성화됩니다 (`disable: process.env.NODE_ENV === 'development'`)

### 2. Chrome DevTools로 테스트
1. Chrome에서 사이트 열기
2. F12 → Application 탭
3. **Manifest**: manifest.json 확인
4. **Service Workers**: SW 등록 상태 확인
5. **Storage**: 캐시 저장소 확인
6. **Lighthouse**: PWA 점수 측정

### 3. PWA 체크리스트
- [ ] HTTPS 또는 localhost에서 실행
- [ ] manifest.json 올바르게 연결됨
- [ ] Service Worker 등록됨
- [ ] 192x192, 512x512 아이콘 존재
- [ ] 오프라인에서 작동
- [ ] 설치 가능 (Lighthouse 확인)

## 🎨 아이콘 설정

### 필요한 아이콘 크기
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152 (iOS)
- 192x192 (Android)
- 384x384
- 512x512 (Android)

### 아이콘 생성 도구
- [PWA Image Generator](https://www.pwabuilder.com/imageGenerator)
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### 현재 상태
현재는 SVG 플레이스홀더 아이콘이 설정되어 있습니다.
프로덕션 배포 전에 실제 PNG 아이콘으로 교체해야 합니다.

## 📊 PWA 성능 최적화

### 1. 캐싱 전략 조정
```javascript
runtimeCaching: [
  {
    urlPattern: /^https?.*/,
    handler: 'NetworkFirst', // 또는 'CacheFirst', 'StaleWhileRevalidate'
    options: {
      cacheName: 'offlineCache',
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30일
      },
    },
  },
]
```

### 2. 선택적 캐싱
특정 URL 패턴만 캐싱하도록 설정 가능:
```javascript
{
  urlPattern: /^https:\/\/api\.habitquest\.com\/.*/i,
  handler: 'NetworkFirst',
}
```

### 3. 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP 포맷 활용
- Lazy loading 적용

## 🔧 트러블슈팅

### Service Worker가 업데이트 안 됨
```javascript
// Service Worker 강제 업데이트
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister())
  })
}
```

### 캐시 삭제
```javascript
// 모든 캐시 삭제
caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})
```

### iOS에서 설치 안 됨
- manifest.json의 `display: "standalone"` 확인
- 192x192 이상 아이콘 필수
- HTTPS 필수 (localhost 제외)

## 📚 참고 자료
- [Next.js PWA](https://github.com/shadowwalker/next-pwa)
- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev - PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)
