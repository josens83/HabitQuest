import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDailyQuests, getWeeklyQuests } from '@/lib/quest/quest'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'

    let quests

    if (type === 'daily') {
      quests = await getDailyQuests(session.user.id)
    } else if (type === 'weekly') {
      quests = await getWeeklyQuests(session.user.id)
    } else {
      // Get both
      const [daily, weekly] = await Promise.all([
        getDailyQuests(session.user.id),
        getWeeklyQuests(session.user.id),
      ])
      quests = [...daily, ...weekly]
    }

    return NextResponse.json({ quests })
  } catch (error) {
    console.error('Failed to fetch quests:', error)
    return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 })
  }
}
