// User Types
export type UserType = 'tenant' | 'owner' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';
export type Language = 'en' | 'ta';

export interface User {
  userId: string;
  phone: string;
  phoneVerified: boolean;
  name: string;
  email?: string;
  profileImage?: string;
  userType: UserType;
  status: UserStatus;
  language: Language;
  totalUnlocks: number;
  totalMoneySpent: number;
  createdAt: Date;
  updatedAt: Date;
}

// Property Types
export type PropertyType = 'apartment' | 'house' | 'villa' | 'plot' | 'studio' | 'shared_room';
export type PropertyStatus = 'active' | 'inactive' | 'sold' | 'suspended' | 'archived';
export type Furnishing = 'unfurnished' | 'semi_furnished' | 'fully_furnished';

export interface Property {
  propertyId: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  location: {
    city: string;
    area: string;
    landmark?: string;
    street?: string;
    geoPoint?: { latitude: number; longitude: number };
  };
  specifications: {
    bedrooms: number;
    bathrooms: number;
    balconies: number;
    builtUpArea: number;
    carpetArea?: number;
    floor: string;
    totalFloors: number;
    ageOfProperty: 'new' | '1_to_5_years' | '5_to_10_years' | '10_plus_years';
    furnishing: Furnishing;
  };
  rental: {
    monthlyRent: number;
    depositAmount: number;
    maintenanceCharges?: number;
    parkingCharges?: number;
    totalMonthlyExpense: number;
    availableFrom: Date;
    availableUntil?: Date;
    minLeaseMonths: number;
    maxLeaseMonths?: number;
    rentNegotiable: boolean;
    depositorNegotiable: boolean;
  };
  amenities: string[];
  restrictions: {
    pets: 'allowed' | 'with_permission' | 'not_allowed';
    smokers: boolean;
    vegetarian: boolean;
    couples: boolean;
    bachelors: 'allowed' | 'single_only' | 'multiple_only' | 'not_allowed';
    guests: boolean;
    cooking: boolean;
  };
  media: {
    images: Array<{ url: string; uploadedAt: Date; caption?: string; order: number }>;
    videoUrl?: string;
    virtualTourUrl?: string;
    coverImageUrl: string;
  };
  status: PropertyStatus;
  featured: {
    isFeatured: boolean;
    featuredUntil?: Date;
    featuredTier?: 'standard' | 'premium' | 'top_featured';
  };
  analytics: {
    totalViews: number;
    uniqueVisitors: number;
    saves: number;
    unlocks: number;
    clicks: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
    lastViewedAt?: Date;
    firstUnlockAt?: Date;
  };
  verification: {
    ownerVerified: boolean;
    photoVerified: boolean;
    documentVerified: boolean;
    addressVerified: boolean;
    verifiedAt?: Date;
    verificationNotes?: string;
  };
  tags: string[];
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  expiresAt: Date;
}

// Payment Types
export type PaymentGateway = 'cashfree' | 'razorpay' | 'stripe';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'expired';
export type TransactionType = 'payment' | 'refund' | 'adjustment' | 'bonus' | 'fee';

export interface Payment {
  paymentId: string;
  transactionId: string;
  userId: string;
  propertyId: string;
  ownerId: string;
  amount: number;
  currency: 'INR';
  gateway: PaymentGateway;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewayCustomerId?: string;
  paymentMethod: PaymentMethod;
  cardDetails?: {
    last4: string;
    brand: 'visa' | 'mastercard' | 'amex';
    expiryMonth: number;
    expiryYear: number;
  };
  upiDetails?: {
    upiId: string;
    vpa?: string;
  };
  status: PaymentStatus;
  gatewayStatus: string;
  signatureVerification: {
    isVerified: boolean;
    verifiedAt?: Date;
    verificationMethod: 'hmac' | 'polling' | 'webhook';
    verificationDetails?: Record<string, any>;
  };
  refund?: {
    refunded: boolean;
    refundAmount?: number;
    refundId?: string;
    refundReason?: string;
    refundedAt?: Date;
    refundStatus: 'pending' | 'completed' | 'failed';
  };
  unlockedContact?: {
    ownerName: string;
    ownerPhone: string;
    ownerEmail?: string;
    ownerProfileUrl?: string;
  };
  propertySnapshot?: {
    propertyId: string;
    propertyTitle: string;
    propertyType: PropertyType;
    location: { city: string; area: string };
    monthlyRent: number;
    bedrooms: number;
  };
  errorDetails?: {
    error: boolean;
    errorCode?: string;
    errorMessage?: string;
    errorAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  auditLog?: Array<{
    action: string;
    status: string;
    timestamp: Date;
    notes?: string;
  }>;
}

// Unlock Types
export interface Unlock {
  unlockId: string;
  userId: string;
  propertyId: string;
  paymentId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  unlockedAt: Date;
  expiresAt?: Date;
  isExpired: boolean;
  contactViewed: boolean;
  contactCopied: boolean;
  contactCalled: boolean;
  contactMessaged: boolean;
  notes?: string;
}

// Save Types
export interface Save {
  saveId: string;
  userId: string;
  propertyId: string;
  savedAt: Date;
  propertySnapshot?: {
    title: string;
    image: string;
    location: string;
    rent: number;
    bedrooms: number;
  };
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

// Transaction Types
export interface Transaction {
  transactionId: string;
  paymentId?: string;
  userId: string;
  propertyId?: string;
  ownerId?: string;
  type: TransactionType;
  amount: number;
  currency: 'INR';
  gateway: PaymentGateway;
  gatewayTransactionId?: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  createdAt: Date;
  completedAt?: Date;
  platformFee?: number;
  ownerShare?: number;
}

// Review Types (Phase 3+)
export interface Review {
  reviewId: string;
  propertyId: string;
  userId: string;
  ownerId: string;
  rating: number;
  title: string;
  comment: string;
  cleanliness: number;
  accuracy: number;
  communication: number;
  overall: number;
  createdAt: Date;
  updatedAt: Date;
  approved: boolean;
  flagged: boolean;
}

// API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

// Legacy/Compatibility Types (Keep for backward compatibility)
export interface CashfreeOrderResponse {
  order_id: string;
  payment_session_id: string;
  order_status: string;
}

export interface CashfreePaymentResponse {
  orderId: string;
  transactionId: string;
  paymentStatus: string;
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
