import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLeaderboard, getUserRank } from '@/lib/social/leaderboards'
import { LeaderboardType, LeaderboardPeriod } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams

    const type = (searchParams.get('type') || 'LEVEL') as LeaderboardType
    const period = (searchParams.get('period') || 'ALL_TIME') as LeaderboardPeriod

    const rankings = await getLeaderboard(type, period)

    let userRank = null
    if (session?.user?.id) {
      userRank = await getUserRank(session.user.id, type, period)
    }

    return NextResponse.json({ rankings, userRank })
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 },
    )
  }
}
