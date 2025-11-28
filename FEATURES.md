# 🎮 HabitQuest Features

## ✅ Implemented Features (v0.4.0)

### 🆕 Latest: v0.4.0 - Complete UI Implementation

#### UI Component Library
**Common Components (5개):**
- `Card` - Flexible card layouts with variants (default, bordered, elevated)
- `Badge` - Status badges with 6 variants + specialized RarityBadge and DifficultyBadge
- `Progress` - ProgressBar and CircularProgress for tracking
- `States` - EmptyState, LoadingState, ErrorState for common UI states
- `Icons` - 8 game-specific SVG icons (Coins, Gems, Exp, Flame, Trophy, Energy, Quest, CheckCircle)

**Game-Specific Components (3개):**
- `QuestCard` - Display quests with progress, rewards, and claim functionality
- `ItemCard` - Display items in shop/inventory modes with purchase/use/equip actions
- `AchievementCard` - Show achievements with tier badges and progress tracking

#### Complete Page Implementations (7개)
**Main Pages:**
- **Quests Page** (`/quests`) - Daily/Weekly/All quests with progress tracking and reward claiming
  - Tab-based filtering (일일/주간/전체)
  - Quest stats cards (전체/완료/받을 보상)
  - Real-time progress updates
  - One-click reward claiming

- **Inventory Page** (`/inventory`) - Item management with use/equip functionality
  - Type-based filtering (전체/소모품/코스메틱/부스트/특별)
  - Slot usage tracking
  - Item quantity display
  - Use/Equip actions with confirmations

- **Shop Page** (`/shop`) - Item purchasing with gold/gems
  - Category filtering
  - Dual currency display (골드/젬)
  - Purchase confirmations
  - Help information section

- **Achievements Page** (`/achievements`) - Achievement tracking with comprehensive filters
  - Status filters (전체/진행 중/완료)
  - Category filters (습관/퀘스트/소셜/수집/특별)
  - Achievement stats (완료율, 획득 경험치/골드/젬)
  - Progress bars for incomplete achievements

**Social Pages:**
- **Friends Page** (`/social/friends`) - Friend management system
  - Friend request by email
  - Pending requests with accept/decline
  - Friend list with level and streak display
  - Real-time updates

- **Guilds Page** (`/social/guilds`) - Guild management
  - My Guild tab (길드 정보, 회원 목록, 레벨/경험치)
  - Top Guilds tab (인기 길드 순위)
  - Create/Join/Leave functionality
  - Public/Private guild settings
  - Member roles (길드장/임원/회원)

- **Leaderboard Page** (`/leaderboard`) - Rankings and competition
  - 4 ranking types (레벨/연속 기록/퀘스트/업적)
  - 4 time periods (일간/주간/월간/전체)
  - User rank highlight
  - Medal display for top 3
  - Percentile calculation

#### Navigation System
**Desktop Sidebar:**
- Fixed sidebar navigation (64px width)
- Categorized menu (메인/소셜)
- Active state highlighting
- User profile section
- Smooth transitions

**Mobile Bottom Navigation:**
- 5 key features (홈/퀘스트/상점/소셜/랭킹)
- Icon + label display
- Active state highlighting
- Fixed positioning

#### Technical Implementation
**All pages include:**
- React Query for data fetching and caching
- Loading, error, and empty states
- Responsive design (mobile & desktop)
- Dark mode support
- Real-time UI updates via optimistic updates
- Tab-based filtering and organization
- Stats cards and info sections
- Proper TypeScript typing
- Accessible navigation
- User-friendly error messages

---

## Previous Versions

### v0.3.0 - Backend Systems & Business Logic

### 1. **인프라 및 개발 환경**

#### Docker 기반 로컬 개발
- PostgreSQL 16 컨테이너
- Redis 캐싱 서버
- 자동 헬스체크 및 볼륨 관리
- `./scripts/setup-local.sh` - 원클릭 환경 설정
- `./scripts/reset-db.sh` - 데이터베이스 리셋

