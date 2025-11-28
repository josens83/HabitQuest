import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getShopItems, purchaseItem } from '@/lib/inventory/inventory'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') as any
    const type = searchParams.get('type') as any

    const items = await getShopItems(category, type)

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Failed to fetch shop items:', error)
    return NextResponse.json({ error: 'Failed to fetch shop items' }, { status: 500 })
  }
}

const purchaseItemSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = purchaseItemSchema.parse(body)

    const result = await purchaseItem(
      session.user.id,
      validated.itemId,
      validated.quantity,
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error('Failed to purchase item:', error)
    return NextResponse.json({ error: 'Failed to purchase item' }, { status: 500 })
  }
}
