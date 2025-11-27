import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { paymentManager } from '@/lib/payment'
import { z } from 'zod'

const verifyPaymentSchema = z.object({
  transactionId: z.string(),
  provider: z.enum(['TOSS_PAYMENTS', 'STRIPE']),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = verifyPaymentSchema.parse(body)

    const result = await paymentManager.verifyPayment({
      transactionId: validated.transactionId,
      provider: validated.provider,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 },
    )
  }
}
