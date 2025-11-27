import { NextRequest, NextResponse } from 'next/server'
// Force dynamic
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getExpInfo } from '@/lib/exp'

// GET /api/character - Get user's character
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    let character = await prisma.character.findUnique({
      where: { userId },
    })

    // Create character if doesn't exist
    if (!character) {
      character = await prisma.character.create({
        data: {
          userId,
          name: '모험가',
          class: 'RANGER',
        },
      })
    }

    // Calculate EXP info
    const expInfo = getExpInfo(character.exp)

    return NextResponse.json({
      ...character,
      expInfo,
    })
  } catch (error) {
    console.error('Error fetching character:', error)
    return NextResponse.json(
      { error: 'Failed to fetch character' },
      { status: 500 }
    )
  }
}

// PATCH /api/character - Update character
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...updateData } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const character = await prisma.character.update({
      where: { userId },
      data: updateData,
    })

    const expInfo = getExpInfo(character.exp)

    return NextResponse.json({
      ...character,
      expInfo,
    })
  } catch (error) {
    console.error('Error updating character:', error)
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    )
  }
}
