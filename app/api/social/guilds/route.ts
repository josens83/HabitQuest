import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createGuild,
  joinGuild,
  leaveGuild,
  getGuildInfo,
  getTopGuilds,
} from '@/lib/social/guilds'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'my'

    if (type === 'top') {
      const guilds = await getTopGuilds(10)
      return NextResponse.json({ guilds })
    }

    // Get user's guild
    const membership = await prisma.guildMember.findFirst({
      where: { userId: session.user.id },
    })

    if (!membership) {
      return NextResponse.json({ guild: null })
    }

    const guild = await getGuildInfo(membership.guildId)
    return NextResponse.json({ guild })
  } catch (error) {
    console.error('Failed to fetch guild:', error)
    return NextResponse.json({ error: 'Failed to fetch guild' }, { status: 500 })
  }
}

const guildActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('create'),
    name: z.string().min(1).max(50),
    emblem: z.string(),
  }),
  z.object({
    action: z.literal('join'),
    guildId: z.string().min(1),
  }),
  z.object({
    action: z.literal('leave'),
  }),
])

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = guildActionSchema.parse(body)

    let result

    switch (validated.action) {
      case 'create':
        result = await createGuild(session.user.id, validated.name, validated.emblem)
        break
      case 'join':
        result = await joinGuild(session.user.id, validated.guildId)
        break
      case 'leave':
        result = await leaveGuild(session.user.id)
        break
    }

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error('Failed to process guild action:', error)
    return NextResponse.json(
      { error: 'Failed to process guild action' },
      { status: 500 },
    )
  }
}
