import { NextRequest, NextResponse } from 'next/server'
// Force dynamic
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { checkLevelUp, calculateStatIncrease, getExpInfo } from '@/lib/exp'
import { checkStreak, checkMilestone } from '@/lib/streak'
import type { QuestCompleteResult } from '@/types'
import { startOfDay } from 'date-fns'

// POST /api/quest/complete - Complete a habit quest
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, habitId, note } = body

    if (!userId || !habitId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get habit
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    // Check if already completed today (based on timesPerDay)
    const today = startOfDay(new Date())
    const todayCompletions = await prisma.habitCompletion.count({
      where: {
        habitId,
        completedAt: {
          gte: today,
        },
      },
    })

    if (todayCompletions >= habit.timesPerDay) {
      return NextResponse.json(
        { error: 'Habit already completed for today' },
        { status: 400 }
      )
    }

    // Get character
    let character = await prisma.character.findUnique({
      where: { userId },
    })

    if (!character) {
      character = await prisma.character.create({
        data: {
          userId,
          name: '모험가',
          class: 'RANGER',
        },
      })
    }

    // Get or create streak
    let streak = await prisma.streak.findUnique({
      where: { userId },
    })

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId,
        },
      })
    }

    // Calculate rewards
    const expGained = habit.expReward
    const goldGained = habit.goldReward
    const newExp = character.exp + expGained
    const newGold = character.gold + goldGained

    // Check level up
    const levelUpInfo = checkLevelUp(character.exp, newExp)
    const statIncreases = levelUpInfo.leveledUp
      ? calculateStatIncrease(character.class, levelUpInfo.newLevel - levelUpInfo.oldLevel)
      : {}

    // Check streak
    const streakResult = checkStreak(
      streak.lastActiveDate,
      streak.currentStreak,
      streak.streakFreezes
    )

    // Update in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create completion record
      const completion = await tx.habitCompletion.create({
        data: {
          habitId,
          completedAt: new Date(),
          note,
          expGained,
          goldGained,
        },
      })

      // Update habit stats
      const updatedHabit = await tx.habit.update({
        where: { id: habitId },
        data: {
          totalCompletions: { increment: 1 },
          currentStreak:
            todayCompletions === 0 ? { increment: 1 } : habit.currentStreak,
          longestStreak:
            todayCompletions === 0 && habit.currentStreak + 1 > habit.longestStreak
              ? habit.currentStreak + 1
              : habit.longestStreak,
        },
      })

      // Update character
      const updatedCharacter = await tx.character.update({
        where: { userId },
        data: {
          exp: newExp,
          gold: newGold,
          level: levelUpInfo.newLevel,
          strength: { increment: statIncreases.strength || 0 },
          intelligence: { increment: statIncreases.intelligence || 0 },
          vitality: { increment: statIncreases.vitality || 0 },
          spirit: { increment: statIncreases.spirit || 0 },
          charisma: { increment: statIncreases.charisma || 0 },
          // Add stat bonuses from habit
          ...(habit.statBonusStrength && { strength: { increment: habit.statBonusStrength } }),
          ...(habit.statBonusIntelligence && { intelligence: { increment: habit.statBonusIntelligence } }),
          ...(habit.statBonusVitality && { vitality: { increment: habit.statBonusVitality } }),
          ...(habit.statBonusSpirit && { spirit: { increment: habit.statBonusSpirit } }),
          ...(habit.statBonusCharisma && { charisma: { increment: habit.statBonusCharisma } }),
        },
      })

      // Update streak
      const updatedStreak = await tx.streak.update({
        where: { userId },
        data: {
          currentStreak: streakResult.streak,
          longestStreak: Math.max(streak.longestStreak, streakResult.streak),
          lastActiveDate: new Date(),
          ...(streakResult.status === 'freeze_used' && {
            streakFreezes: streakResult.freezesRemaining!,
            freezeUsedToday: true,
          }),
          ...(streakResult.milestone && {
            milestonesReached: {
              push: streakResult.milestone.days,
            },
          }),
        },
      })

      // Award milestone rewards if reached
      if (streakResult.milestone) {
        await tx.character.update({
          where: { userId },
          data: {
            gems: { increment: streakResult.milestone.reward.gems },
            titles: { push: streakResult.milestone.title },
          },
        })
      }

      return {
        completion,
        habit: updatedHabit,
        character: updatedCharacter,
        streak: updatedStreak,
      }
    })

    // Build response
    const response: QuestCompleteResult = {
      success: true,
      expGained,
      goldGained,
      leveledUp: levelUpInfo.leveledUp,
      newLevel: levelUpInfo.leveledUp ? levelUpInfo.newLevel : undefined,
      statIncreases,
      streakContinued: streakResult.status === 'continued',
      newStreak: streakResult.streak,
      milestoneReached: streakResult.milestone,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error completing quest:', error)
    return NextResponse.json(
      { error: 'Failed to complete quest' },
      { status: 500 }
    )
  }
}
