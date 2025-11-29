import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import KakaoProvider from 'next-auth/providers/kakao'
import AppleProvider from 'next-auth/providers/apple'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // Kakao OAuth
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Apple OAuth
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!

        // Fetch additional user data from database
        const user = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: {
            subscription: true,
            currentEnergy: true,
            character: {
              select: {
                id: true,
                name: true,
                level: true,
                exp: true,
                class: true,
                avatar: true,
              },
            },
          },
        })

        if (user) {
          session.user.subscription = user.subscription
          session.user.currentEnergy = user.currentEnergy
          session.user.character = user.character
        }
      }
      return session
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id
      }

      // Update token when session is updated
      if (trigger === 'update' && session) {
        return { ...token, ...session }
      }

      return token
    },

    async signIn({ user, account, profile }) {
      // Create character for new users
      if (user.id) {
        const existingCharacter = await prisma.character.findUnique({
          where: { userId: user.id },
        })

        if (!existingCharacter) {
          // Create default character
          await prisma.character.create({
            data: {
              userId: user.id,
              name: user.name || 'Hero',
              class: 'RANGER',
            },
          })

          // Create default streak
          await prisma.streak.create({
            data: {
              userId: user.id,
            },
          })

          // Create notification settings
          await prisma.notificationSettings.create({
            data: {
              userId: user.id,
            },
          })

          // Give starter items
          const starterItems = [
            { itemId: 'item-energy-potion', quantity: 3 },
            { itemId: 'item-streak-freeze', quantity: 1 },
          ]

          for (const item of starterItems) {
            await prisma.inventoryItem.create({
              data: {
                userId: user.id,
                itemId: item.itemId,
                quantity: item.quantity,
              },
            })
          }
        }
      }

      return true
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      if (user.id) {
        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            eventType: 'USER_LOGIN',
          },
        })

        // Initialize achievements for new users
        if (isNewUser) {
          const allAchievements = await prisma.achievement.findMany({
            where: { isActive: true },
          })

          await prisma.userAchievement.createMany({
            data: allAchievements.map((achievement: any) => ({
              userId: user.id,
              achievementId: achievement.id,
            })),
          })
        }
      }
    },

    async signOut({ token }) {
      if (token.sub) {
        await prisma.activityLog.create({
          data: {
            userId: token.sub,
            eventType: 'USER_LOGOUT',
          },
        })
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
}
