# HabitQuest 아키텍처 문서

## 목차

- [개요](#개요)
- [기술 스택](#기술-스택)
- [시스템 아키텍처](#시스템-아키텍처)
- [데이터 모델](#데이터-모델)
- [API 설계](#api-설계)
- [비즈니스 로직](#비즈니스-로직)
- [보안](#보안)
- [성능 최적화](#성능-최적화)
- [확장성](#확장성)

## 개요

HabitQuest는 RPG 게이미피케이션 요소를 활용한 습관 형성 앱입니다. 모노리식 Next.js 애플리케이션으로 시작하여 필요에 따라 마이크로서비스로 분리할 수 있도록 설계되었습니다.

### 핵심 설계 원칙

1. **타입 안전성**: TypeScript strict 모드로 런타임 에러 최소화
2. **모듈성**: 기능별로 명확히 분리된 모듈 구조
3. **테스트 가능성**: 비즈니스 로직과 UI 로직 분리
4. **확장성**: 초기 MVP부터 대규모 서비스까지 확장 가능
5. **보안 우선**: 입력 검증, 인증/인가, 데이터 보호

## 기술 스택

### Frontend

- **Next.js 14**: React 프레임워크 (App Router)
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 우선 스타일링
- **Framer Motion**: 60fps 애니메이션
- **Zustand**: 경량 상태 관리
- **React Query**: 서버 상태 관리

### Backend

- **Next.js API Routes**: 서버리스 API
- **Prisma**: Type-safe ORM
- **PostgreSQL**: 관계형 데이터베이스
- **Zod**: 런타임 스키마 검증

### Infrastructure

- **Vercel**: 프론트엔드 배포
- **Railway/Supabase**: PostgreSQL 호스팅
- **Redis** (선택): 캐싱, 리더보드
- **Cloudflare R2**: 이미지 스토리지

## 시스템 아키텍처

### 레이어 구조

\`\`\`
┌─────────────────────────────────────┐
│         Presentation Layer          │
│   (Next.js Pages & Components)      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Application Layer           │
│     (API Routes, Server Actions)    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Business Logic Layer        │
│  (lib/*: exp, streak, energy, etc)  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          Data Access Layer          │
│         (Prisma + PostgreSQL)       │
└─────────────────────────────────────┘
\`\`\`

### 디렉토리 구조

\`\`\`
habitquest/
├── app/                    # Next.js App Router
│   ├── (app)/             # 인증된 사용자 영역
│   │   ├── dashboard/     # 대시보드
│   │   ├── habits/        # 습관 관리
│   │   ├── character/     # 캐릭터
│   │   └── social/        # 소셜 기능
│   ├── (auth)/            # 인증 페이지
│   ├── api/               # API Routes
│   │   ├── habits/        # 습관 CRUD
│   │   ├── character/     # 캐릭터 관리
│   │   └── quest/         # 퀘스트 완료
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 랜딩 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   ├── habits/           # 습관 관련 컴포넌트
│   ├── character/        # 캐릭터 관련 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                   # 비즈니스 로직
│   ├── exp.ts            # 경험치 계산
│   ├── streak.ts         # 스트릭 시스템
│   ├── energy.ts         # 에너지 시스템
│   ├── prisma.ts         # Prisma 클라이언트
│   └── validation/       # Zod 스키마
├── types/                 # TypeScript 타입
├── utils/                 # 유틸리티 함수
├── prisma/               # Prisma 스키마
│   └── schema.prisma
└── __tests__/            # 테스트 파일
\`\`\`

## 데이터 모델

### ERD (주요 엔티티)

\`\`\`
User ──┬── Character (1:1)
       ├── Habit (1:N)
       ├── Streak (1:1)
       └── GuildMember (1:N)

Habit ── HabitCompletion (1:N)

Guild ── GuildMember (1:N)
\`\`\`

### 핵심 엔티티

#### User
- 인증 정보 (NextAuth)
- 구독 정보 (FREE/PREMIUM/FAMILY)
- 에너지 시스템

#### Character
- RPG 요소 (레벨, EXP, 스탯)
- 외형 커스터마이징 (코스튬, 펫, 아우라)
- 재화 (골드, 젬)
- 칭호/업적

#### Habit
- 습관 정보 (이름, 설명, 카테고리)
- 빈도 설정 (매일, 주간, 커스텀)
- 게이미피케이션 (난이도, 보상)
- 진행 추적 (스트릭, 완료 횟수)

#### Streak
- 연속 달성 추적
- 스트릭 프리즈 기능
- 마일스톤 기록

## API 설계

### RESTful API 규칙

\`\`\`
GET    /api/habits              # 습관 목록 조회
POST   /api/habits              # 습관 생성
GET    /api/habits/[id]         # 습관 상세 조회
PATCH  /api/habits/[id]         # 습관 수정
DELETE /api/habits/[id]         # 습관 아카이브

GET    /api/character           # 캐릭터 조회
PATCH  /api/character           # 캐릭터 업데이트

POST   /api/quest/complete      # 퀘스트 완료
\`\`\`

### API 응답 형식

\`\`\`typescript
// 성공
{
  "data": { ... },
  "meta": { ... }  // 페이지네이션 등
}

// 에러
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [ ... ]
  }
}
\`\`\`

## 비즈니스 로직

### 1. 경험치 & 레벨 시스템

**위치**: `lib/exp.ts`

\`\`\`typescript
// 레벨업 공식: baseExp * (level ^ 1.5)
function calculateExpToNextLevel(level: number): number {
  const baseExp = 100
  return Math.floor(baseExp * Math.pow(level, 1.5))
}
\`\`\`

**주요 기능**:
- 레벨 계산
- EXP 진행도 계산
- 레벨업 감지
- 클래스별 스탯 증가

### 2. 스트릭 시스템

**위치**: `lib/streak.ts`

\`\`\`typescript
// 스트릭 검증 로직
function checkStreak(
  lastActiveDate: Date,
  currentStreak: number,
  streakFreezes: number
): StreakResult {
  const daysDiff = differenceInDays(today, lastActive)

  if (daysDiff === 1) return 'continued'
  if (daysDiff === 2 && streakFreezes > 0) return 'freeze_used'
  return 'broken'
}
\`\`\`

**주요 기능**:
- 스트릭 연속성 검증
- 프리즈 사용 처리
- 마일스톤 체크 (7일, 30일, 100일 등)

### 3. 에너지 시스템

**위치**: `lib/energy.ts`

**무료 사용자**:
- 최대 에너지: 5
- 재생 속도: 1시간당 1개

**프리미엄 사용자**:
- 무제한 에너지

### 4. 퀘스트 완료 플로우

\`\`\`
1. 입력 검증 (Zod)
2. 오늘 이미 완료했는지 확인
3. 트랜잭션 시작
   a. HabitCompletion 생성
   b. Habit 통계 업데이트
   c. Character EXP/골드 증가
   d. 레벨업 처리
   e. Streak 업데이트
   f. 마일스톤 보상 지급
4. 트랜잭션 커밋
5. 결과 반환
\`\`\`

## 보안

### 1. 인증 & 인가

- **NextAuth.js**: OAuth (카카오, 구글, 애플)
- **Session 관리**: JWT 토큰
- **API 보호**: Middleware로 인증 확인

### 2. 입력 검증

\`\`\`typescript
// Zod 스키마로 런타임 검증
const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['FITNESS', 'LEARNING', ...]),
  // ...
})

// API에서 사용
const validated = createHabitSchema.parse(body)
\`\`\`

### 3. SQL Injection 방지

- Prisma ORM 사용으로 자동 방지
- 모든 쿼리는 파라미터화됨

### 4. XSS 방지

- React의 자동 이스케이핑
- `dangerouslySetInnerHTML` 사용 금지
- Content Security Policy 설정

### 5. CSRF 방지

- NextAuth가 자동 처리
- SameSite 쿠키 설정

## 성능 최적화

### 1. 렌더링 최적화

- **Server Components 우선**: 기본적으로 서버에서 렌더링
- **Client Components 최소화**: 필요한 경우만 'use client'
- **Code Splitting**: 동적 import 활용

\`\`\`typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
})
\`\`\`

### 2. 데이터 Fetching

- **React Query**: 캐싱 및 자동 재검증
- **Parallel Fetching**: Promise.all 활용
- **Pagination**: 대량 데이터는 페이지네이션

### 3. 이미지 최적화

- **Next.js Image**: 자동 최적화 및 lazy loading
- **WebP 형식**: 압축률 향상
- **Responsive Images**: srcset 자동 생성

### 4. 캐싱 전략

\`\`\`typescript
// Static Data: ISR (Incremental Static Regeneration)
export const revalidate = 3600 // 1시간

// Dynamic Data: Cache-Control headers
export const dynamic = 'force-dynamic'

// Redis 캐싱 (선택적)
const leaderboard = await redis.get('leaderboard:weekly')
\`\`\`

## 확장성

### 수평 확장 (Horizontal Scaling)

1. **Stateless API**: 세션 데이터를 DB/Redis에 저장
2. **Connection Pooling**: Prisma 연결 풀 최적화
3. **CDN**: 정적 자산은 Vercel Edge Network

### 수직 확장 (Vertical Scaling)

1. **Database Optimization**:
   - 인덱스 최적화
   - Query 성능 분석
   - Read Replica 도입 고려

2. **Caching Layers**:
   - Redis for session & leaderboards
   - CDN for static assets
   - Application-level caching

### 마이크로서비스 분리 (향후)

\`\`\`
현재: Monolith

향후 분리 가능한 서비스:
- Auth Service
- Character Service
- Habit Tracking Service
- Social/Guild Service
- Notification Service
- Analytics Service
\`\`\`

## 모니터링 & 분석

### 성능 모니터링

- Vercel Analytics
- Web Vitals (LCP, FID, CLS)

### 에러 트래킹

- Sentry (선택적)

### 비즈니스 분석

- Mixpanel / PostHog
- 핵심 이벤트 추적:
  - 습관 생성/완료
  - 레벨업
  - 스트릭 마일스톤
  - 구독 전환

## 향후 개선 사항

1. **마이크로서비스 아키텍처**: 서비스 분리
2. **GraphQL**: 유연한 데이터 Fetching
3. **WebSocket**: 실시간 알림
4. **PWA**: 오프라인 지원
5. **E2E 테스트**: Playwright/Cypress
6. **A/B 테스팅**: 기능 플래그 시스템

---

**마지막 업데이트**: 2025-11-27
**작성자**: HabitQuest Development Team