#### 환경 변수 관리
- `.env.example` - 전체 환경 변수 템플릿
- `.env.local.example` - 빠른 시작용 최소 설정
- 자동 NEXTAUTH_SECRET 생성
- Zod를 통한 환경 변수 검증

---

### 2. **데이터베이스 아키텍처**

#### 확장된 Prisma 스키마
**총 20개 모델, 700+ 라인**

**핵심 모델:**
- `User` - 사용자 계정 및 구독 정보
- `Character` - RPG 캐릭터 (레벨, 스탯, 외형)
- `Habit` - 습관 추적 (난이도, 빈도, 보상)
- `Streak` - 연속 달성 시스템
- `Quest` - 퀘스트 시스템 (일일/주간/이벤트)
- `QuestProgress` - 퀘스트 진행상황
- `Item` - 아이템 시스템 (소비/장비/코스메틱)
- `InventoryItem` - 사용자 인벤토리
- `Achievement` - 업적 시스템
- `UserAchievement` - 사용자별 업적 진행도
- `SubscriptionTransaction` - 결제/구독 관리
- `Guild` - 길드 시스템
- `GuildMember` - 길드 멤버십
- `Friendship` - 친구 관계
- `Leaderboard` - 순위표 (캐싱용)
- `NotificationSettings` - 알림 설정
- `ActivityLog` - 활동 로그 (분석용)

**Enums (14개):**
- 구독 티어, 캐릭터 클래스, 습관 카테고리
- 퀘스트 타입/목표, 아이템 타입/등급
- 업적 카테고리/등급, 결제 제공자
- 리더보드 타입/기간 등

#### 데이터베이스 시드
- 4개 기본 아이템 (에너지 포션, 스트릭 프리즈, 부스트)
- 4개 퀘스트 (일일/주간)
- 8개 업적 (첫 걸음, 습관의 달인, 연속 달성 등)

---

### 3. **인증 시스템 (NextAuth.js)**

#### OAuth 프로바이더
- **Kakao** - 카카오 로그인
- **Google** - 구글 로그인
- **Apple** - 애플 로그인

#### 자동 사용자 초기화
회원가입 시 자동 생성:
- 기본 캐릭터 (RANGER 클래스)
- 스트릭 레코드
- 알림 설정
- 스타터 아이템 (에너지 포션 x3, 스트릭 프리즈 x1)
- 모든 업적 진행도 초기화

#### 세션 관리
- JWT 전략
- 30일 세션 유지
- 캐릭터 정보 자동 로드
- 활동 로그 자동 기록

---

### 4. **결제 시스템**

#### 지원 결제 플랫폼
- **Toss Payments** (한국)
- **Stripe** (글로벌)

#### 구독 플랜
| 플랜 | 가격 | 혜택 |
|------|------|------|
| **FREE** | 무료 | 기본 습관 추적, 일일 에너지 5개 |
| **PREMIUM** | ₩9,900/월 | 무제한 습관, 일일 에너지 15개, 모든 퀘스트, 전용 코스튬 |
| **FAMILY** | ₩19,900/월 | 프리미엄 + 최대 5명, 가족 통계, 가족 퀘스트 |

#### 결제 기능
- 구독 생성 및 결제 리다이렉션
- 결제 검증 및 완료 처리
- 구독 취소
- 환불 처리
- 웹훅 처리 (결제 상태 자동 업데이트)

#### API 엔드포인트
```
GET  /api/subscription/plans    # 플랜 목록
POST /api/subscription/create   # 구독 생성
POST /api/subscription/verify   # 결제 검증
POST /api/subscription/cancel   # 구독 취소
POST /api/subscription/webhook  # 웹훅 처리
```

---

### 5. **퀘스트 시스템**

#### 퀘스트 타입
- **DAILY** - 일일 퀘스트 (매일 리셋)
- **WEEKLY** - 주간 퀘스트 (매주 리셋)
- **EVENT** - 이벤트 퀘스트 (기간 한정)
- **ACHIEVEMENT** - 업적 퀘스트
- **STORY** - 스토리 퀘스트

