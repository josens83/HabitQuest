import { prisma } from '@/lib/prisma'

type QuestTargetType = 'COMPLETE_HABIT' | 'COMPLETE_QUEST' | 'REACH_LEVEL' | 'EARN_ACHIEVEMENT'
type QuestType = 'DAILY' | 'WEEKLY' | 'EVENT' | 'STORY'

export interface QuestProgressUpdate {
  questId: string
  userId: string
  increment: number
}

export interface QuestCompletionReward {
  expGained: number
  goldGained: number
  gemGained: number
  itemsGained: Array<{ itemId: string; quantity: number }>
}

export async function updateQuestProgress(
  params: QuestProgressUpdate,
): Promise<QuestCompletionReward | null> {
  const { questId, userId, increment } = params

  const quest = await prisma.quest.findUnique({
    where: { id: questId },
  })

  if (!quest || !quest.isActive) {
    return null
  }

  // Find or create progress
  const now = new Date()
  const progress = await prisma.questProgress.upsert({
    where: {
      questId_userId_resetAt: {
        questId,
        userId,
        resetAt: quest.resetPeriod ? getResetDate(quest.resetPeriod) : null,
      },
    },
    create: {
      questId,
      userId,
      currentCount: increment,
      resetAt: quest.resetPeriod ? getResetDate(quest.resetPeriod) : null,
    },
    update: {
      currentCount: {
        increment,
      },
    },
  })

  // Check if quest is completed
  if (
    !progress.isCompleted &&
    progress.currentCount + increment >= quest.targetCount
  ) {
    await prisma.questProgress.update({
      where: { id: progress.id },
      data: {
        isCompleted: true,
        completedAt: now,
        currentCount: quest.targetCount, // Cap at target
      },
    })

    // Return rewards (don't grant them yet, let the caller do that)
    return {
      expGained: quest.expReward,
      goldGained: quest.goldReward,
      gemGained: quest.gemReward,
      itemsGained: quest.itemRewards
        ? (quest.itemRewards as Array<{ itemId: string; quantity: number }>)
        : [],
    }
  }

  return null
}

export async function claimQuestReward(
  questId: string,
  userId: string,
): Promise<QuestCompletionReward | null> {
  const progress = await prisma.questProgress.findFirst({
    where: {
      questId,
      userId,
      isCompleted: true,
      rewardClaimed: false,
    },
    include: {
      quest: true,
      user: {
        include: {
          character: true,
        },
      },
    },
  })

  if (!progress) {
    return null
  }

  // Mark reward as claimed
  await prisma.questProgress.update({
    where: { id: progress.id },
    data: {
      rewardClaimed: true,
      claimedAt: new Date(),
    },
  })

  const quest = progress.quest

  // Grant EXP and level up if needed
  if (progress.user.character) {
    await prisma.character.update({
      where: { id: progress.user.character.id },
      data: {
        exp: {
          increment: quest.expReward,
        },
        gold: {
          increment: quest.goldReward,
        },
        gems: {
          increment: quest.gemReward,
        },
      },
    })
  }

  // Grant item rewards
  if (quest.itemRewards) {
    const items = quest.itemRewards as Array<{ itemId: string; quantity: number }>

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

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId,
      eventType: 'QUEST_COMPLETED',
      eventData: {
        questId,
        questTitle: quest.title,
        rewards: {
          exp: quest.expReward,
          gold: quest.goldReward,
          gems: quest.gemReward,
        },
      },
    },
  })

  return {
    expGained: quest.expReward,
    goldGained: quest.goldReward,
    gemGained: quest.gemReward,
    itemsGained: [],
  }
}

export async function checkQuestTrigger(
  userId: string,
  targetType: QuestTargetType,
  targetValue?: string,
): Promise<void> {
  // Find relevant quests
  const quests = await prisma.quest.findMany({
    where: {
      targetType,
      ...(targetValue && { targetValue }),
      isActive: true,
    },
  })

  // Update progress for each quest
  for (const quest of quests) {
    await updateQuestProgress({
      questId: quest.id,
      userId,
      increment: 1,
    })
  }
}

function getResetDate(resetPeriod: string): Date {
  const now = new Date()

  switch (resetPeriod) {
    case 'DAILY':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'WEEKLY':
      const dayOfWeek = now.getDay()
      const diff = now.getDate() - dayOfWeek
      return new Date(now.getFullYear(), now.getMonth(), diff)
    case 'MONTHLY':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    default:
      return now
  }
}

export async function getDailyQuests(userId: string) {
  const today = getResetDate('DAILY')

  const quests = await prisma.quest.findMany({
    where: {
      type: 'DAILY',
      isActive: true,
    },
    include: {
      progress: {
        where: {
          userId,
          resetAt: today,
        },
      },
    },
  })

  return quests
}

export async function getWeeklyQuests(userId: string) {
  const thisWeek = getResetDate('WEEKLY')

  const quests = await prisma.quest.findMany({
    where: {
      type: 'WEEKLY',
      isActive: true,
    },
    include: {
      progress: {
        where: {
          userId,
          resetAt: thisWeek,
        },
      },
    },
  })

  return quests
}
