import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Create sample items
  console.log('Creating sample items...')

  const energyPotion = await prisma.item.upsert({
    where: { id: 'item-energy-potion' },
    update: {},
    create: {
      id: 'item-energy-potion',
      name: '에너지 포션',
      description: '에너지를 3 회복합니다',
      icon: 'zap',
      rarity: 'COMMON',
      type: 'CONSUMABLE',
      category: 'ENERGY_RESTORE',
      effects: JSON.stringify([{ type: 'ENERGY_RESTORE', value: 3 }]),
      isStackable: true,
      maxStack: 99,
      buyPrice: 100,
      sellPrice: 50,
      gemPrice: 10,
    },
  })

  const streakFreeze = await prisma.item.upsert({
    where: { id: 'item-streak-freeze' },
    update: {},
    create: {
      id: 'item-streak-freeze',
      name: '스트릭 프리즈',
      description: '하루 동안 스트릭이 끊기지 않습니다',
      icon: 'snowflake',
      rarity: 'UNCOMMON',
      type: 'CONSUMABLE',
      category: 'STREAK_FREEZE',
      effects: JSON.stringify([{ type: 'STREAK_FREEZE', value: 1 }]),
      isStackable: true,
      maxStack: 10,
      buyPrice: 500,
      sellPrice: 250,
      gemPrice: 50,
    },
  })

  const expBoost = await prisma.item.upsert({
    where: { id: 'item-exp-boost' },
    update: {},
    create: {
      id: 'item-exp-boost',
      name: 'EXP 부스트',
      description: '1시간 동안 경험치 획득량이 50% 증가합니다',
      icon: 'trending-up',
      rarity: 'RARE',
      type: 'BOOST',
      category: 'EXP_BOOST',
      effects: JSON.stringify([
        { type: 'EXP_BOOST', value: 50, duration: 3600 },
      ]),
      isStackable: true,
      maxStack: 20,
      buyPrice: 1000,
      sellPrice: 500,
      gemPrice: 100,
    },
  })

  const goldBoost = await prisma.item.upsert({
    where: { id: 'item-gold-boost' },
    update: {},
    create: {
      id: 'item-gold-boost',
      name: '골드 부스트',
      description: '1시간 동안 골드 획득량이 50% 증가합니다',
      icon: 'coins',
      rarity: 'RARE',
      type: 'BOOST',
      category: 'GOLD_BOOST',
      effects: JSON.stringify([
        { type: 'GOLD_BOOST', value: 50, duration: 3600 },
      ]),
      isStackable: true,
      maxStack: 20,
      buyPrice: 1000,
      sellPrice: 500,
      gemPrice: 100,
    },
  })

  console.log(`✅ Created ${4} items`)

  // 2. Create sample quests
  console.log('Creating sample quests...')

  const dailyQuest1 = await prisma.quest.upsert({
    where: { id: 'quest-daily-complete-3' },
    update: {},
    create: {
      id: 'quest-daily-complete-3',
      title: '일일 습관 3개 완료',
      description: '오늘 하루 동안 습관을 3개 완료하세요',
      type: 'DAILY',
      icon: 'check-circle',
      difficulty: 'EASY',
      expReward: 50,
      goldReward: 30,
      gemReward: 5,
      targetCount: 3,
      targetType: 'COMPLETE_HABITS',
      isRepeatable: true,
      resetPeriod: 'DAILY',
    },
  })

  const dailyQuest2 = await prisma.quest.upsert({
    where: { id: 'quest-daily-complete-all' },
    update: {},
    create: {
      id: 'quest-daily-complete-all',
      title: '완벽한 하루',
      description: '오늘의 모든 일일 습관을 완료하세요',
      type: 'DAILY',
      icon: 'star',
      difficulty: 'HARD',
      expReward: 150,
      goldReward: 100,
      gemReward: 20,
      targetCount: 1,
      targetType: 'COMPLETE_ALL_DAILY',
      isRepeatable: true,
      resetPeriod: 'DAILY',
    },
  })

  const weeklyQuest1 = await prisma.quest.upsert({
    where: { id: 'quest-weekly-fitness' },
    update: {},
    create: {
      id: 'quest-weekly-fitness',
      title: '주간 피트니스 챌린지',
      description: '이번 주 동안 운동 습관을 10회 완료하세요',
      type: 'WEEKLY',
      category: 'FITNESS',
      icon: 'dumbbell',
      difficulty: 'MEDIUM',
      expReward: 300,
      goldReward: 200,
      gemReward: 50,
      targetCount: 10,
      targetType: 'COMPLETE_CATEGORY',
      targetValue: 'FITNESS',
      isRepeatable: true,
      resetPeriod: 'WEEKLY',
    },
  })

  const weeklyQuest2 = await prisma.quest.upsert({
    where: { id: 'quest-weekly-streak' },
    update: {},
    create: {
      id: 'quest-weekly-streak',
      title: '7일 연속 달성',
      description: '7일 동안 연속으로 습관을 완료하세요',
      type: 'WEEKLY',
      icon: 'flame',
      difficulty: 'HARD',
      expReward: 500,
      goldReward: 300,
      gemReward: 100,
      itemRewards: JSON.stringify([{ itemId: 'item-streak-freeze', quantity: 1 }]),
      targetCount: 7,
      targetType: 'MAINTAIN_STREAK',
      isRepeatable: true,
      resetPeriod: 'WEEKLY',
    },
  })

  console.log(`✅ Created ${4} quests`)

  // 3. Create sample achievements
  console.log('Creating sample achievements...')

  const achievement1 = await prisma.achievement.upsert({
    where: { id: 'achievement-first-habit' },
    update: {},
    create: {
      id: 'achievement-first-habit',
      title: '첫 걸음',
      description: '첫 번째 습관을 완료하세요',
      icon: 'footprints',
      category: 'HABITS',
      tier: 'BRONZE',
      targetType: 'TOTAL_COMPLETIONS',
      targetValue: 1,
      expReward: 50,
      goldReward: 50,
      gemReward: 10,
    },
  })

  const achievement2 = await prisma.achievement.upsert({
    where: { id: 'achievement-habit-master' },
    update: {},
    create: {
      id: 'achievement-habit-master',
      title: '습관의 달인',
      description: '습관을 100회 완료하세요',
      icon: 'trophy',
      category: 'HABITS',
      tier: 'GOLD',
      targetType: 'TOTAL_COMPLETIONS',
      targetValue: 100,
      expReward: 500,
      goldReward: 500,
      gemReward: 100,
      titleReward: '습관의 달인',
    },
  })

  const achievement3 = await prisma.achievement.upsert({
    where: { id: 'achievement-streak-7' },
    update: {},
    create: {
      id: 'achievement-streak-7',
      title: '일주일 연속',
      description: '7일 연속으로 습관을 완료하세요',
      icon: 'calendar-check',
      category: 'STREAKS',
      tier: 'SILVER',
      targetType: 'LONGEST_STREAK',
      targetValue: 7,
      expReward: 200,
      goldReward: 200,
      gemReward: 50,
      itemRewards: JSON.stringify([{ itemId: 'item-streak-freeze', quantity: 2 }]),
    },
  })

  const achievement4 = await prisma.achievement.upsert({
    where: { id: 'achievement-streak-30' },
    update: {},
    create: {
      id: 'achievement-streak-30',
      title: '한 달 연속',
      description: '30일 연속으로 습관을 완료하세요',
      icon: 'medal',
      category: 'STREAKS',
      tier: 'GOLD',
      targetType: 'LONGEST_STREAK',
      targetValue: 30,
      expReward: 1000,
      goldReward: 1000,
      gemReward: 200,
      titleReward: '불굴의 의지',
      itemRewards: JSON.stringify([
        { itemId: 'item-streak-freeze', quantity: 5 },
        { itemId: 'item-exp-boost', quantity: 3 },
      ]),
    },
  })

  const achievement5 = await prisma.achievement.upsert({
    where: { id: 'achievement-level-10' },
    update: {},
    create: {
      id: 'achievement-level-10',
      title: '레벨 10 달성',
      description: '캐릭터 레벨 10에 도달하세요',
      icon: 'arrow-up-circle',
      category: 'PROGRESSION',
      tier: 'SILVER',
      targetType: 'REACH_LEVEL',
      targetValue: 10,
      expReward: 300,
      goldReward: 300,
      gemReward: 75,
    },
  })

  const achievement6 = await prisma.achievement.upsert({
    where: { id: 'achievement-level-50' },
    update: {},
    create: {
      id: 'achievement-level-50',
      title: '레벨 50 달성',
      description: '캐릭터 레벨 50에 도달하세요',
      icon: 'crown',
      category: 'PROGRESSION',
      tier: 'PLATINUM',
      targetType: 'REACH_LEVEL',
      targetValue: 50,
      expReward: 5000,
      goldReward: 5000,
      gemReward: 500,
      titleReward: '전설의 챔피언',
    },
  })

  const achievement7 = await prisma.achievement.upsert({
    where: { id: 'achievement-early-bird' },
    update: {},
    create: {
      id: 'achievement-early-bird',
      title: '아침형 인간',
      description: '오전 7시 이전에 습관을 10회 완료하세요',
      icon: 'sunrise',
      category: 'SPECIAL',
      tier: 'SILVER',
      targetType: 'EARLY_BIRD',
      targetValue: 10,
      expReward: 250,
      goldReward: 250,
      gemReward: 50,
      titleReward: '아침형 인간',
    },
  })

  const achievement8 = await prisma.achievement.upsert({
    where: { id: 'achievement-perfect-week' },
    update: {},
    create: {
      id: 'achievement-perfect-week',
      title: '완벽한 일주일',
      description: '일주일 동안 매일 모든 습관을 완료하세요',
      icon: 'sparkles',
      category: 'SPECIAL',
      tier: 'GOLD',
      targetType: 'PERFECT_WEEK',
      targetValue: 1,
      expReward: 1500,
      goldReward: 1000,
      gemReward: 250,
      titleReward: '완벽주의자',
      itemRewards: JSON.stringify([
        { itemId: 'item-exp-boost', quantity: 5 },
        { itemId: 'item-gold-boost', quantity: 5 },
      ]),
    },
  })

  console.log(`✅ Created ${8} achievements`)

  console.log('✅ Database seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
