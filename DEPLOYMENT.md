# 🚀 HabitQuest 배포 가이드

## Vercel 배포 (권장)

### 1. Vercel 프로젝트 생성

1. [Vercel](https://vercel.com)에 로그인
2. "Import Project" 클릭
3. GitHub 저장소 연결
4. "Import" 클릭

### 2. 환경 변수 설정

Vercel 대시보드에서 Settings > Environment Variables로 이동하여 다음 변수들을 추가:

\`\`\`
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
\`\`\`

### 3. 데이터베이스 설정

#### Option A: Supabase (권장)

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Settings > Database에서 Connection String 복사
3. Vercel 환경 변수에 `DATABASE_URL` 추가

#### Option B: Railway

1. [Railway](https://railway.app)에서 PostgreSQL 추가
2. DATABASE_URL 복사
3. Vercel 환경 변수에 추가

#### Option C: Neon

1. [Neon](https://neon.tech)에서 프로젝트 생성
2. Connection string 복사
3. Vercel 환경 변수에 추가

### 4. 배포

1. "Deploy" 클릭
2. 배포 완료 후 도메인 확인
3. 데이터베이스 마이그레이션:
   \`\`\`bash
   # 로컬에서 실행
   DATABASE_URL="your-production-db-url" npm run db:push
   \`\`\`

## Docker 배포

### Dockerfile 생성

\`\`\`dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

### docker-compose.yml

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/habitquest
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=habitquest
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres-data:
\`\`\`

### 실행

\`\`\`bash
docker-compose up -d
\`\`\`

## 환경별 체크리스트

### Development
- [ ] .env.local 설정
- [ ] 로컬 PostgreSQL 실행
- [ ] npm run dev 실행

### Staging
- [ ] Staging 데이터베이스 생성
- [ ] 환경 변수 설정
- [ ] 테스트 데이터 시드

### Production
- [ ] 프로덕션 데이터베이스 생성 및 백업 설정
- [ ] 모든 환경 변수 설정 (특히 NEXTAUTH_SECRET)
- [ ] HTTPS 설정 확인
- [ ] 도메인 연결
- [ ] 모니터링 설정 (Sentry, LogRocket 등)
- [ ] 성능 테스트
- [ ] 보안 감사

## 성능 최적화

### 1. 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP 형식 사용
- Cloudflare R2로 정적 자산 제공

### 2. 캐싱
- Redis 설정으로 API 응답 캐싱
- ISR (Incremental Static Regeneration) 활용

### 3. 데이터베이스
- 인덱스 최적화
- Connection pooling (Prisma)
- Read replica 고려 (높은 트래픽 시)

### 4. CDN
- Vercel의 Edge Network 활용
- 또는 Cloudflare CDN 사용

## 모니터링 & 분석

### 추천 도구
- **에러 추적**: Sentry
- **분석**: Mixpanel 또는 PostHog
- **성능**: Vercel Analytics
- **로그**: Vercel Logs 또는 Datadog

## 백업 전략

### 데이터베이스 백업
\`\`\`bash
# 자동 백업 스크립트 (cron)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql
\`\`\`

### 백업 주기
- **일일**: 자동 백업
- **주간**: 검증된 백업 보관
- **월간**: 장기 보관용 백업

## 보안 체크리스트

- [ ] 환경 변수 암호화
- [ ] HTTPS 강제
- [ ] CORS 설정
- [ ] Rate limiting
- [ ] SQL Injection 방어 (Prisma가 기본 제공)
- [ ] XSS 방어
- [ ] CSRF 방어 (NextAuth가 기본 제공)
- [ ] 정기적인 의존성 업데이트
- [ ] 보안 헤더 설정

## 트러블슈팅

### 데이터베이스 연결 오류
\`\`\`bash
# 연결 테스트
npx prisma db pull
\`\`\`

### 빌드 실패
\`\`\`bash
# 캐시 삭제 후 재빌드
rm -rf .next
npm run build
\`\`\`

### Prisma 클라이언트 오류
\`\`\`bash
# 재생성
npm run db:generate
\`\`\`

## 지원

문제가 발생하면 GitHub Issues에 보고해주세요.
