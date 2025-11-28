import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateExpForLevel } from '@/lib/exp'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch character data
    const character = await prisma.character.findUnique({
      where: { userId },
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Fetch streak data
    const streak = await prisma.streak.findUnique({
      where: { userId },
    })

    // Get today's habits
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const allHabits = await prisma.habit.findMany({
      where: {
        userId,
        isActive: true,
      },
    })

    const completedHabitsToday = await prisma.habitCompletion.count({
      where: {
        habit: { userId },
        completedAt: {
          gte: today,
        },
      },
    })

    // Get quest progress
    const dailyQuests = await prisma.quest.findMany({
      where: { type: 'DAILY' },
      include: {
        progress: {
          where: { userId },
        },
      },
    })

    const weeklyQuests = await prisma.quest.findMany({
      where: { type: 'WEEKLY' },
      include: {
        progress: {
          where: { userId },
        },
      },
    })

    const dailyCompleted = dailyQuests.filter(
      (q) => q.progress[0]?.isCompleted,
    ).length
    const weeklyCompleted = weeklyQuests.filter(
      (q) => q.progress[0]?.isCompleted,
    ).length

    const pendingRewards = await prisma.questProgress.count({
      where: {
        userId,
        isCompleted: true,
        rewardClaimed: false,
      },
    })

    // Get recent achievements
    const recentAchievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        isCompleted: true,
      },
      include: {
        achievement: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 5,
    })

    // Get overall stats
    const totalHabitsCompleted = await prisma.habitCompletion.count({
      where: {
        habit: { userId },
      },
    })

    const totalQuestsCompleted = await prisma.questProgress.count({
      where: {
        userId,
        isCompleted: true,
      },
    })

    const achievementsUnlocked = await prisma.userAchievement.count({
      where: {
        userId,
        isCompleted: true,
      },
    })

    // Calculate total exp earned (approximation based on level)
    const totalExpEarned = character.totalExp || character.currentExp

    const expToNextLevel = calculateExpForLevel(character.level + 1)

    return NextResponse.json({
      character: {
        level: character.level,
        currentExp: character.currentExp,
        expToNextLevel,
        currentEnergy: character.currentEnergy,
        maxEnergy: character.maxEnergy,
        gold: character.gold,
        gems: character.gems,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
      },
      todayHabits: {
        total: allHabits.length,
        completed: completedHabitsToday,
        remaining: allHabits.length - completedHabitsToday,
      },
      quests: {
        daily: {
          completed: dailyCompleted,
          total: dailyQuests.length,
        },
        weekly: {
          completed: weeklyCompleted,
          total: weeklyQuests.length,
        },
        pendingRewards,
      },
      recentAchievements: recentAchievements.map((ua) => ({
        id: ua.achievement.id,
        title: ua.achievement.title,
        icon: ua.achievement.icon,
        completedAt: ua.completedAt?.toISOString() || new Date().toISOString(),
      })),
      stats: {
        totalHabitsCompleted,
        totalQuestsCompleted,
        achievementsUnlocked,
        totalExpEarned,
      },
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 },
    )
  }
}
