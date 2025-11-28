import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Force dynamic
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { DIFFICULTY_REWARDS, CATEGORY_STAT_MAPPING } from '@/types'

// GET /api/habits - Get all habits for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get today's date for completion check
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const habits = await prisma.habit.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        completions: {
          where: {
            completedAt: {
              gte: today,
            },
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const habitsWithStats = habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      category: habit.category,
      difficulty: habit.difficulty,
      frequency: habit.frequencyType,
      icon: habit.icon,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions: habit.totalCompletions,
      isCompletedToday: habit.completions.length > 0,
      lastCompletedAt: habit.lastCompletedAt?.toISOString() || null,
    }))

    // Calculate stats
    const total = habitsWithStats.length
    const completedToday = habitsWithStats.filter((h) => h.isCompletedToday).length
    const activeStreaks = habitsWithStats.filter((h) => h.currentStreak > 0).length

    return NextResponse.json({
      habits: habitsWithStats,
      stats: {
        total,
        completedToday,
        activeStreaks,
      },
    })
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    )
  }
}

const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  category: z.enum([
    'HEALTH',
    'PRODUCTIVITY',
    'LEARNING',
    'SOCIAL',
    'FINANCE',
    'CREATIVITY',
    'MINDFULNESS',
    'OTHER',
  ]),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  frequencyType: z.enum(['DAILY', 'WEEKLY', 'CUSTOM']).default('DAILY'),
  icon: z.string().max(10).optional().nullable(),
  color: z.string().max(7).optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  timesPerDay: z.number().min(1).max(10).default(1),
  targetTime: z.string().optional().nullable(),
})

// POST /api/habits - Create new habit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    const validatedData = createHabitSchema.parse(body)

    // Calculate rewards based on difficulty
    const rewards = DIFFICULTY_REWARDS[validatedData.difficulty as keyof typeof DIFFICULTY_REWARDS]

    // Calculate stat bonus based on category
    const statMapping = CATEGORY_STAT_MAPPING[validatedData.category as keyof typeof CATEGORY_STAT_MAPPING]
    const statBonus: Record<string, number> = {
      statBonusStrength: 0,
      statBonusIntelligence: 0,
      statBonusVitality: 0,
      statBonusSpirit: 0,
      statBonusCharisma: 0,
    }

    if (statMapping) {
      const key = `statBonus${statMapping.charAt(0).toUpperCase() + statMapping.slice(1)}`
      statBonus[key] = validatedData.difficulty === 'EASY' ? 1 : validatedData.difficulty === 'MEDIUM' ? 2 : validatedData.difficulty === 'HARD' ? 3 : 5
    }

    const habit = await prisma.habit.create({
      data: {
        userId,
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        icon: validatedData.icon || 'target',
        color: validatedData.color || '#6366F1',
        frequencyType: validatedData.frequencyType,
        daysOfWeek: validatedData.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        timesPerDay: validatedData.timesPerDay,
        targetTime: validatedData.targetTime,
        difficulty: validatedData.difficulty,
        expReward: rewards.exp,
        goldReward: rewards.gold,
        ...statBonus,
      },
    })

    return NextResponse.json({
      habit: {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        category: habit.category,
        difficulty: habit.difficulty,
        frequency: habit.frequencyType,
        icon: habit.icon,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        totalCompletions: habit.totalCompletions,
        isCompletedToday: false,
        lastCompletedAt: null,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating habit:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    )
  }
}
