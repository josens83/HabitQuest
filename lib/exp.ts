import type { ExpInfo } from '@/types'

/**
 * Calculate EXP required for next level
 * Formula: baseExp * (level ^ 1.5)
 */
export function calculateExpToNextLevel(level: number): number {
  const baseExp = 100
  return Math.floor(baseExp * Math.pow(level, 1.5))
}

/**
 * Get character level from total EXP
 */
export function getLevelFromExp(totalExp: number): number {
  let level = 1
  let expRequired = 0

  while (expRequired <= totalExp) {
    level++
    expRequired += calculateExpToNextLevel(level - 1)
  }

  return level - 1
}

/**
 * Get EXP info for character
 */
export function getExpInfo(currentExp: number): ExpInfo {
  const level = getLevelFromExp(currentExp)
  const expToNextLevel = calculateExpToNextLevel(level)

  // Calculate exp in current level
  let totalExpForCurrentLevel = 0
  for (let i = 1; i < level; i++) {
    totalExpForCurrentLevel += calculateExpToNextLevel(i)
  }

  const expInCurrentLevel = currentExp - totalExpForCurrentLevel
  const progress = Math.floor((expInCurrentLevel / expToNextLevel) * 100)

  return {
    currentExp: expInCurrentLevel,
    expToNextLevel,
    level,
    progress: Math.min(progress, 100),
  }
}

/**
 * Check if character leveled up after gaining EXP
 */
export function checkLevelUp(oldExp: number, newExp: number): {
  leveledUp: boolean
  oldLevel: number
  newLevel: number
} {
  const oldLevel = getLevelFromExp(oldExp)
  const newLevel = getLevelFromExp(newExp)

  return {
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
  }
}

/**
 * Calculate stat increase on level up
 * Each level gives +1 to all stats, +2 to class-specific stat
 */
export function calculateStatIncrease(
  characterClass: string,
  levelsGained: number
): Record<string, number> {
  const baseIncrease = levelsGained
  const classBonus = levelsGained * 2

  const stats: Record<string, number> = {
    strength: baseIncrease,
    intelligence: baseIncrease,
    vitality: baseIncrease,
    spirit: baseIncrease,
    charisma: baseIncrease,
  }

  // Add class-specific bonus
  switch (characterClass) {
    case 'WARRIOR':
      stats.strength += classBonus
      break
    case 'SCHOLAR':
      stats.intelligence += classBonus
      break
    case 'HEALER':
      stats.vitality += classBonus
      break
    case 'SAGE':
      stats.spirit += classBonus
      break
    case 'RANGER':
      // Balanced - small bonus to all
      Object.keys(stats).forEach(key => {
        stats[key] += Math.floor(classBonus / 5)
      })
      break
  }

  return stats
}
