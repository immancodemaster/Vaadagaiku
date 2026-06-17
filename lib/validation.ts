// Phone number validation (Indian format)
export const isValidIndianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  return /^[6-9]\d{9}$/.test(cleaned)
}

// Format phone to standard format
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (!isValidIndianPhone(phone)) return phone
  return `+91${cleaned}`
}

// Email validation
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Property rent validation
export const isValidRent = (rent: number): boolean => {
  return rent >= 5000 && rent <= 500000
}

// Property area validation (sq ft)
export const isValidArea = (area: number): boolean => {
  return area >= 100 && area <= 10000
}

// Property details validation
export const isValidPropertyDetails = (property: any): {
  valid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (!property.title || property.title.length < 5) {
    errors.push('Title must be at least 5 characters')
  }

  if (!isValidRent(property.rentPerMonth)) {
    errors.push('Rent must be between ₹5,000 and ₹500,000')
  }

  if (!isValidArea(property.specifications?.builtUpArea)) {
    errors.push('Area must be between 100 and 10,000 sq ft')
  }

  if (!property.bedrooms || property.bedrooms < 0) {
    errors.push('Select valid number of bedrooms')
  }

  if (!property.location?.city) {
    errors.push('City is required')
  }

  if (!property.location?.area) {
    errors.push('Area/Locality is required')
  }

  if (property.rental?.depositAmount < property.rentPerMonth) {
    errors.push('Deposit should be at least equal to monthly rent')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// OTP validation (6 digits)
export const isValidOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp)
}

// Amount validation (for payments)
export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && amount === 50 // Fixed ₹50 unlock
}

// Bedrooms validation
export const isValidBedrooms = (bedrooms: number): boolean => {
  return bedrooms >= 0 && bedrooms <= 10
}

// Date validation (should be future date)
export const isValidFutureDate = (date: Date): boolean => {
  return new Date(date) > new Date()
}

// Lease period validation
export const isValidLeasePeriod = (minMonths: number, maxMonths?: number): boolean => {
  if (minMonths < 1) return false
  if (maxMonths && maxMonths < minMonths) return false
  return true
}

// Amenities validation
export const isValidAmenities = (amenities: string[]): boolean => {
  const validAmenities = [
    'wifi', 'parking_covered', 'parking_open', 'ac', 'fan', 'balcony',
    'terrace', 'garden', 'modular_kitchen', 'gym', 'swimming_pool',
    'play_area', 'community_hall', 'security_guard', 'cctv', 'intercom',
    'backup_power', 'water_storage', 'water_24_7', 'electricity_24_7',
    'gas', 'laundry', 'housekeeping'
  ]
  return amenities.every(a => validAmenities.includes(a))
}

// File size validation (for image uploads)
export const isValidImageSize = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  return file.size <= maxSize
}

// File type validation (for images)
export const isValidImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  return validTypes.includes(file.type)
}

// Video file validation
export const isValidVideoFile = (file: File): boolean => {
  const maxSize = 100 * 1024 * 1024 // 100MB
  const validTypes = ['video/mp4', 'video/webm']
  return file.size <= maxSize && validTypes.includes(file.type)
}

// Password strength validation
export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong'
  score: number
} => {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*]/.test(password)) score++

  const strength = score <= 2 ? 'weak' : score <= 3 ? 'medium' : 'strong'

  return { strength, score }
}
