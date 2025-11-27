import { differenceInDays, startOfDay } from 'date-fns'
import { STREAK_MILESTONES, type StreakMilestone } from '@/types'

export interface StreakResult {
  status: 'already_active' | 'continued' | 'freeze_used' | 'broken'
  streak: number
  previousStreak?: number
  freezesRemaining?: number
  milestone?: StreakMilestone
}

/**
 * Check and update streak status
 */
export function checkStreak(
  lastActiveDate: Date,
  currentStreak: number,
  streakFreezes: number
): StreakResult {
  const today = startOfDay(new Date())
  const lastActive = startOfDay(lastActiveDate)
  const daysDiff = differenceInDays(today, lastActive)

  // Already active today
  if (daysDiff === 0) {
    return {
      status: 'already_active',
      streak: currentStreak,
    }
  }

  // Consecutive day - continue streak
  if (daysDiff === 1) {
    const newStreak = currentStreak + 1
    const milestone = checkMilestone(newStreak)

    return {
      status: 'continued',
      streak: newStreak,
      milestone,
    }
  }

  // 2 days passed - can use freeze
  if (daysDiff === 2 && streakFreezes > 0) {
    return {
      status: 'freeze_used',
      streak: currentStreak,
      freezesRemaining: streakFreezes - 1,
    }
  }

  // Streak broken
  return {
    status: 'broken',
    streak: 0,
    previousStreak: currentStreak,
  }
}

/**
 * Check if streak reached a milestone
 */
export function checkMilestone(streak: number): StreakMilestone | undefined {
  return STREAK_MILESTONES.find(m => m.days === streak)
}

/**
 * Get next milestone
 */
export function getNextMilestone(currentStreak: number): StreakMilestone | null {
  return STREAK_MILESTONES.find(m => m.days > currentStreak) || null
}

/**
 * Calculate progress to next milestone
 */
export function getMilestoneProgress(currentStreak: number): {
  current: number
  target: number
  progress: number
} {
  const nextMilestone = getNextMilestone(currentStreak)

  if (!nextMilestone) {
    return {
      current: currentStreak,
      target: currentStreak,
      progress: 100,
    }
  }

  const previousMilestone = [...STREAK_MILESTONES]
    .reverse()
    .find(m => m.days <= currentStreak)

  const start = previousMilestone?.days || 0
  const range = nextMilestone.days - start
  const progress = ((currentStreak - start) / range) * 100

  return {
    current: currentStreak,
    target: nextMilestone.days,
    progress: Math.floor(progress),
  }
}
