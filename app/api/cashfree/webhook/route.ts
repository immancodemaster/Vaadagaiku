import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { verifyCashfreeSignature } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      order_id: orderId,
      order_status: orderStatus,
      transaction_id: transactionId,
      signature,
      cf_payment_id: cfPaymentId,
    } = body;

    // Verify signature
    if (!verifyCashfreeSignature(orderId, transactionId, signature)) {
      console.warn('Invalid Cashfree webhook signature');
      return NextResponse.json({ success: false }, { status: 400 });
    }

    if (orderStatus === 'PAID' || orderStatus === 'ACTIVE') {
      // Extract propertyId and userId from orderId (format: order_PROPID_TIMESTAMP)
      const parts = orderId.split('_');
      const propertyId = parts[1];
      const userId = body.customer_id; // Cashfree includes customer_id

      // Store payment record in Firestore
      await setDoc(doc(db, 'payments', `${userId}_${propertyId}`), {
        userId,
        propertyId,
        amount: body.order_amount,
        cashfreeOrderId: orderId,
        cashfreeTransactionId: transactionId,
        cashfreePaymentId: cfPaymentId,
        gateway: 'cashfree',
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      console.log(`Payment verified: ${orderId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cashfree webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
