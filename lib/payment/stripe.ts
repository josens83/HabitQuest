import {
  IPaymentProvider,
  PaymentResult,
  CreatePaymentParams,
  VerifyPaymentParams,
  WebhookPayload,
} from './types'
import prisma from '@/lib/prisma'

export class StripeProvider implements IPaymentProvider {
  private publicKey: string
  private secretKey: string
  private webhookSecret: string

  constructor() {
    this.publicKey = process.env.STRIPE_PUBLIC_KEY || ''
    this.secretKey = process.env.STRIPE_SECRET_KEY || ''
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const { userId, tier, amount, currency, returnUrl, cancelUrl } = params

      // Note: In production, use Stripe SDK
      // This is a simplified implementation
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${this.secretKey}`,
        },
        body: new URLSearchParams({
          'payment_method_types[]': 'card',
          'line_items[0][price_data][currency]': currency.toLowerCase(),
          'line_items[0][price_data][product_data][name]': `HabitQuest ${tier} Subscription`,
          'line_items[0][price_data][unit_amount]': amount.toString(),
          'line_items[0][quantity]': '1',
          mode: 'subscription',
          success_url: returnUrl,
          cancel_url: cancelUrl,
          'metadata[userId]': userId,
          'metadata[tier]': tier,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.error?.message || 'Payment creation failed',
        }
      }

      const session = await response.json()

      // Create pending transaction
      await prisma.subscriptionTransaction.create({
        data: {
          userId,
          tier,
          provider: 'STRIPE',
          transactionId: session.id,
          amount,
          currency,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'PENDING',
          metadata: session,
        },
      })

      return {
        success: true,
        transactionId: session.id,
        redirectUrl: session.url,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<PaymentResult> {
    try {
      const { transactionId } = params

      const response = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${transactionId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      )

      if (!response.ok) {
        return {
          success: false,
          error: 'Payment verification failed',
        }
      }

      const session = await response.json()

      if (session.payment_status === 'paid') {
        const transaction = await prisma.subscriptionTransaction.update({
          where: { transactionId },
          data: {
            status: 'COMPLETED',
            metadata: session,
          },
          include: {
            user: true,
          },
        })

        // Update user subscription
        await prisma.user.update({
          where: { id: transaction.userId },
          data: {
            subscription: transaction.tier,
            subscriptionEndsAt: transaction.endDate,
          },
        })

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: transaction.userId,
            eventType: 'SUBSCRIPTION_STARTED',
            eventData: { tier: transaction.tier, provider: 'STRIPE' },
          },
        })

        return {
          success: true,
          transactionId,
        }
      }

      return {
        success: false,
        error: 'Payment not completed',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async handleWebhook(payload: WebhookPayload): Promise<void> {
    const { eventType, data } = payload

    switch (eventType) {
      case 'checkout.session.completed':
        await this.verifyPayment({
          transactionId: data.id,
          provider: 'STRIPE',
        })
        break

      case 'customer.subscription.deleted':
        await prisma.subscriptionTransaction.updateMany({
          where: {
            transactionId: data.id,
            status: 'COMPLETED',
          },
          data: { status: 'CANCELLED' },
        })
        break

      case 'charge.refunded':
        await prisma.subscriptionTransaction.updateMany({
          where: {
            transactionId: data.payment_intent,
            status: 'COMPLETED',
          },
          data: { status: 'REFUNDED' },
        })
        break
    }
  }

  async cancelSubscription(transactionId: string): Promise<PaymentResult> {
    try {
      // Get subscription ID from transaction
      const transaction = await prisma.subscriptionTransaction.findUnique({
        where: { transactionId },
      })

      if (!transaction?.metadata) {
        return {
          success: false,
          error: 'Transaction not found',
        }
      }

      const subscriptionId = (transaction.metadata as any).subscription

      const response = await fetch(
        `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      )

      if (!response.ok) {
        return {
          success: false,
          error: 'Cancellation failed',
        }
      }

      await prisma.subscriptionTransaction.update({
        where: { transactionId },
        data: { status: 'CANCELLED' },
      })

      return {
        success: true,
        transactionId,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    try {
      const transaction = await prisma.subscriptionTransaction.findUnique({
        where: { transactionId },
      })

      if (!transaction?.metadata) {
        return {
          success: false,
          error: 'Transaction not found',
        }
      }

      const paymentIntentId = (transaction.metadata as any).payment_intent

      const response = await fetch('https://api.stripe.com/v1/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${this.secretKey}`,
        },
        body: new URLSearchParams({
          payment_intent: paymentIntentId,
          ...(amount && { amount: amount.toString() }),
        }),
      })

      if (!response.ok) {
        return {
          success: false,
          error: 'Refund failed',
        }
      }

      await prisma.subscriptionTransaction.update({
        where: { transactionId },
        data: { status: 'REFUNDED' },
      })

      return {
        success: true,
        transactionId,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
