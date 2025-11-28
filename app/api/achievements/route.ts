import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserAchievements, getAchievementStats } from '@/lib/achievements/achievements'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const completedOnly = searchParams.get('completed') === 'true'

    const [achievements, stats] = await Promise.all([
      getUserAchievements(session.user.id, completedOnly),
      getAchievementStats(session.user.id),
    ])

    return NextResponse.json({ achievements, stats })
  } catch (error) {
    console.error('Failed to fetch achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 },
    )
  }
}
