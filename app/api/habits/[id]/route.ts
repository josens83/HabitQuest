import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/habits/[id] - Get single habit with completions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const habitId = params.id

    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
      },
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
    console.error('Get habit error:', error)
    return NextResponse.json({ error: 'Failed to fetch habit' }, { status: 500 })
  }
}

// PATCH /api/habits/[id] - Update habit
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const habitId = params.id
    const body = await request.json()

    // Verify habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
      },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: body,
    })

    return NextResponse.json(updatedHabit)
  } catch (error) {
    console.error('Update habit error:', error)
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 })
  }
}

// DELETE /api/habits/[id] - Delete (archive) a habit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const habitId = params.id

    // Verify habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId,
      },
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.habit.update({
      where: { id: habitId },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete habit error:', error)
    return NextResponse.json(
      { error: 'Failed to delete habit' },
      { status: 500 },
    )
  }
}
