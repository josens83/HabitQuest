import prisma from '@/lib/prisma'
import { LeaderboardType, LeaderboardPeriod } from '@prisma/client'

export interface LeaderboardEntry {
  userId: string
  userName: string
  characterName: string
  avatar: string
  value: number
  rank: number
}

export async function updateLeaderboard(
  type: LeaderboardType,
  period: LeaderboardPeriod,
): Promise<void> {
  let rankings: LeaderboardEntry[] = []

  switch (type) {
    case 'LEVEL':
      const levelUsers = await prisma.user.findMany({
        include: {
          character: true,
        },
        orderBy: {
          character: {
            level: 'desc',
          },
        },
        take: 100,
      })

      rankings = levelUsers
        .filter((u) => u.character)
        .map((u, i) => ({
          userId: u.id,
          userName: u.name || 'User',
          characterName: u.character!.name,
          avatar: u.character!.avatar,
          value: u.character!.level,
          rank: i + 1,
        }))
      break

    case 'STREAK':
      const streakUsers = await prisma.user.findMany({
        include: {
          character: true,
          streak: true,
        },
        orderBy: {
          streak: {
            currentStreak: 'desc',
          },
        },
        take: 100,
      })

      rankings = streakUsers
        .filter((u) => u.character && u.streak)
        .map((u, i) => ({
          userId: u.id,
          userName: u.name || 'User',
          characterName: u.character!.name,
          avatar: u.character!.avatar,
          value: u.streak!.currentStreak,
          rank: i + 1,
        }))
      break

    case 'TOTAL_EXP':
      const expUsers = await prisma.user.findMany({
        include: {
          character: true,
        },
        orderBy: {
          character: {
            exp: 'desc',
          },
        },
        take: 100,
      })

      rankings = expUsers
        .filter((u) => u.character)
        .map((u, i) => ({
          userId: u.id,
          userName: u.name || 'User',
          characterName: u.character!.name,
          avatar: u.character!.avatar,
          value: u.character!.exp,
          rank: i + 1,
        }))
      break
  }

  // Store in database
  await prisma.leaderboard.upsert({
    where: {
      type_period: {
        type,
        period,
      },
    },
    create: {
      type,
      period,
      rankings: rankings,
      validUntil: getValidUntil(period),
    },
    update: {
      rankings: rankings,
      validUntil: getValidUntil(period),
    },
  })
}

export async function getLeaderboard(
  type: LeaderboardType,
  period: LeaderboardPeriod,
): Promise<LeaderboardEntry[]> {
  const leaderboard = await prisma.leaderboard.findUnique({
    where: {
      type_period: {
        type,
        period,
      },
    },
  })

  if (!leaderboard || leaderboard.validUntil < new Date()) {
    // Update leaderboard if expired or not found
    await updateLeaderboard(type, period)

    const updated = await prisma.leaderboard.findUnique({
      where: {
        type_period: {
          type,
          period,
        },
      },
    })

    return (updated?.rankings as LeaderboardEntry[]) || []
  }

  return (leaderboard.rankings as LeaderboardEntry[]) || []
}

export async function getUserRank(
  userId: string,
  type: LeaderboardType,
  period: LeaderboardPeriod,
): Promise<{ rank: number; value: number } | null> {
  const rankings = await getLeaderboard(type, period)
  const entry = rankings.find((r) => r.userId === userId)

  if (!entry) {
    return null
  }

  return {
    rank: entry.rank,
    value: entry.value,
  }
}

function getValidUntil(period: LeaderboardPeriod): Date {
  const now = new Date()

  switch (period) {
    case 'DAILY':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    case 'WEEKLY':
      const daysUntilNextWeek = 7 - now.getDay()
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + daysUntilNextWeek,
      )
    case 'MONTHLY':
      return new Date(now.getFullYear(), now.getMonth() + 1, 1)
    case 'ALL_TIME':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7) // Update weekly
    default:
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  }
}
