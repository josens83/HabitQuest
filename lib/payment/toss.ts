import {
  IPaymentProvider,
  PaymentResult,
  CreatePaymentParams,
  VerifyPaymentParams,
  WebhookPayload,
} from './types'
import { prisma } from '@/lib/prisma'

export class TossPaymentsProvider implements IPaymentProvider {
  private clientKey: string
  private secretKey: string
  private baseUrl: string

  constructor() {
    this.clientKey = process.env.TOSS_CLIENT_KEY || ''
    this.secretKey = process.env.TOSS_SECRET_KEY || ''
    this.baseUrl = 'https://api.tosspayments.com/v1'
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const { userId, tier, amount, currency, returnUrl, cancelUrl } = params

      // Generate unique order ID
      const orderId = `order_${Date.now()}_${userId}`

      // Toss Payments API call
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`,
        },
        body: JSON.stringify({
          orderId,
          amount,
          orderName: `HabitQuest ${tier} 구독`,
          customerName: userId,
          successUrl: returnUrl,
          failUrl: cancelUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Payment creation failed',
        }
      }

      const data = await response.json()

      // Create pending transaction
      await prisma.subscriptionTransaction.create({
        data: {
          userId,
          tier,
          provider: 'TOSS_PAYMENTS',
          transactionId: orderId,
          amount,
          currency,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'PENDING',
          metadata: data,
        },
      })

      return {
        success: true,
        transactionId: orderId,
        redirectUrl: data.checkoutUrl,
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

      // Verify payment with Toss Payments API
      const response = await fetch(`${this.baseUrl}/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`,
        },
      })

      if (!response.ok) {
        return {
          success: false,
          error: 'Payment verification failed',
        }
      }

      const data = await response.json()

      if (data.status === 'DONE') {
        // Update transaction status
        const transaction = await prisma.subscriptionTransaction.update({
          where: { transactionId },
          data: {
            status: 'COMPLETED',
            metadata: data,
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
            eventData: { tier: transaction.tier, provider: 'TOSS_PAYMENTS' },
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
      case 'PAYMENT.CONFIRMED':
        await this.verifyPayment({
          transactionId: data.orderId,
          provider: 'TOSS_PAYMENTS',
        })
        break

      case 'PAYMENT.CANCELLED':
        await prisma.subscriptionTransaction.update({
          where: { transactionId: data.orderId },
          data: { status: 'CANCELLED' },
        })
        break

      case 'PAYMENT.FAILED':
        await prisma.subscriptionTransaction.update({
          where: { transactionId: data.orderId },
          data: { status: 'FAILED' },
        })
        break
    }
  }

  async cancelSubscription(transactionId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${transactionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`,
        },
        body: JSON.stringify({
          cancelReason: 'User requested cancellation',
        }),
      })

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
      const response = await fetch(`${this.baseUrl}/payments/${transactionId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`,
        },
        body: JSON.stringify({
          cancelAmount: amount,
          refundReason: 'User requested refund',
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
