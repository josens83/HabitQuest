import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSettingsSchema = z.object({
  notifications: z.object({
    dailyReminder: z.boolean().optional(),
    questComplete: z.boolean().optional(),
    achievementUnlocked: z.boolean().optional(),
    friendRequest: z.boolean().optional(),
    guildActivity: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
  }).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.enum(['ko', 'en']).optional(),
    timezone: z.string().optional(),
  }).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch user with subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        notificationSettings: true,
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          orderBy: {
            expiresAt: 'desc',
          },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const notificationSettings = user.notificationSettings || {}
    const activeSubscription = user.subscriptions[0]

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      notifications: {
        dailyReminder: notificationSettings.dailyReminder ?? true,
        questComplete: notificationSettings.questComplete ?? true,
        achievementUnlocked: notificationSettings.achievementUnlocked ?? true,
        friendRequest: notificationSettings.friendRequest ?? true,
        guildActivity: notificationSettings.guildActivity ?? true,
        emailNotifications: notificationSettings.emailNotifications ?? false,
      },
      preferences: {
        theme: (user.theme as 'light' | 'dark' | 'system') || 'system',
        language: (user.language as 'ko' | 'en') || 'ko',
        timezone: user.timezone || 'Asia/Seoul',
      },
      subscription: {
        tier: activeSubscription?.plan || 'FREE',
        expiresAt: activeSubscription?.expiresAt?.toISOString() || null,
      },
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    const validatedData = updateSettingsSchema.parse(body)

    // Update notification settings
    if (validatedData.notifications) {
      const notificationSettings = await prisma.notificationSettings.findUnique({
        where: { userId },
      })

      if (notificationSettings) {
        await prisma.notificationSettings.update({
          where: { userId },
          data: validatedData.notifications,
        })
      } else {
        await prisma.notificationSettings.create({
          data: {
            userId,
            ...validatedData.notifications,
          },
        })
      }
    }

    // Update preferences (theme, language, timezone)
    if (validatedData.preferences) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          theme: validatedData.preferences.theme,
          language: validatedData.preferences.language,
          timezone: validatedData.preferences.timezone,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings PUT error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 },
    )
  }
}
