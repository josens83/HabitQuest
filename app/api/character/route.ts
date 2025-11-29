import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Force dynamic
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { calculateExpToNextLevel } from '@/lib/exp'

// GET /api/character - Get user's character
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch character
    const character = await prisma.character.findUnique({
      where: { userId },
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Fetch streak
    const streak = await prisma.streak.findUnique({
      where: { userId },
    })

    // Fetch equipped items
    const equippedItems = await prisma.inventoryItem.findMany({
      where: {
        userId,
        isEquipped: true,
      },
      include: {
        item: true,
      },
    })

    // Get achievement stats
    const totalAchievements = await prisma.achievement.count()
    const unlockedAchievements = await prisma.userAchievement.count({
      where: {
        userId,
        isCompleted: true,
      },
    })

    // Get progress stats
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

    // Calculate days played
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    })

    const daysPlayed = user
      ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 1

    const expToNextLevel = calculateExpToNextLevel(character.level + 1)

    // Map equipped items to slots
    const equipmentSlots = ['head', 'body', 'weapon', 'accessory', 'pet', 'background']
    const equippedItemsMap = equippedItems.reduce((acc: any, item: any) => {
      acc[item.item.category.toLowerCase()] = item
      return acc
    }, {})

    const equippedItemsArray = equipmentSlots.map((slot) => ({
      slot,
      item: equippedItemsMap[slot]
        ? {
            id: equippedItemsMap[slot].item.id,
            name: equippedItemsMap[slot].item.name,
            icon: equippedItemsMap[slot].item.icon,
            rarity: equippedItemsMap[slot].item.rarity,
            type: equippedItemsMap[slot].item.type,
          }
        : null,
    }))

    return NextResponse.json({
      character: {
        id: character.id,
        level: character.level,
        currentExp: character.currentExp,
        expToNextLevel,
        currentEnergy: character.currentEnergy,
        maxEnergy: character.maxEnergy,
        gold: character.gold,
        gems: character.gems,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        className: character.characterClass || '모험가',
        appearance: {
          skin: character.skinColor || 'default',
          hair: character.hairStyle || 'default',
          outfit: character.outfit || 'default',
        },
      },
      stats: {
        strength: character.strength,
        intelligence: character.intelligence,
        vitality: character.vitality,
        spirit: character.spirit,
        charisma: character.charisma,
      },
      equippedItems: equippedItemsArray,
      achievements: {
        total: totalAchievements,
        unlocked: unlockedAchievements,
      },
      progress: {
        totalHabits: totalHabitsCompleted,
        totalQuests: totalQuestsCompleted,
        totalExpEarned: character.totalExp,
        daysPlayed,
      },
    })
  } catch (error) {
    console.error('Character API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch character data' },
      { status: 500 },
    )
  }
}
