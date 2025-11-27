import prisma from '@/lib/prisma'
import { AchievementTargetType } from '@prisma/client'

export interface AchievementUnlockResult {
  unlocked: boolean
  achievement?: {
    id: string
    title: string
    description: string
    expReward: number
    goldReward: number
    gemReward: number
    titleReward?: string | null
  }
}

export async function checkAchievementProgress(
  userId: string,
  targetType: AchievementTargetType,
  currentValue: number,
): Promise<AchievementUnlockResult[]> {
  const results: AchievementUnlockResult[] = []

  // Find relevant achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: {
      userId,
      isCompleted: false,
      achievement: {
        targetType,
        isActive: true,
      },
    },
    include: {
      achievement: true,
    },
  })

  for (const userAchievement of userAchievements) {
    const achievement = userAchievement.achievement

    // Update progress
    await prisma.userAchievement.update({
      where: { id: userAchievement.id },
      data: {
        currentProgress: currentValue,
      },
    })

    // Check if unlocked
    if (currentValue >= achievement.targetValue) {
      await prisma.userAchievement.update({
        where: { id: userAchievement.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      })

      // Grant rewards
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          character: true,
        },
      })

      if (user?.character) {
        await prisma.character.update({
          where: { id: user.character.id },
          data: {
            exp: {
              increment: achievement.expReward,
            },
            gold: {
              increment: achievement.goldReward,
            },
            gems: {
              increment: achievement.gemReward,
            },
            ...(achievement.titleReward && {
              titles: {
                push: achievement.titleReward,
              },
            }),
          },
        })

        // Grant item rewards if any
        if (achievement.itemRewards) {
          const items = achievement.itemRewards as Array<{
            itemId: string
            quantity: number
          }>

          for (const item of items) {
            await prisma.inventoryItem.upsert({
              where: {
                userId_itemId: {
                  userId,
                  itemId: item.itemId,
                },
              },
              create: {
                userId,
                itemId: item.itemId,
                quantity: item.quantity,
              },
              update: {
                quantity: {
                  increment: item.quantity,
                },
              },
            })
          }
        }
      }

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          eventType: 'ACHIEVEMENT_UNLOCKED',
          eventData: {
            achievementId: achievement.id,
            title: achievement.title,
            tier: achievement.tier,
          },
        },
      })

      results.push({
        unlocked: true,
        achievement: {
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          expReward: achievement.expReward,
          goldReward: achievement.goldReward,
          gemReward: achievement.gemReward,
          titleReward: achievement.titleReward,
        },
      })
    } else {
      results.push({
        unlocked: false,
      })
    }
  }

  return results
}

export async function getUserAchievements(userId: string, completedOnly = false) {
  const userAchievements = await prisma.userAchievement.findMany({
    where: {
      userId,
      ...(completedOnly && { isCompleted: true }),
    },
    include: {
      achievement: true,
    },
    orderBy: [
      {
        isCompleted: 'desc',
      },
      {
        achievement: {
          tier: 'desc',
        },
      },
    ],
  })

  return userAchievements
}

export async function getAchievementStats(userId: string) {
  const total = await prisma.achievement.count({
    where: { isActive: true },
  })

  const completed = await prisma.userAchievement.count({
    where: {
      userId,
      isCompleted: true,
    },
  })

  const byCategory = await prisma.userAchievement.groupBy({
    by: ['achievementId'],
    where: {
      userId,
      isCompleted: true,
    },
    _count: true,
  })

  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}
