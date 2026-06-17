import { NextResponse } from 'next/server';
import crypto from 'crypto';

const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg/orders';

export async function POST(request: Request) {
  try {
    const { amount, propertyId, userId } = await request.json();

    if (!amount || !propertyId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = `order_${propertyId.slice(0, 6)}_${Date.now()}`;

    const requestBody = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: userId,
      },
      order_meta: {
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cashfree/webhook`,
        payment_methods: 'upi,card,netbanking,wallet',
      },
      order_note: `Unlock contact for property ${propertyId}`,
    };

    const timestamp = Math.floor(Date.now() / 1000);
    const signatureData = `${orderId}.${timestamp}.${process.env.CASHFREE_KEY_SECRET}`;
    const signature = crypto.createHash('sha256').update(signatureData).digest('hex');

    const response = await fetch(CASHFREE_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_APP_ID || '',
        'x-client-secret': process.env.CASHFREE_KEY_SECRET || '',
        'x-request-id': `${orderId}-${timestamp}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree API error:', data);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 400 });
    }

    return NextResponse.json({
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
    });
  } catch (error: any) {
    console.error('Cashfree create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