#### 목표 타입
- 습관 N개 완료
- 특정 카테고리 습관 완료
- 특정 습관 완료
- N일 연속 달성
- 레벨 도달
- 경험치/골드 획득
- 모든 일일 습관 완료

#### 비즈니스 로직
- `updateQuestProgress()` - 퀘스트 진행도 업데이트
- `claimQuestReward()` - 보상 수령
- `checkQuestTrigger()` - 자동 퀘스트 트리거
- `getDailyQuests()` / `getWeeklyQuests()` - 퀘스트 조회

---

### 6. **인벤토리 & 아이템 시스템**

#### 아이템 타입
- **CONSUMABLE** - 소비 아이템 (에너지 회복, 스트릭 프리즈)
- **EQUIPMENT** - 장비
- **COSMETIC** - 코스메틱 (의상, 악세서리, 펫)
- **BOOST** - 부스트 (경험치/골드 증가)
- **MATERIAL** - 재료
- **SPECIAL** - 특수 아이템

#### 아이템 등급
- COMMON (일반)
- UNCOMMON (고급)
- RARE (희귀)
- EPIC (영웅)
- LEGENDARY (전설)

#### 비즈니스 로직
- `useItem()` - 아이템 사용
- `purchaseItem()` - 아이템 구매 (골드/젬)
- `equipItem()` - 코스메틱 장착
- `getInventory()` - 인벤토리 조회
- `getShopItems()` - 상점 아이템 목록

---

### 7. **업적 시스템**

#### 업적 카테고리
- **HABITS** - 습관 관련
- **STREAKS** - 연속 달성
- **SOCIAL** - 소셜
- **COLLECTION** - 수집
- **PROGRESSION** - 성장
- **SPECIAL** - 특별

#### 업적 등급
- BRONZE (동메달)
- SILVER (은메달)
- GOLD (금메달)
- PLATINUM (백금)
- DIAMOND (다이아)

#### 업적 목표 타입
- 총 완료 횟수
- 최장 연속 달성
- 레벨 도달
- 퀘스트 완료 수
- 총 경험치/골드
- 아이템 수집
- 친구 수
- 길드 기여도
- 완벽한 주 (모든 습관 완료)
- 아침형 인간 / 올빼미족

#### 비즈니스 로직
- `checkAchievementProgress()` - 업적 진행도 확인 및 자동 해제
- `getUserAchievements()` - 사용자 업적 목록
- `getAchievementStats()` - 업적 통계

---

### 8. **소셜 기능**

#### 친구 시스템
- `sendFriendRequest()` - 친구 요청 보내기
- `acceptFriendRequest()` - 친구 수락
- `declineFriendRequest()` - 친구 거절
- `removeFriend()` - 친구 삭제
- `getFriends()` - 친구 목록
- `getPendingRequests()` - 대기 중인 요청

#### 길드 시스템
- `createGuild()` - 길드 생성
- `joinGuild()` - 길드 가입
- `leaveGuild()` - 길드 탈퇴
- `getGuildInfo()` - 길드 정보
- `getTopGuilds()` - 상위 길드 순위
- `contributeToGuild()` - 길드 기여

#### 리더보드
- **LEVEL** - 레벨 순위
- **STREAK** - 연속 달성 순위
- **TOTAL_EXP** - 총 경험치 순위
- **WEEKLY_POINTS** - 주간 포인트
- **GUILD_POINTS** - 길드 포인트

**기간별 리더보드:**
- DAILY (일일)
- WEEKLY (주간)
- MONTHLY (월간)
- ALL_TIME (전체)

**API:**
- `updateLeaderboard()` - 리더보드 업데이트
- `getLeaderboard()` - 리더보드 조회
- `getUserRank()` - 사용자 순위 조회

---

### 9. **활동 로깅 & 분석**

#### 추적되는 이벤트
- 로그인/로그아웃
- 습관 완료
- 퀘스트 완료
- 레벨업
- 업적 해제
- 아이템 구매/사용
- 구독 시작/갱신/취소
- 친구 추가
- 길드 가입/탈퇴

---

