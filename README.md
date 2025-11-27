# 🎮 HabitQuest - 습관을 게임처럼, 성장을 모험처럼

[![CI](https://github.com/yourusername/habitquest/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/habitquest/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/yourusername/habitquest/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/habitquest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

RPG 캐릭터 육성처럼 재미있게 습관을 형성하는 게이미피케이션 앱

## 📋 프로젝트 개요

HabitQuest는 일본 모바일 게임 시장 1위 모노스트라이크의 게이미피케이션과 Duolingo의 스트릭 시스템을 결합하여, 사용자가 습관을 RPG 캐릭터 육성처럼 재미있게 형성할 수 있는 서비스입니다.

### 🎉 최신 업데이트 (v0.3.0)

- ✨ **완전한 데이터베이스 스키마**: 20개 모델, 700+ 라인 Prisma 스키마
- 🎮 **퀘스트 시스템**: 일일/주간/이벤트 퀘스트 with 진행도 추적
- 💎 **인벤토리 & 아이템**: 소비/장비/코스메틱 아이템, 상점 시스템
- 🏆 **업적 시스템**: 6개 카테고리, 5개 등급, 자동 진행도 추적
- 👥 **소셜 기능**: 친구, 길드, 리더보드 (비즈니스 로직 완성)
- 💳 **결제 시스템**: Toss Payments & Stripe 통합
- 🔐 **완전한 인증**: Kakao/Google/Apple OAuth with 자동 사용자 초기화
- 🐳 **Docker 환경**: PostgreSQL + Redis, 원클릭 로컬 설정
- 📊 **활동 로깅**: 14개 이벤트 타입 자동 추적

👉 자세한 내용은 [FEATURES.md](./FEATURES.md)를 확인하세요!

### ✨ 개선사항 (v0.2.0)

- ✅ **테스트 커버리지 70%+**: Jest + React Testing Library
- ✅ **코드 품질 자동화**: Husky + lint-staged + Prettier
- ✅ **입력 검증 강화**: Zod 스키마를 통한 타입 안전 검증
- ✅ **CI/CD 파이프라인**: GitHub Actions 자동화
- ✅ **포괄적인 문서화**: CONTRIBUTING.md, ARCHITECTURE.md, CODE_OF_CONDUCT.md
- ✅ **보안 강화**: 환경 변수 검증, 자동 보안 스캔

### 주요 기능

- ⚔️ **RPG 캐릭터 시스템**: 습관을 완료하고 경험치를 얻어 캐릭터 레벨업
- 🔥 **스트릭 시스템**: 연속 달성 추적 및 마일스톤 보상
- 🎯 **퀘스트 시스템**: 일일/주간/이벤트 퀘스트 with 자동 진행도
- 💎 **아이템 & 인벤토리**: 5개 등급, 6개 아이템 타입, 상점 시스템
- 🏆 **업적 시스템**: 12개 목표 타입, 자동 해제 및 보상
- 👥 **소셜 기능**: 친구, 길드, 리더보드 (4개 기간별)
- 💳 **프리미엄 구독**: Toss/Stripe 결제, 3개 구독 플랜
- 📊 **통계 & 분석**: 활동 로그, 리더보드, 길드 순위

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State**: Zustand + React Query
- **Charts**: Recharts

### Backend
- **Runtime**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (카카오, 구글, 애플)
- **Cache**: Redis (선택사항)

### Infrastructure
- **Hosting**: Vercel (권장)
- **Database**: Railway / Supabase / Neon
- **Storage**: Cloudflare R2 (이미지)
- **Analytics**: Mixpanel / PostHog

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- Docker & Docker Compose
- Git

### 🚀 빠른 시작 (권장)

\`\`\`bash
# 1. 저장소 클론
git clone https://github.com/yourusername/habitquest.git
cd habitquest

# 2. 자동 환경 설정 (Docker, DB, 패키지 등 모두 자동)
./scripts/setup-local.sh

# 3. 개발 서버 시작
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

📖 **자세한 로컬 개발 가이드**: [README.local.md](./README.local.md)

### 수동 설치

1. 저장소 클론
\`\`\`bash
git clone https://github.com/yourusername/habitquest.git
cd habitquest
\`\`\`

2. Docker 시작
\`\`\`bash
docker-compose up -d
\`\`\`

3. 패키지 설치
\`\`\`bash
npm install
\`\`\`

4. 환경 변수 설정
\`\`\`bash
cp .env.local.example .env.local
# .env.local 파일을 열고 NEXTAUTH_SECRET 설정
# openssl rand -base64 32
\`\`\`

5. 데이터베이스 마이그레이션
\`\`\`bash
npx prisma migrate dev --name init
npx prisma db seed
\`\`\`

6. 개발 서버 실행
\`\`\`bash
npm run dev
\`\`\`

## 📁 프로젝트 구조

\`\`\`
habitquest/
├── app/                    # Next.js App Router
│   ├── (app)/             # 인증된 사용자 페이지
│   │   ├── dashboard/     # 메인 대시보드
│   │   └── layout.tsx     # 앱 레이아웃
│   ├── (auth)/            # 인증 페이지
│   ├── api/               # API Routes
│   │   ├── habits/        # 습관 CRUD
│   │   ├── character/     # 캐릭터 관리
│   │   └── quest/         # 퀘스트 완료
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 랜딩 페이지
├── components/            # React 컴포넌트
├── lib/                   # 비즈니스 로직
│   ├── prisma.ts         # Prisma 클라이언트
│   ├── exp.ts            # 경험치 계산
│   ├── streak.ts         # 스트릭 로직
│   └── energy.ts         # 에너지 시스템
├── prisma/
│   └── schema.prisma     # 데이터베이스 스키마
├── types/                # TypeScript 타입 정의
├── utils/                # 유틸리티 함수
└── public/               # 정적 파일
\`\`\`

## 🎯 개발 로드맵

### ✅ Phase 1: MVP (현재)
- [x] 기본 습관 CRUD
- [x] 캐릭터 시스템 (레벨, EXP)
- [x] 스트릭 시스템
- [x] 기본 UI (홈, 습관, 캐릭터)
- [ ] 소셜 로그인 (카카오)

### 📋 Phase 2: 게이미피케이션 (다음)
- [ ] 에너지 시스템
- [ ] 퀘스트 완료 애니메이션
- [ ] 마일스톤 & 보상
- [ ] 캐릭터 커스터마이징

### 📋 Phase 3: 소셜
- [ ] 친구 시스템
- [ ] 리더보드
- [ ] 길드 시스템
- [ ] 챌린지

### 📋 Phase 4: 수익화
- [ ] 구독 결제 연동 (Stripe)
- [ ] 인앱 구매
- [ ] 광고 연동

## 🗄️ 데이터베이스 스키마

주요 테이블:
- `User`: 사용자 정보 및 구독 상태
- `Character`: RPG 캐릭터 (레벨, 스탯, 외형)
- `Habit`: 습관/퀘스트 정보
- `HabitCompletion`: 습관 완료 기록
- `Streak`: 스트릭 추적
- `Guild`: 길드 (향후)
- `Friendship`: 친구 관계 (향후)

자세한 스키마는 `prisma/schema.prisma`를 참조하세요.

## 🔧 주요 명령어

\`\`\`bash
# 개발
npm run dev              # 개발 서버 시작
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버 시작
npm run lint             # ESLint 실행

# 데이터베이스
npm run db:generate      # Prisma 클라이언트 생성
npm run db:push          # 스키마를 데이터베이스에 푸시
npm run db:studio        # Prisma Studio 실행
\`\`\`

## 📊 API 엔드포인트

### 습관 (Habits)
- `GET /api/habits?userId={id}` - 사용자의 모든 습관 조회
- `POST /api/habits` - 새 습관 생성
- `GET /api/habits/{habitId}` - 특정 습관 조회
- `PATCH /api/habits/{habitId}` - 습관 수정
- `DELETE /api/habits/{habitId}` - 습관 아카이브

### 캐릭터 (Character)
- `GET /api/character?userId={id}` - 캐릭터 조회
- `PATCH /api/character` - 캐릭터 업데이트

### 퀘스트 (Quest)
- `POST /api/quest/complete` - 습관 완료 (EXP, 스탯, 스트릭 업데이트)

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Indigo (#6366F1)
- **Secondary**: Pink (#EC4899)
- **Accent**: Amber (#F59E0B)
- **Stats**:
  - Strength: Red (#EF4444)
  - Intelligence: Blue (#3B82F6)
  - Vitality: Green (#10B981)
  - Spirit: Purple (#8B5CF6)
  - Charisma: Amber (#F59E0B)

### 반응형 디자인
- 모바일 우선 (Mobile First)
- 브레이크포인트: sm(640px), md(768px), lg(1024px), xl(1280px)

## 💰 수익 모델

### 구독 플랜
1. **모험자 (무료)**
   - 기본 습관 5개
   - 에너지 제한
   - 광고 포함

2. **영웅 (월 4,900원 / 연 39,000원)**
   - 무제한 습관
   - 에너지 무제한
   - 광고 제거
   - 프리미엄 콘텐츠

3. **파티 (월 7,900원 / 가족 6명)**
   - 영웅 플랜 모든 기능
   - 가족 공유

## 🤝 기여하기

기여를 환영합니다! 자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참조하세요.

### 빠른 시작

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 품질 기준

- ✅ 모든 테스트 통과 (70%+ 커버리지)
- ✅ ESLint + Prettier 통과
- ✅ TypeScript strict 모드 준수
- ✅ Conventional Commits 사용

### 문서

- [기여 가이드](./CONTRIBUTING.md) - 기여 방법 상세 안내
- [행동 강령](./CODE_OF_CONDUCT.md) - 커뮤니티 행동 강령
- [아키텍처 문서](./ARCHITECTURE.md) - 시스템 아키텍처 설명
- [배포 가이드](./DEPLOYMENT.md) - 배포 방법 및 환경 설정

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📧 연락처

프로젝트 링크: [https://github.com/yourusername/habitquest](https://github.com/yourusername/habitquest)

---

**습관을 게임처럼, 성장을 모험처럼! 🎮**
