import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateExpToNextLevel } from '@/lib/exp'
import { checkQuestTrigger } from '@/lib/quest/quest'
import { checkAchievementProgress } from '@/lib/achievements/achievements'

export const dynamic = 'force-dynamic'

// POST /api/habits/[id]/complete - Complete a habit
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const habitId = params.id

    // Verify habit belongs to user and is not completed today
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
        isActive: true,
      },
      include: {
        user: {
          include: {
            character: true,
          },
        },
      },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    // Check if already completed today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingCompletion = await prisma.habitCompletion.findFirst({
      where: {
        habitId,
        completedAt: {
          gte: today,
        },
      },
    })

    if (existingCompletion) {
      return NextResponse.json(
        { error: 'Habit already completed today' },
        { status: 400 },
      )
    }

    const character = habit.user.character

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Calculate rewards
    let expGained = habit.expReward
    const goldGained = habit.goldReward
    let streakBonus = 0

    // Check if continuing streak (completed yesterday)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const yesterdayCompletion = await prisma.habitCompletion.findFirst({
      where: {
        habitId,
        completedAt: {
          gte: yesterday,
          lt: today,
        },
      },
    })

    const newStreak = yesterdayCompletion ? habit.currentStreak + 1 : 1

    // Streak bonus: 10% extra exp per day of streak (max 100%)
    if (newStreak > 1) {
      streakBonus = Math.min(expGained * (newStreak - 1) * 0.1, expGained)
      expGained += Math.floor(streakBonus)
    }

    // Update character exp and gold
    const newExp = character.currentExp + expGained
    const expToNextLevel = calculateExpToNextLevel(character.level + 1)

    let newLevel = character.level
    let remainingExp = newExp

    // Handle level ups
    while (remainingExp >= calculateExpToNextLevel(newLevel + 1)) {
      remainingExp -= calculateExpToNextLevel(newLevel + 1)
      newLevel++
    }

    const leveledUp = newLevel > character.level

    // Create habit completion record
    await prisma.habitCompletion.create({
      data: {
        habitId,
        userId,
        completedAt: new Date(),
        expGained,
        goldGained,
      },
    })

    // Update habit stats
    await prisma.habit.update({
      where: { id: habitId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(habit.longestStreak, newStreak),
        totalCompletions: habit.totalCompletions + 1,
        lastCompletedAt: new Date(),
      },
    })

    // Update character
    await prisma.character.update({
      where: { id: character.id },
      data: {
        level: newLevel,
        currentExp: remainingExp,
        totalExp: character.totalExp + expGained,
        gold: character.gold + goldGained,
      },
    })

    // Update streak
    await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(habit.longestStreak, newStreak),
        lastCompletedDate: new Date(),
      },
    })

    // Trigger quest progress checks
    await checkQuestTrigger(userId, 'COMPLETE_HABIT', habitId)

    // Check achievement progress
    const totalCompletions = await prisma.habitCompletion.count({ where: { habit: { userId } } })
    await checkAchievementProgress(userId, 'TOTAL_COMPLETIONS', totalCompletions)
    await checkAchievementProgress(userId, 'LONGEST_STREAK', newStreak)

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'HABIT_COMPLETE',
        metadata: {
          habitId,
          habitName: habit.name,
          expGained,
          goldGained,
          streakBonus,
          newStreak,
          leveledUp,
          newLevel,
        },
      },
    })

    return NextResponse.json({
      expGained,
      goldGained,
      streakBonus,
      newStreak,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
    })
  } catch (error) {
    console.error('Complete habit error:', error)
    return NextResponse.json(
      { error: 'Failed to complete habit' },
      { status: 500 },
    )
  }
}
