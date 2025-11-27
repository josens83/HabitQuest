import { NextRequest, NextResponse } from 'next/server'
import { paymentManager } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    const provider = request.headers.get('x-payment-provider') as any

    if (!provider || !['TOSS_PAYMENTS', 'STRIPE'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    const body = await request.json()

    // Verify webhook signature (implementation depends on provider)
    // For Toss Payments and Stripe, you would verify the signature here

    await paymentManager.handleWebhook({
      provider,
      eventType: body.type || body.eventType,
      data: body.data || body,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 },
    )
  }
}
