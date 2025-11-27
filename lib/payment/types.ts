import { PaymentProvider, SubscriptionTier, TransactionStatus } from '@prisma/client'

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  redirectUrl?: string
}

export interface SubscriptionPlan {
  tier: SubscriptionTier
  name: string
  price: number
  currency: string
  durationDays: number
  benefits: string[]
}

export interface CreatePaymentParams {
  userId: string
  tier: SubscriptionTier
  amount: number
  currency: string
  returnUrl: string
  cancelUrl: string
}

export interface VerifyPaymentParams {
  transactionId: string
  provider: PaymentProvider
  metadata?: Record<string, any>
}

export interface WebhookPayload {
  provider: PaymentProvider
  eventType: string
  data: any
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  FREE: {
    tier: 'FREE',
    name: '무료',
    price: 0,
    currency: 'KRW',
    durationDays: 0,
    benefits: [
      '기본 습관 추적',
      '일일 에너지 5개',
      '캐릭터 시스템',
      '일일 퀘스트 1개',
    ],
  },
  PREMIUM: {
    tier: 'PREMIUM',
    name: '프리미엄',
    price: 9900,
    currency: 'KRW',
    durationDays: 30,
    benefits: [
      '무제한 습관 추적',
      '일일 에너지 15개',
      '모든 퀘스트 접근',
      '전용 코스튬 및 아이템',
      '광고 제거',
      '우선 지원',
    ],
  },
  FAMILY: {
    tier: 'FAMILY',
    name: '패밀리',
    price: 19900,
    currency: 'KRW',
    durationDays: 30,
    benefits: [
      '프리미엄 모든 혜택',
      '최대 5명 계정',
      '가족 통계 및 리더보드',
      '가족 전용 퀘스트',
      '공유 업적',
    ],
  },
}

export interface IPaymentProvider {
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>
  verifyPayment(params: VerifyPaymentParams): Promise<PaymentResult>
  handleWebhook(payload: WebhookPayload): Promise<void>
  cancelSubscription(transactionId: string): Promise<PaymentResult>
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResult>
}
