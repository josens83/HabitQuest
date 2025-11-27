#!/bin/bash

# HabitQuest Local Development Setup Script
set -e

echo "🎮 HabitQuest 로컬 개발 환경 설정"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    echo "   https://www.docker.com/get-started 에서 Docker를 설치해주세요."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다."
    exit 1
fi

echo "✅ Docker 확인 완료"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 .env.local 파일 생성 중..."
    cp .env.local.example .env.local

    # Generate NEXTAUTH_SECRET
    SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/dev-secret-change-in-production/$SECRET/" .env.local
    else
        # Linux
        sed -i "s/dev-secret-change-in-production/$SECRET/" .env.local
    fi

    echo "✅ .env.local 파일이 생성되었습니다."
    echo "   NEXTAUTH_SECRET가 자동으로 생성되었습니다."
else
    echo "✅ .env.local 파일이 이미 존재합니다."
fi

# Start Docker containers
echo ""
echo "🐳 Docker 컨테이너 시작 중..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ PostgreSQL 준비 대기 중..."
sleep 5

# Check if containers are running
if docker ps | grep -q habitquest-db; then
    echo "✅ PostgreSQL 컨테이너가 실행 중입니다."
else
    echo "❌ PostgreSQL 컨테이너 시작 실패"
    exit 1
fi

if docker ps | grep -q habitquest-redis; then
    echo "✅ Redis 컨테이너가 실행 중입니다."
else
    echo "❌ Redis 컨테이너 시작 실패"
    exit 1
fi

# Install dependencies
echo ""
echo "📦 npm 패키지 설치 중..."
npm install

# Generate Prisma Client
echo ""
echo "🔧 Prisma Client 생성 중..."
npx prisma generate

# Run migrations
echo ""
echo "🗃️  데이터베이스 마이그레이션 실행 중..."
npx prisma migrate dev --name init

# Seed database
echo ""
echo "🌱 데이터베이스 시드 데이터 삽입 중..."
npx prisma db seed || echo "⚠️  시드 스크립트가 없습니다. 건너뜁니다."

echo ""
echo "=================================="
echo "✅ 로컬 개발 환경 설정 완료!"
echo ""
echo "다음 명령어로 개발 서버를 시작하세요:"
echo "  npm run dev"
echo ""
echo "데이터베이스 관리 도구:"
echo "  npx prisma studio"
echo ""
echo "Docker 컨테이너 중지:"
echo "  docker-compose down"
echo ""
echo "Docker 컨테이너 및 데이터 삭제:"
echo "  docker-compose down -v"
echo "=================================="
