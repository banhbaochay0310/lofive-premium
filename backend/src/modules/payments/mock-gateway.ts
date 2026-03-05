/**
 * Mock Payment Gateway Simulator
 * Simulates a real payment gateway like Stripe, PayPal, etc.
 * 
 * In a production environment, this would be replaced with actual
 * payment gateway integration (Stripe, PayPal, etc.)
 * 
 * This simulator demonstrates the webhook callback flow:
 * 1. Payment is created with PENDING status
 * 2. Payment gateway processes the payment asynchronously
 * 3. Gateway sends webhook callback with result (COMPLETED/FAILED)
 * 4. System updates payment status and activates subscription on success
 */

import axios from 'axios';

interface PaymentSimulationConfig {
  webhookUrl: string;
  paymentId: string;
  shouldSucceed?: boolean;
  delayMs?: number;
}

interface PaymentWebhookPayload {
  status: 'COMPLETED' | 'FAILED';
  transactionId?: string;
}

export class MockPaymentGateway {
  /**
   * Simulate payment processing
   * In real world, this would be handled by external payment provider
   * 
   * @param config - Payment simulation configuration
   * @returns Promise that resolves when webhook is sent
   */
  static async processPayment(config: PaymentSimulationConfig): Promise<{
    success: boolean;
    webhookSent: boolean;
    webhookPayload: PaymentWebhookPayload;
  }> {
    const {
      webhookUrl,
      paymentId,
      shouldSucceed = true,
      delayMs = 2000, // Simulate 2 second processing delay
    } = config;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    // Generate webhook payload
    const webhookPayload: PaymentWebhookPayload = {
      status: shouldSucceed ? 'COMPLETED' : 'FAILED',
      transactionId: shouldSucceed
        ? `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        : undefined,
    };

    try {
      // Send webhook callback to system
      await axios.post(`${webhookUrl}/${paymentId}/webhook`, webhookPayload);

      return {
        success: true,
        webhookSent: true,
        webhookPayload,
      };
    } catch (error) {
      console.error('Failed to send webhook:', error);
      return {
        success: false,
        webhookSent: false,
        webhookPayload,
      };
    }
  }

  /**
   * Simulate successful payment
   * Convenience method for testing success scenarios
   */
  static async processSuccessfulPayment(
    webhookUrl: string,
    paymentId: string
  ): Promise<void> {
    await this.processPayment({
      webhookUrl,
      paymentId,
      shouldSucceed: true,
    });
  }

  /**
   * Simulate failed payment
   * Convenience method for testing failure scenarios
   */
  static async processFailedPayment(
    webhookUrl: string,
    paymentId: string
  ): Promise<void> {
    await this.processPayment({
      webhookUrl,
      paymentId,
      shouldSucceed: false,
    });
  }

  /**
   * Validate webhook signature (Mock implementation)
   * In production, this would verify the webhook is from legitimate payment provider
   * 
   * Real implementations:
   * - Stripe: Verify signature using webhook secret
   * - PayPal: Verify IPN message
   */
  static validateWebhookSignature(
    payload: any,
    signature: string,
    secret: string
  ): boolean {
    // Mock implementation - always returns true
    // In production, implement actual signature verification
    return true;
  }

  /**
   * Generate payment gateway redirect URL (Mock)
   * In real world, would redirect to payment provider's checkout page
   */
  static generatePaymentUrl(paymentId: string, amount: number): string {
    return `https://mock-payment-gateway.example.com/checkout?payment_id=${paymentId}&amount=${amount}`;
  }
}

/**
 * Payment Gateway Service
 * Facade for interacting with payment gateway
 */
export class PaymentGatewayService {
  private webhookBaseUrl: string;

  constructor(webhookBaseUrl: string = 'http://localhost:5000/api/v1/payments') {
    this.webhookBaseUrl = webhookBaseUrl;
  }

  /**
   * Initialize payment processing
   * In production, this would redirect user to payment gateway
   * For mock, it simulates async processing and webhook callback
   */
  async initiatePayment(
    paymentId: string,
    amount: number,
    shouldSucceed: boolean = true
  ): Promise<string> {
    // In production, return redirect URL to payment gateway
    const paymentUrl = MockPaymentGateway.generatePaymentUrl(paymentId, amount);

    // Simulate async payment processing (non-blocking)
    // In production, this would be handled by external gateway
    setImmediate(() => {
      MockPaymentGateway.processPayment({
        webhookUrl: this.webhookBaseUrl,
        paymentId,
        shouldSucceed,
        delayMs: 2000,
      }).catch((error) => {
        console.error('Payment processing error:', error);
      });
    });

    return paymentUrl;
  }

  /**
   * Check payment status (Mock)
   * In production, would query payment provider's API
   */
  async checkPaymentStatus(transactionId: string): Promise<{
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    transactionId: string;
  }> {
    // Mock implementation
    return {
      status: 'COMPLETED',
      transactionId,
    };
  }

  /**
   * Refund payment (Mock)
   * In production, would call payment provider's refund API
   */
  async refundPayment(
    transactionId: string,
    amount: number
  ): Promise<{ success: boolean; refundId: string }> {
    // Mock implementation
    return {
      success: true,
      refundId: `REFUND-${Date.now()}`,
    };
  }
}

export default MockPaymentGateway;
