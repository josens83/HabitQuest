import { z } from 'zod'

export const updateCharacterSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1).max(50).optional(),
  class: z.enum(['WARRIOR', 'SCHOLAR', 'HEALER', 'SAGE', 'RANGER']).optional(),
  avatar: z.string().optional(),
  costume: z.string().optional(),
  accessory: z.string().optional(),
  pet: z.string().nullable().optional(),
  aura: z.string().nullable().optional(),
  activeTitle: z.string().nullable().optional(),
})

export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>
