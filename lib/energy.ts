import { differenceInMinutes } from 'date-fns'
import { ENERGY_CONFIG, type SubscriptionTier } from '@/types'

/**
 * Calculate current energy based on last regen time
 */
export function calculateEnergy(
  currentEnergy: number,
  lastRegenTime: Date,
  subscription: SubscriptionTier
): number {
  const config = ENERGY_CONFIG[subscription as keyof typeof ENERGY_CONFIG]

  // Premium has unlimited energy
  if (subscription === 'PREMIUM' || subscription === 'FAMILY') {
    return config.maxEnergy
  }

  const now = new Date()
  const minutesPassed = differenceInMinutes(now, lastRegenTime)
  const energyGained = Math.floor(minutesPassed / config.regenRateMinutes)

  return Math.min(currentEnergy + energyGained, config.maxEnergy)
}

/**
 * Get time until next energy regen
 */
export function getTimeUntilNextEnergy(
  lastRegenTime: Date,
  subscription: SubscriptionTier
): number {
  if (subscription === 'PREMIUM' || subscription === 'FAMILY') {
    return 0
  }

  const config = ENERGY_CONFIG.FREE
  const now = new Date()
  const minutesPassed = differenceInMinutes(now, lastRegenTime)
  const minutesUntilNext = config.regenRateMinutes - (minutesPassed % config.regenRateMinutes)

  return minutesUntilNext
}

/**
 * Check if user has enough energy
 */
export function hasEnoughEnergy(
  currentEnergy: number,
  required: number,
  subscription: SubscriptionTier
): boolean {
  if (subscription === 'PREMIUM' || subscription === 'FAMILY') {
    return true
  }

  return currentEnergy >= required
}

/**
 * Energy costs for different actions
 */
export const ENERGY_COSTS = {
  completeHabit: 0,
  unlockPremiumQuest: 1,
  useStreakFreeze: 2,
  unlockSpecialReward: 3,
  skipWaitTime: 1,
} as const
