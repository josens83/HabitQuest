import { NextRequest, NextResponse } from 'next/server'
// Force dynamic
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'

// GET /api/habits/[habitId] - Get single habit
export async function GET(
  request: NextRequest,
  { params }: { params: { habitId: string } }
) {
  try {
    const habit = await prisma.habit.findUnique({
      where: { id: params.habitId },
      include: {
        completions: {
          orderBy: {
            completedAt: 'desc',
          },
          take: 30,
        },
      },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error fetching habit:', error)
    return NextResponse.json(
      { error: 'Failed to fetch habit' },
      { status: 500 }
    )
  }
}

// PATCH /api/habits/[habitId] - Update habit
export async function PATCH(
  request: NextRequest,
  { params }: { params: { habitId: string } }
) {
  try {
    const body = await request.json()

    const habit = await prisma.habit.update({
      where: { id: params.habitId },
      data: body,
    })

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error updating habit:', error)
    return NextResponse.json(
      { error: 'Failed to update habit' },
      { status: 500 }
    )
  }
}

// DELETE /api/habits/[habitId] - Archive habit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { habitId: string } }
) {
  try {
    // Soft delete - archive instead of delete
    const habit = await prisma.habit.update({
      where: { id: params.habitId },
      data: { isArchived: true },
    })

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error deleting habit:', error)
    return NextResponse.json(
      { error: 'Failed to delete habit' },
      { status: 500 }
    )
  }
}
