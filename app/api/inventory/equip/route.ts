import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { equipItem } from '@/lib/inventory/inventory'
import { z } from 'zod'

const equipItemSchema = z.object({
  itemId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = equipItemSchema.parse(body)

    const result = await equipItem(session.user.id, validated.itemId)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error('Failed to equip item:', error)
    return NextResponse.json({ error: 'Failed to equip item' }, { status: 500 })
  }
}
