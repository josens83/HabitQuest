# Contributing to HabitQuest

먼저 HabitQuest에 기여해주셔서 감사합니다! 🎉

## 목차

- [행동 강령](#행동-강령)
- [시작하기](#시작하기)
- [개발 프로세스](#개발-프로세스)
- [Pull Request 가이드라인](#pull-request-가이드라인)
- [코딩 표준](#코딩-표준)
- [테스트](#테스트)
- [커밋 메시지 가이드라인](#커밋-메시지-가이드라인)

## 행동 강령

이 프로젝트는 [Contributor Covenant](./CODE_OF_CONDUCT.md) 행동 강령을 채택했습니다. 참여함으로써 여러분은 이 강령을 준수할 것을 약속합니다.

## 시작하기

### 개발 환경 설정

1. **저장소 Fork 및 Clone**
\`\`\`bash
git clone https://github.com/yourusername/habitquest.git
cd habitquest
\`\`\`

2. **의존성 설치**
\`\`\`bash
npm install
\`\`\`

3. **환경 변수 설정**
\`\`\`bash
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 값 설정
\`\`\`

4. **데이터베이스 설정**
\`\`\`bash
npm run db:generate
npm run db:push
\`\`\`

5. **개발 서버 시작**
\`\`\`bash
npm run dev
\`\`\`

## 개발 프로세스

### 1. Issue 생성

- 버그 수정이나 새 기능 작업 전에 먼저 Issue를 생성하세요
- 이미 존재하는 Issue가 있는지 확인하세요
- Issue 템플릿을 사용하여 명확하게 작성하세요

### 2. 브랜치 생성

\`\`\`bash
git checkout -b feature/your-feature-name
# 또는
git checkout -b fix/bug-description
\`\`\`

브랜치 명명 규칙:
- `feature/` - 새로운 기능
- `fix/` - 버그 수정
- `docs/` - 문서 업데이트
- `refactor/` - 리팩토링
- `test/` - 테스트 추가/수정
- `chore/` - 기타 변경사항

### 3. 코드 작성

- [코딩 표준](#코딩-표준)을 따르세요
- 변경사항에 대한 테스트를 작성하세요
- 기존 테스트가 통과하는지 확인하세요

### 4. 커밋

\`\`\`bash
git add .
git commit -m "feat: add new feature"
\`\`\`

Pre-commit 훅이 자동으로 다음을 실행합니다:
- ESLint (자동 수정)
- Prettier (자동 포맷팅)
- 관련 테스트

### 5. Pull Request

- PR 템플릿을 사용하여 작성하세요
- 변경사항을 명확하게 설명하세요
- 관련 Issue를 참조하세요
- 스크린샷/GIF를 포함하세요 (UI 변경 시)

## Pull Request 가이드라인

### PR 체크리스트

- [ ] 코드가 프로젝트 코딩 표준을 준수합니다
- [ ] 테스트를 작성하고 모든 테스트가 통과합니다
- [ ] 문서가 업데이트되었습니다 (필요한 경우)
- [ ] 커밋 메시지가 가이드라인을 따릅니다
- [ ] PR 설명이 변경사항을 명확하게 설명합니다
- [ ] Breaking changes가 있는 경우 BREAKING CHANGE 섹션을 추가했습니다

### PR 리뷰 프로세스

1. 최소 1명의 maintainer 승인 필요
2. CI/CD 체크가 모두 통과해야 함
3. 코드 리뷰 피드백 반영
4. Squash merge 또는 Rebase merge 사용

## 코딩 표준

### TypeScript

- **Strict 모드 사용**: `tsconfig.json`에서 `strict: true`
- **타입 안전성**: `any` 사용 최소화, 명시적 타입 정의
- **명명 규칙**:
  - 변수/함수: `camelCase`
  - 컴포넌트/타입: `PascalCase`
  - 상수: `UPPER_SNAKE_CASE`

### React/Next.js

- **함수형 컴포넌트 사용**: 클래스 컴포넌트 지양
- **Hooks 규칙 준수**: [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- **Server Components 우선**: Client Component는 필요한 경우만

### 스타일링

- **Tailwind CSS 사용**: 인라인 유틸리티 클래스
- **반응형 디자인**: 모바일 우선 (mobile-first)
- **다크 모드 지원**: `dark:` 접두사 사용

### 파일 구조

\`\`\`
app/          # Next.js App Router
lib/          # 비즈니스 로직
components/   # React 컴포넌트
types/        # TypeScript 타입 정의
utils/        # 유틸리티 함수
__tests__/    # 테스트 파일
\`\`\`

## 테스트

### 테스트 작성

\`\`\`bash
# 테스트 실행
npm test

# Watch 모드
npm run test:watch

# 커버리지
npm run test:coverage
\`\`\`

### 테스트 커버리지 목표

- **라인**: 70% 이상
- **함수**: 70% 이상
- **브랜치**: 70% 이상

### 테스트 작성 가이드

1. **단위 테스트**: 모든 유틸리티 함수와 비즈니스 로직
2. **통합 테스트**: API endpoints
3. **E2E 테스트**: 주요 사용자 플로우 (추후 추가)

## 커밋 메시지 가이드라인

### Conventional Commits 사용

\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### Type

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스, 도구 설정 등

### 예시

\`\`\`bash
feat(character): add character customization feature

- Add costume selection UI
- Implement pet system
- Update character API

Closes #123
\`\`\`

\`\`\`bash
fix(streak): correct streak calculation logic

Fixed an issue where streak would reset incorrectly
when using freeze feature.

Fixes #456
\`\`\`

## 보안

보안 취약점을 발견하신 경우 공개 Issue를 생성하지 마시고
[security@habitquest.com](mailto:security@habitquest.com)으로 직접 보고해주세요.

## 라이선스

기여하신 코드는 프로젝트와 동일한 [MIT 라이선스](./LICENSE) 하에 배포됩니다.

## 질문이나 도움이 필요하신가요?

- [GitHub Discussions](https://github.com/yourusername/habitquest/discussions)에서 질문하세요
- [Discord 커뮤니티](https://discord.gg/habitquest)에 참여하세요

감사합니다! 🙏
