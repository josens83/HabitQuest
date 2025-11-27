import { z } from 'zod'

export const createHabitSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Habit name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  category: z.enum([
    'FITNESS',
    'LEARNING',
    'HEALTH',
    'MINDFULNESS',
    'SOCIAL',
    'PRODUCTIVITY',
    'CREATIVITY',
  ]),
  icon: z.string().default('target'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#6366F1'),
  frequencyType: z.enum(['DAILY', 'WEEKLY', 'CUSTOM']).default('DAILY'),
  daysOfWeek: z.array(z.number().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
  timesPerDay: z.number().int().min(1).max(10).default(1),
  targetTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format').optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'LEGENDARY']).default('MEDIUM'),
})

export const updateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z
    .enum(['FITNESS', 'LEARNING', 'HEALTH', 'MINDFULNESS', 'SOCIAL', 'PRODUCTIVITY', 'CREATIVITY'])
    .optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  frequencyType: z.enum(['DAILY', 'WEEKLY', 'CUSTOM']).optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  timesPerDay: z.number().int().min(1).max(10).optional(),
  targetTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'LEGENDARY']).optional(),
  isArchived: z.boolean().optional(),
})

export const completeQuestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  habitId: z.string().min(1, 'Habit ID is required'),
  note: z.string().max(200, 'Note is too long').optional(),
})

export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>
export type CompleteQuestInput = z.infer<typeof completeQuestSchema>
