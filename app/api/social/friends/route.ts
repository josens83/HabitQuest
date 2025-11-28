import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from '@/lib/social/friends'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'friends'

    if (type === 'pending') {
      const requests = await getPendingRequests(session.user.id)
      return NextResponse.json({ requests })
    }

    const friends = await getFriends(session.user.id)
    return NextResponse.json({ friends })
  } catch (error) {
    console.error('Failed to fetch friends:', error)
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 })
  }
}

const friendActionSchema = z.object({
  action: z.enum(['send', 'accept', 'decline', 'remove']),
  userId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = friendActionSchema.parse(body)

    let result

    switch (validated.action) {
      case 'send':
        result = await sendFriendRequest(session.user.id, validated.userId)
        break
      case 'accept':
        result = await acceptFriendRequest(validated.userId, session.user.id)
        break
      case 'decline':
        result = await declineFriendRequest(validated.userId, session.user.id)
        break
      case 'remove':
        result = await removeFriend(session.user.id, validated.userId)
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

    console.error('Failed to process friend action:', error)
    return NextResponse.json(
      { error: 'Failed to process friend action' },
      { status: 500 },
    )
  }
}
