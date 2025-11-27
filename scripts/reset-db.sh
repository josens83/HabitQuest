#!/bin/bash

# HabitQuest Database Reset Script
set -e

echo "🗑️  HabitQuest 데이터베이스 리셋"
echo "=================================="
echo "⚠️  경고: 모든 데이터가 삭제됩니다!"
echo ""
read -p "계속하시겠습니까? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "취소되었습니다."
    exit 0
fi

echo ""
echo "🔄 데이터베이스 리셋 중..."

# Reset Prisma migrations
npx prisma migrate reset --force

# Seed database
echo ""
echo "🌱 시드 데이터 삽입 중..."
npx prisma db seed || echo "⚠️  시드 스크립트가 없습니다."

echo ""
echo "✅ 데이터베이스 리셋 완료!"
