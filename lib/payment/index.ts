import { TossPaymentsProvider } from './toss'
import { StripeProvider } from './stripe'
import {
  IPaymentProvider,
  CreatePaymentParams,
  VerifyPaymentParams,
  WebhookPayload,
  PaymentResult,
  SUBSCRIPTION_PLANS,
} from './types'

type PaymentProvider = 'TOSS_PAYMENTS' | 'STRIPE' | 'PAYPAL'

export class PaymentManager {
  private providers: Map<PaymentProvider, IPaymentProvider>

  constructor() {
    this.providers = new Map()
    this.providers.set('TOSS_PAYMENTS', new TossPaymentsProvider())
    this.providers.set('STRIPE', new StripeProvider())
  }

  getProvider(provider: PaymentProvider): IPaymentProvider {
    const providerInstance = this.providers.get(provider)
    if (!providerInstance) {
      throw new Error(`Payment provider ${provider} not found`)
    }
    return providerInstance
  }

  async createPayment(
    provider: PaymentProvider,
    params: CreatePaymentParams,
  ): Promise<PaymentResult> {
    const providerInstance = this.getProvider(provider)
    return providerInstance.createPayment(params)
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<PaymentResult> {
    const providerInstance = this.getProvider(params.provider)
    return providerInstance.verifyPayment(params)
  }

  async handleWebhook(payload: WebhookPayload): Promise<void> {
    const providerInstance = this.getProvider(payload.provider)
    return providerInstance.handleWebhook(payload)
  }

  async cancelSubscription(
    provider: PaymentProvider,
    transactionId: string,
  ): Promise<PaymentResult> {
    const providerInstance = this.getProvider(provider)
    return providerInstance.cancelSubscription(transactionId)
  }

  async refundPayment(
    provider: PaymentProvider,
    transactionId: string,
    amount?: number,
  ): Promise<PaymentResult> {
    const providerInstance = this.getProvider(provider)
    return providerInstance.refundPayment(transactionId, amount)
  }
}

// Export singleton instance
export const paymentManager = new PaymentManager()

// Export types and constants
export * from './types'
export { SUBSCRIPTION_PLANS }
