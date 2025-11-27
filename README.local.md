# 🚀 HabitQuest 로컬 개발 가이드

이 문서는 HabitQuest를 로컬 환경에서 개발하기 위한 완전한 가이드입니다.

## 📋 사전 요구사항

- **Node.js** 18.17 이상
- **Docker** 및 **Docker Compose**
- **Git**

## 🎯 빠른 시작 (Quick Start)

### 1단계: 저장소 클론

```bash
git clone https://github.com/your-username/HabitQuest.git
cd HabitQuest
```

### 2단계: 자동 설정 실행

```bash
./scripts/setup-local.sh
```

이 스크립트가 자동으로 수행하는 작업:
- ✅ `.env.local` 파일 생성 및 비밀키 자동 생성
- ✅ Docker 컨테이너 (PostgreSQL + Redis) 시작
- ✅ npm 패키지 설치
- ✅ Prisma Client 생성
- ✅ 데이터베이스 마이그레이션 실행
- ✅ 시드 데이터 삽입

### 3단계: 개발 서버 시작

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 🔧 수동 설정 (Manual Setup)

자동 설정이 동작하지 않는 경우 수동으로 설정할 수 있습니다.

### 1. 환경 변수 설정

```bash
# .env.local.example을 .env.local로 복사
cp .env.local.example .env.local

# NEXTAUTH_SECRET 생성
openssl rand -base64 32
```

생성된 값을 `.env.local` 파일의 `NEXTAUTH_SECRET`에 붙여넣기

### 2. Docker 컨테이너 시작

```bash
docker-compose up -d
```

### 3. 패키지 설치

```bash
npm install
```

### 4. Prisma 설정

```bash
# Prisma Client 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev --name init

# 시드 데이터 삽입
npx prisma db seed
```

### 5. 개발 서버 시작

```bash
npm run dev
```

## 🗃️ 데이터베이스 관리

### Prisma Studio (GUI)

```bash
npx prisma studio
```

브라우저에서 [http://localhost:5555](http://localhost:5555) 접속

### 데이터베이스 리셋

```bash
./scripts/reset-db.sh
```

또는 수동으로:

```bash
npx prisma migrate reset --force
npx prisma db seed
```

### 새로운 마이그레이션 생성

```bash
npx prisma migrate dev --name your_migration_name
```

## 🐳 Docker 명령어

### 컨테이너 상태 확인

```bash
docker-compose ps
```

### 로그 확인

```bash
# 모든 컨테이너 로그
docker-compose logs -f

# PostgreSQL 로그만
docker-compose logs -f postgres

# Redis 로그만
docker-compose logs -f redis
```

### 컨테이너 중지

```bash
docker-compose down
```

### 컨테이너 및 데이터 삭제

```bash
docker-compose down -v
```

## 🧪 테스트

### 모든 테스트 실행

```bash
npm test
```

### Watch 모드

```bash
npm run test:watch
```

### 커버리지 확인

```bash
npm run test:coverage
```

## 🎨 코드 품질

### 린트 실행

```bash
npm run lint
```

### 린트 자동 수정

```bash
npm run lint:fix
```

### 코드 포매팅

```bash
# 모든 파일 포맷
npm run format

# 포맷 확인만 (수정하지 않음)
npm run format:check
```

## 🔑 OAuth 프로바이더 설정 (선택사항)

개발 초기에는 OAuth 없이도 앱이 동작합니다. 필요한 경우에만 설정하세요.

### Kakao

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 추가
3. 플랫폼 설정 → Web 플랫폼 추가
4. Redirect URI: `http://localhost:3000/api/auth/callback/kakao`
5. REST API 키를 `.env.local`의 `KAKAO_CLIENT_ID`에 추가

### Google

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. API 및 서비스 → OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI: `http://localhost:3000/api/auth/callback/google`
5. 클라이언트 ID와 시크릿을 `.env.local`에 추가

### Apple

1. [Apple Developer](https://developer.apple.com/) 접속
2. Certificates, Identifiers & Profiles
3. Services ID 생성
4. Sign in with Apple 설정
5. 필요한 키와 ID를 `.env.local`에 추가

## 💳 결제 시스템 설정 (선택사항)

### Toss Payments (한국)

1. [Toss Payments](https://www.tosspayments.com/) 가입
2. 개발자센터에서 테스트 API 키 발급
3. `.env.local`에 키 추가

### Stripe (글로벌)

1. [Stripe](https://stripe.com/) 가입
2. 테스트 모드 API 키 발급
3. `.env.local`에 키 추가

## 📧 이메일 서비스 설정 (선택사항)

Gmail SMTP 사용 예시:

1. Gmail 계정에서 2단계 인증 활성화
2. 앱 비밀번호 생성
3. `.env.local`의 SMTP 설정 업데이트

## 🔍 환경별 설정

### 개발 환경

```env
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:3000"
```

### 프로덕션 환경

```env
NODE_ENV="production"
NEXTAUTH_URL="https://your-domain.com"
DATABASE_URL="postgresql://user:password@your-production-db:5432/habitquest"
```

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [NextAuth.js 문서](https://next-auth.js.org/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

## ❓ 문제 해결

### 데이터베이스 연결 실패

```bash
# PostgreSQL 컨테이너 상태 확인
docker ps | grep habitquest-db

# 컨테이너 재시작
docker-compose restart postgres
```

### Prisma Client 에러

```bash
# Prisma Client 재생성
npx prisma generate

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### 포트 충돌

`.env.local`에서 다른 포트 사용:

```env
# Next.js 포트 변경
PORT=3001
```

Docker Compose 포트 변경:

```yaml
# docker-compose.yml
ports:
  - '5433:5432'  # PostgreSQL
  - '6380:6379'  # Redis
```

## 🤝 기여하기

자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.
