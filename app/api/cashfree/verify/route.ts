import { NextResponse } from 'next/server';
import { verifyCashfreeSignature } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const { orderId, transactionId, signature } = await request.json();

    if (!orderId || !transactionId || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment data' },
        { status: 400 }
      );
    }

    const isValid = verifyCashfreeSignature(orderId, transactionId, signature);

    if (isValid) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid signature' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Cashfree verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
