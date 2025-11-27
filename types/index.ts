// Define types manually (Prisma client not available in build)
export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'FAMILY'
export type CharacterClass = 'WARRIOR' | 'SCHOLAR' | 'HEALER' | 'SAGE' | 'RANGER'
export type HabitCategory = 'FITNESS' | 'LEARNING' | 'HEALTH' | 'MINDFULNESS' | 'SOCIAL' | 'PRODUCTIVITY' | 'CREATIVITY'
export type FrequencyType = 'DAILY' | 'WEEKLY' | 'CUSTOM'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY'
export type GuildRole = 'LEADER' | 'OFFICER' | 'MEMBER'

export interface User {
  id: string
  email: string | null
  name: string | null
  subscription: SubscriptionTier
  currentEnergy: number
  lastEnergyRegen: Date
}

export interface Character {
  id: string
  userId: string
  name: string
  class: CharacterClass
  level: number
  exp: number
  strength: number
  intelligence: number
  vitality: number
  spirit: number
  charisma: number
  gems: number
  gold: number
}

export interface Habit {
  id: string
  userId: string
  name: string
  description: string | null
  category: HabitCategory
  difficulty: Difficulty
  expReward: number
  goldReward: number
  timesPerDay: number
  currentStreak: number
  longestStreak: number
  totalCompletions: number
}

export interface HabitCompletion {
  id: string
  habitId: string
  completedAt: Date
  expGained: number
  goldGained: number
}

export interface Streak {
  id: string
  userId: string
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date
  streakFreezes: number
}

export interface Guild {
  id: string
  name: string
}

export interface GuildMember {
  id: string
  guildId: string
  userId: string
  role: GuildRole
}

// Character Stats
export interface CharacterStats {
  strength: number
  intelligence: number
  vitality: number
  spirit: number
  charisma: number
}

// EXP calculation
export interface ExpInfo {
  currentExp: number
  expToNextLevel: number
  level: number
  progress: number // 0-100
}

// Habit with relations
export interface HabitWithCompletions extends Habit {
  completions: HabitCompletion[]
  isCompletedToday: boolean
  todayCompletionCount: number
}

// Difficulty rewards table
export const DIFFICULTY_REWARDS = {
  EASY: { exp: 10, gold: 5 },
  MEDIUM: { exp: 25, gold: 15 },
  HARD: { exp: 50, gold: 35 },
  LEGENDARY: { exp: 100, gold: 75 },
} as const

// Stat bonus by category
export const CATEGORY_STAT_MAPPING = {
  FITNESS: 'strength',
  LEARNING: 'intelligence',
  HEALTH: 'vitality',
  MINDFULNESS: 'spirit',
  SOCIAL: 'charisma',
  PRODUCTIVITY: 'intelligence',
  CREATIVITY: 'charisma',
} as const

// Energy system config
export const ENERGY_CONFIG = {
  FREE: {
    maxEnergy: 5,
    regenRateMinutes: 60,
    dailyBonus: 2,
    adWatchReward: 1,
  },
  PREMIUM: {
    maxEnergy: 999,
    regenRateMinutes: 0,
    dailyBonus: 0,
    adWatchReward: 0,
  },
  FAMILY: {
    maxEnergy: 999,
    regenRateMinutes: 0,
    dailyBonus: 0,
    adWatchReward: 0,
  },
} as const

// Streak milestones
export interface StreakMilestone {
  days: number
  reward: {
    gems: number
    item?: string
  }
  title: string
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 7, reward: { gems: 50, item: 'bronze_badge' }, title: '일주일 챔피언' },
  { days: 14, reward: { gems: 100, item: 'costume_casual' }, title: '2주 전사' },
  { days: 30, reward: { gems: 200, item: 'pet_egg' }, title: '한 달의 영웅' },
  { days: 60, reward: { gems: 400, item: 'aura_basic' }, title: '철의 의지' },
  { days: 100, reward: { gems: 1000, item: 'legendary_costume' }, title: '백일의 전설' },
  { days: 365, reward: { gems: 5000, item: 'exclusive_title' }, title: '1년의 마스터' },
]

// Quest completion result
export interface QuestCompleteResult {
  success: boolean
  expGained: number
  goldGained: number
  leveledUp: boolean
  newLevel?: number
  statIncreases: Partial<CharacterStats>
  streakContinued: boolean
  newStreak: number
  milestoneReached?: StreakMilestone
}

// No Prisma imports needed
