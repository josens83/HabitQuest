import { NextRequest, NextResponse } from 'next/server'
// Force dynamic
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { DIFFICULTY_REWARDS, CATEGORY_STAT_MAPPING } from '@/types'

// GET /api/habits - Get all habits for user
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId,
        isArchived: false,
      },
      include: {
        completions: {
          orderBy: {
            completedAt: 'desc',
          },
          take: 30, // Last 30 completions
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Add computed fields
    const habitsWithStatus = habits.map((habit: any) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayCompletions = habit.completions.filter((c: any) => {
        const completedDate = new Date(c.completedAt)
        completedDate.setHours(0, 0, 0, 0)
        return completedDate.getTime() === today.getTime()
      })

      return {
        ...habit,
        isCompletedToday: todayCompletions.length >= habit.timesPerDay,
        todayCompletionCount: todayCompletions.length,
      }
    })

    return NextResponse.json(habitsWithStatus)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    )
  }
}

// POST /api/habits - Create new habit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      name,
      description,
      category,
      icon = 'target',
      color = '#6366F1',
      frequencyType = 'DAILY',
      daysOfWeek = [0, 1, 2, 3, 4, 5, 6],
      timesPerDay = 1,
      targetTime,
      difficulty = 'MEDIUM',
    } = body

    if (!userId || !name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate rewards based on difficulty
    const rewards = DIFFICULTY_REWARDS[difficulty as keyof typeof DIFFICULTY_REWARDS]

    // Calculate stat bonus based on category
    const statMapping = CATEGORY_STAT_MAPPING[category as keyof typeof CATEGORY_STAT_MAPPING]
    const statBonus: Record<string, number> = {
      statBonusStrength: 0,
      statBonusIntelligence: 0,
      statBonusVitality: 0,
      statBonusSpirit: 0,
      statBonusCharisma: 0,
    }

    if (statMapping) {
      const key = `statBonus${statMapping.charAt(0).toUpperCase() + statMapping.slice(1)}`
      statBonus[key] = difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 2 : difficulty === 'HARD' ? 3 : 5
    }

    const habit = await prisma.habit.create({
      data: {
        userId,
        name,
        description,
        category,
        icon,
        color,
        frequencyType,
        daysOfWeek,
        timesPerDay,
        targetTime,
        difficulty,
        expReward: rewards.exp,
        goldReward: rewards.gold,
        ...statBonus,
      },
    })

    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    )
  }
}