### 10. **코드 품질 (v0.2.0 기반)**

- ✅ Jest + React Testing Library (70%+ 커버리지)
- ✅ Husky + lint-staged (pre-commit 훅)
- ✅ Prettier (자동 포매팅)
- ✅ Zod 입력 검증
- ✅ GitHub Actions CI/CD
- ✅ 보안 스캐닝 (npm audit)
- ✅ CONTRIBUTING.md / CODE_OF_CONDUCT.md
- ✅ ARCHITECTURE.md (시스템 설계 문서)

---

## 📋 다음 단계 (향후 구현)

### 핵심 페이지
- 대시보드 페이지 (통계 및 개요)
- 습관 관리 페이지 (습관 추가/수정/삭제)
- 캐릭터 페이지 (스탯, 장착 아이템, 외형)
- 프로필 설정 페이지

### 추가 기능
- 푸시 알림 (FCM)
- 이메일 알림 (SMTP)
- 실시간 채팅 (길드)
- PWA 지원 (모바일 앱)
- 다국어 지원 (i18n)
- 데이터 분석 대시보드
- 관리자 패널

---

## 🏗️ 아키텍처

```
HabitQuest/
├── prisma/
│   ├── schema.prisma (700+ lines, 20 models)
│   └── seed.ts (초기 데이터)
├── lib/
│   ├── auth.ts (NextAuth 설정)
│   ├── prisma.ts (Prisma 클라이언트)
│   ├── exp.ts, streak.ts, energy.ts (기존 로직)
│   ├── payment/ (결제 시스템)
│   │   ├── types.ts
│   │   ├── toss.ts (Toss Payments)
│   │   ├── stripe.ts (Stripe)
│   │   └── index.ts (PaymentManager)
│   ├── quest/
│   │   └── quest.ts (퀘스트 비즈니스 로직)
│   ├── inventory/
│   │   └── inventory.ts (아이템/인벤토리 로직)
│   ├── achievements/
│   │   └── achievements.ts (업적 로직)
│   └── social/
│       ├── friends.ts (친구 시스템)
│       ├── guilds.ts (길드 시스템)
│       └── leaderboards.ts (리더보드)
├── components/
│   ├── ui/ (공통 UI 컴포넌트)
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── states.tsx
│   │   └── icons.tsx
│   └── game/ (게임 특화 컴포넌트)
│       ├── quest-card.tsx
│       ├── item-card.tsx
│       └── achievement-card.tsx
├── app/
│   ├── (app)/
│   │   ├── layout.tsx (네비게이션 포함)
│   │   ├── quests/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── shop/page.tsx
│   │   ├── achievements/page.tsx
│   │   ├── social/
│   │   │   ├── friends/page.tsx
│   │   │   └── guilds/page.tsx
│   │   └── leaderboard/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── subscription/
│       ├── quests/
│       ├── inventory/
│       ├── shop/
│       ├── achievements/
│       ├── social/
│       └── leaderboard/
├── scripts/
│   ├── setup-local.sh
│   └── reset-db.sh
├── docker-compose.yml
├── .env.example
└── README.local.md (로컬 개발 가이드)
```

---

## 📊 통계

- **총 코드 라인**: ~8,000+ lines (v0.4.0)
- **데이터베이스 모델**: 20개
- **Enums**: 14개
- **비즈니스 로직 모듈**: 8개
- **API 엔드포인트**: 15개 (구독 5개 + 게임 시스템 10개)
- **UI 컴포넌트**: 8개 (공통 5개 + 게임 3개)
- **페이지**: 7개 (퀘스트, 인벤토리, 상점, 업적, 친구, 길드, 리더보드)
- **시드 데이터**: 16개 항목
- **테스트 커버리지**: 70%+

---

## 🚀 빠른 시작

```bash
# 1. 환경 설정
./scripts/setup-local.sh

# 2. 개발 서버 시작
npm run dev

# 3. Prisma Studio (데이터베이스 GUI)
npm run db:studio
```

자세한 내용은 [README.local.md](./README.local.md)를 참고하세요.
