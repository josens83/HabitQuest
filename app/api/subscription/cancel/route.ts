import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { paymentManager } from '@/lib/payment'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const cancelSubscriptionSchema = z.object({
  transactionId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = cancelSubscriptionSchema.parse(body)

    // Verify user owns this transaction
    const transaction = await prisma.subscriptionTransaction.findUnique({
      where: { transactionId: validated.transactionId },
    })

    if (!transaction || transaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const result = await paymentManager.cancelSubscription(
      transaction.provider,
      validated.transactionId,
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        eventType: 'SUBSCRIPTION_CANCELLED',
        eventData: { transactionId: validated.transactionId },
      },
    })

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 },
    )
  }
}
