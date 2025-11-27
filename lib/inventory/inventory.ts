import prisma from '@/lib/prisma'
import { ItemCategory, ItemType } from '@prisma/client'

export interface UseItemResult {
  success: boolean
  message: string
  effects?: Array<{ type: string; value: number; duration?: number }>
}

export async function useItem(
  userId: string,
  itemId: string,
): Promise<UseItemResult> {
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
    include: {
      item: true,
      user: {
        include: {
          character: true,
          streak: true,
        },
      },
    },
  })

  if (!inventoryItem || inventoryItem.quantity < 1) {
    return {
      success: false,
      message: 'Item not found in inventory',
    }
  }

  const item = inventoryItem.item

  if (item.type !== 'CONSUMABLE' && item.type !== 'BOOST') {
    return {
      success: false,
      message: 'This item cannot be used',
    }
  }

  const effects = item.effects as Array<{
    type: string
    value: number
    duration?: number
  }> | null

  if (!effects) {
    return {
      success: false,
      message: 'Item has no effects',
    }
  }

  // Apply effects
  for (const effect of effects) {
    switch (effect.type) {
      case 'ENERGY_RESTORE':
        await prisma.user.update({
          where: { id: userId },
          data: {
            currentEnergy: {
              increment: effect.value,
            },
          },
        })
        break

      case 'STREAK_FREEZE':
        if (inventoryItem.user.streak) {
          await prisma.streak.update({
            where: { id: inventoryItem.user.streak.id },
            data: {
              streakFreezes: {
                increment: effect.value,
              },
            },
          })
        }
        break

      case 'EXP_BOOST':
      case 'GOLD_BOOST':
        // Boosts are handled by creating active boost entries
        // For now, we'll just log the usage
        break
    }
  }

  // Decrease quantity or remove item
  if (inventoryItem.quantity > 1) {
    await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: {
        quantity: {
          decrement: 1,
        },
      },
    })
  } else {
    await prisma.inventoryItem.delete({
      where: { id: inventoryItem.id },
    })
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId,
      eventType: 'ITEM_USED',
      eventData: {
        itemId,
        itemName: item.name,
        effects,
      },
    },
  })

  return {
    success: true,
    message: `Successfully used ${item.name}`,
    effects,
  }
}

export async function purchaseItem(
  userId: string,
  itemId: string,
  quantity: number = 1,
): Promise<UseItemResult> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  })

  if (!item || !item.isAvailable) {
    return {
      success: false,
      message: 'Item not available',
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      character: true,
    },
  })

  if (!user?.character) {
    return {
      success: false,
      message: 'Character not found',
    }
  }

  // Check if user can afford it
  const totalPrice = (item.buyPrice || 0) * quantity
  const totalGemPrice = (item.gemPrice || 0) * quantity

  if (totalPrice > 0 && user.character.gold < totalPrice) {
    return {
      success: false,
      message: 'Not enough gold',
    }
  }

  if (totalGemPrice > 0 && user.character.gems < totalGemPrice) {
    return {
      success: false,
      message: 'Not enough gems',
    }
  }

  // Deduct currency
  await prisma.character.update({
    where: { id: user.character.id },
    data: {
      ...(totalPrice > 0 && {
        gold: {
          decrement: totalPrice,
        },
      }),
      ...(totalGemPrice > 0 && {
        gems: {
          decrement: totalGemPrice,
        },
      }),
    },
  })

  // Add item to inventory
  await prisma.inventoryItem.upsert({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
    create: {
      userId,
      itemId,
      quantity,
    },
    update: {
      quantity: {
        increment: quantity,
      },
    },
  })

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId,
      eventType: 'ITEM_PURCHASED',
      eventData: {
        itemId,
        itemName: item.name,
        quantity,
        goldSpent: totalPrice,
        gemsSpent: totalGemPrice,
      },
    },
  })

  return {
    success: true,
    message: `Successfully purchased ${item.name} x${quantity}`,
  }
}

export async function equipItem(
  userId: string,
  itemId: string,
): Promise<UseItemResult> {
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
    include: {
      item: true,
    },
  })

  if (!inventoryItem) {
    return {
      success: false,
      message: 'Item not found in inventory',
    }
  }

  if (inventoryItem.item.type !== 'COSMETIC') {
    return {
      success: false,
      message: 'This item cannot be equipped',
    }
  }

  // Unequip other items of the same category
  await prisma.inventoryItem.updateMany({
    where: {
      userId,
      item: {
        category: inventoryItem.item.category,
      },
      isEquipped: true,
    },
    data: {
      isEquipped: false,
    },
  })

  // Equip this item
  await prisma.inventoryItem.update({
    where: { id: inventoryItem.id },
    data: {
      isEquipped: true,
    },
  })

  return {
    success: true,
    message: `Successfully equipped ${inventoryItem.item.name}`,
  }
}

export async function getInventory(userId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: {
      userId,
    },
    include: {
      item: true,
    },
    orderBy: [
      {
        isEquipped: 'desc',
      },
      {
        obtainedAt: 'desc',
      },
    ],
  })

  return items
}

export async function getShopItems(category?: ItemCategory, type?: ItemType) {
  const items = await prisma.item.findMany({
    where: {
      isAvailable: true,
      ...(category && { category }),
      ...(type && { type }),
      OR: [{ buyPrice: { not: null } }, { gemPrice: { not: null } }],
    },
    orderBy: [
      {
        rarity: 'desc',
      },
      {
        name: 'asc',
      },
    ],
  })

  return items
}
