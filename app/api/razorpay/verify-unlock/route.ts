import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { collection } from 'firebase/firestore';

/**
 * CRITICAL SECURITY: Backend verification of payment before unlocking
 * This MUST be called from backend, never trust client-side verification
 */
interface VerifyUnlockRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: string;
  propertyId: string;
}

interface VerifyUnlockResponse {
  success: boolean;
  error?: string;
  contact?: {
    phone: string;
    address: string;
    ownerName: string;
  };
}

/**
 * Verify Razorpay payment signature
 * IMPORTANT: Only server-side secrets should be used for verification
 */
function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error('RAZORPAY_KEY_SECRET not set in environment');
    return false;
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

/**
 * POST /api/razorpay/verify-unlock
 *
 * Security:
 * - Only server can verify using RAZORPAY_KEY_SECRET
 * - Signature validation prevents tampering
 * - Payment recorded in Firestore with server timestamp
 * - Contact only unlocked after verification
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId,
      propertyId,
    } = (await req.json()) as VerifyUnlockRequest;

    // 1. VALIDATE INPUT
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !userId || !propertyId) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 2. VERIFY SIGNATURE (CRITICAL - server-side only)
    const isValidSignature = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      console.warn(`[SECURITY] Invalid payment signature for user ${userId}`);
      return Response.json(
        { success: false, error: 'Payment verification failed' },
        { status: 401 }
      );
    }

    // 3. CHECK DUPLICATE PAYMENT (prevent replay attacks)
    const existingPayment = await db
      .collection('payments')
      .where('razorpayPaymentId', '==', razorpayPaymentId)
      .limit(1)
      .get();

    if (!existingPayment.empty) {
      console.warn(`[SECURITY] Duplicate payment attempt: ${razorpayPaymentId}`);
      // Return success even for duplicate to prevent information leakage
      const payment = existingPayment.docs[0].data();
      return Response.json(
        {
          success: true,
          contact: {
            phone: payment.phone,
            address: payment.address,
            ownerName: payment.ownerName,
          },
        },
        { status: 200 }
      );
    }

    // 4. FETCH PROPERTY DETAILS
    const propertyRef = db.collection('properties').doc(propertyId);
    const propertySnap = await propertyRef.get();

    if (!propertySnap.exists()) {
      return Response.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    const propertyData = propertySnap.data();
    const { phone, address, lenderName } = propertyData;

    // 5. RECORD PAYMENT IN FIRESTORE (AUDIT TRAIL)
    const paymentDocId = `${userId}_${propertyId}_${Date.now()}`;
    await db.collection('payments').doc(paymentDocId).set({
      userId,
      propertyId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount: 50,
      status: 'completed',
      signatureVerified: true,
      verifiedAt: serverTimestamp(),
      // Denormalize property info for audit trail
      propertySnapshot: {
        title: propertyData.title,
        rent: propertyData.rent,
        location: propertyData.location,
      },
      // Denormalize contact info for compliance
      unlockedContact: {
        phone,
        address,
        ownerName: lenderName,
      },
    });

    // 6. RECORD UNLOCK (for quick lookup)
    const unlockDocId = `${userId}_${propertyId}`;
    await db.collection('unlocks').doc(unlockDocId).set(
      {
        userId,
        propertyId,
        unlockedAt: serverTimestamp(),
        phone,
        address,
        ownerName: lenderName,
      },
      { merge: true } // Merge in case it already exists
    );

    // 7. RETURN CONTACT INFO
    return Response.json(
      {
        success: true,
        contact: {
          phone,
          address,
          ownerName: lenderName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ERROR] Payment verification failed:', error);
    return Response.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
