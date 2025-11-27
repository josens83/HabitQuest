import { NextRequest, NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS } from '@/lib/payment'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      plans: Object.values(SUBSCRIPTION_PLANS),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 },
    )
  }
}
