import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { claimQuestReward } from '@/lib/quest/quest'
import { z } from 'zod'

const claimRewardSchema = z.object({
  questId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = claimRewardSchema.parse(body)

    const reward = await claimQuestReward(validated.questId, session.user.id)

    if (!reward) {
      return NextResponse.json(
        { error: 'Quest not completed or reward already claimed' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      reward,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error('Failed to claim quest reward:', error)
    return NextResponse.json(
      { error: 'Failed to claim quest reward' },
      { status: 500 },
    )
  }
}
