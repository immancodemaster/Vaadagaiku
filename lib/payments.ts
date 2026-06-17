import crypto from 'crypto';

const PAYMENT_GATEWAY = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || 'cashfree';

export const paymentConfig = {
  gateway: PAYMENT_GATEWAY,
  isRazorpay: PAYMENT_GATEWAY === 'razorpay',
  isCashfree: PAYMENT_GATEWAY === 'cashfree',
};

// Cashfree verification
export function verifyCashfreeSignature(
  orderId: string,
  transactionId: string,
  signature: string
): boolean {
  const message = `${orderId}.${transactionId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.CASHFREE_KEY_SECRET || '')
    .update(message)
    .digest('base64');

  return expectedSignature === signature;
}

// Razorpay verification
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

// Generic payment verification
export async function verifyPayment(
  paymentData: Record<string, string>
): Promise<boolean> {
  if (paymentConfig.isCashfree) {
    return verifyCashfreeSignature(
      paymentData.orderId,
      paymentData.transactionId,
      paymentData.signature
    );
  }

  if (paymentConfig.isRazorpay) {
    return verifyRazorpaySignature(
      paymentData.razorpay_order_id,
      paymentData.razorpay_payment_id,
      paymentData.razorpay_signature
    );
  }

  return false;
}
