import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { paymentManager, SUBSCRIPTION_PLANS } from '@/lib/payment'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  tier: z.enum(['PREMIUM', 'FAMILY']),
  provider: z.enum(['TOSS_PAYMENTS', 'STRIPE']),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createSubscriptionSchema.parse(body)

    const plan = SUBSCRIPTION_PLANS[validated.tier]

    const result = await paymentManager.createPayment(validated.provider, {
      userId: session.user.id,
      tier: validated.tier,
      amount: plan.price,
      currency: plan.currency,
      returnUrl: validated.returnUrl,
      cancelUrl: validated.cancelUrl,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      transactionId: result.transactionId,
      redirectUrl: result.redirectUrl,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 },
    )
  }
}
