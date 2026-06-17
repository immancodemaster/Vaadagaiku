import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount, propertyId, userId } = await request.json();

    if (!amount || !propertyId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `rcpt_${propertyId.slice(0, 8)}_${Date.now()}`,
      notes: { propertyId, userId },
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error: any) {
    console.error('Razorpay create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
