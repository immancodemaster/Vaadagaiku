import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin';
import crypto from 'crypto';

/**
 * Backend payment verification for Cashfree
 * - Verifies payment status via Cashfree API
 * - Uses server-side CASHFREE_KEY_SECRET (never exposed to client)
 * - Prevents client-side tampering
 * - Records verified payment in Firestore with audit trail
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Validate input
    const { orderId, paymentId, userId, propertyId } = await req.json();

    if (!orderId || !paymentId || !userId || !propertyId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 2. Verify payment with Cashfree API (server-side only)
    const cashfreeApiUrl = 'https://api.cashfree.com/pg/orders';
    const cashfreeKeyId = process.env.CASHFREE_KEY_ID;
    const cashfreeKeySecret = process.env.CASHFREE_KEY_SECRET;

    if (!cashfreeKeyId || !cashfreeKeySecret) {
      console.error('[ERROR] Cashfree credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Payment verification unavailable' },
        { status: 500 }
      );
    }

    // Verify payment status via Cashfree API
    const verifyResponse = await fetch(`${cashfreeApiUrl}/${orderId}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': cashfreeKeyId,
        'x-client-secret': cashfreeKeySecret,
      },
    });

    if (!verifyResponse.ok) {
      console.error('[ERROR] Cashfree verification failed:', verifyResponse.status);
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 401 }
      );
    }

    const paymentData = await verifyResponse.json();

    // 3. Validate payment status
    if (paymentData.payment_status !== 'SUCCESS') {
      console.warn(`[WARN] Payment not successful: ${paymentData.payment_status}`);
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 401 }
      );
    }

    // 4. Check for duplicate payments (replay attack prevention)
    const paymentsRef = db.collection('payments');
    const duplicateCheck = await paymentsRef
      .where('userId', '==', userId)
      .where('propertyId', '==', propertyId)
      .where('orderId', '==', orderId)
      .limit(1)
      .get();

    if (!duplicateCheck.empty) {
      console.warn(`[WARN] Duplicate payment detected: ${orderId}`);
      return NextResponse.json(
        { success: false, error: 'Payment already processed' },
        { status: 409 }
      );
    }

    // 5. Fetch property details
    const propertyDoc = await db.collection('properties').doc(propertyId).get();

    if (!propertyDoc.exists) {
      console.error(`[ERROR] Property not found: ${propertyId}`);
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    const propertyData = propertyDoc.data();

    // 6. Record verified payment in Firestore with audit trail
    const paymentRecord = {
      userId,
      propertyId,
      orderId,
      paymentId,
      gateway: 'cashfree',
      amount: paymentData.amount / 100, // Cashfree returns in paisa
      currency: paymentData.currency || 'INR',
      status: 'completed',

      // Audit trail
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentMethod: paymentData.payment_method || 'unknown',
      paymentGatewayResponse: {
        status: paymentData.payment_status,
        method: paymentData.payment_method,
        cf_payment_id: paymentData.cf_payment_id,
        timestamp: paymentData.created_at,
      },

      // Denormalized property snapshot for quick lookup
      propertySnapshot: {
        title: propertyData.title,
        location: propertyData.location,
        phone: propertyData.phone,
        address: propertyData.address,
      },
    };

    // Write payment record (backend SDK, not client)
    const paymentRef = paymentsRef.doc();
    await paymentRef.set(paymentRecord);

    // 7. Record unlock for quick lookup
    const unlocksRef = db.collection('unlocks');
    const unlockRecord = {
      userId,
      propertyId,
      paymentId: paymentRef.id,
      gateway: 'cashfree',
      unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      contact: {
        phone: propertyData.phone,
        address: propertyData.address,
      },
    };

    await unlocksRef.add(unlockRecord);

    console.log(`[SUCCESS] Payment verified and recorded: ${paymentRef.id}`);

    // 8. Return contact info only after backend verification succeeds
    return NextResponse.json({
      success: true,
      contact: {
        phone: propertyData.phone,
        address: propertyData.address,
      },
      paymentId: paymentRef.id,
    });
  } catch (error: any) {
    console.error('[ERROR] Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
