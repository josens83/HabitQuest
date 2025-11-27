import 'next-auth'
import { SubscriptionTier } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      subscription?: SubscriptionTier
      currentEnergy?: number
      character?: {
        id: string
        name: string
        level: number
        exp: number
        class: string
        avatar: string
      } | null
    }
  }

  interface User {
    id: string
    subscription?: SubscriptionTier
    currentEnergy?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string
  }
}
