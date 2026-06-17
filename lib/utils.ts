// Format currency (Indian Rupees)
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`
}

// Format currency without symbol
export const formatPrice = (amount: number): string => {
  return amount.toLocaleString('en-IN')
}

// Format date
export const formatDate = (date: Date | number | string): string => {
  if (!date) return ''
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format date and time
export const formatDateTime = (date: Date | number | string): string => {
  if (!date) return ''
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format time only
export const formatTime = (date: Date | number | string): string => {
  if (!date) return ''
  const dateObj = new Date(date)
  return dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date: Date | number | string): string => {
  if (!date) return ''
  const dateObj = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`

  return formatDate(date)
}

// Truncate text
export const truncate = (text: string, length: number): string => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// Capitalize first letter
export const capitalize = (text: string): string => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Mask phone number (show last 4 digits only)
export const maskPhone = (phone: string): string => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  return `+91****${cleaned.slice(-4)}`
}

// Generate unique ID
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate order ID
export const generateOrderId = (): string => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`
}

// Parse location
export const parseLocation = (location: { city: string; area: string; landmark?: string }): string => {
  const parts = [location.area, location.city]
  if (location.landmark) parts.unshift(location.landmark)
  return parts.join(', ')
}

// Get amenity icon
export const getAmenityIcon = (amenity: string): string => {
  const icons: Record<string, string> = {
    wifi: '📶',
    parking_covered: '🏠',
    parking_open: '🅿️',
    ac: '❄️',
    fan: '💨',
    balcony: '🪟',
    terrace: '🏢',
    garden: '🌳',
    modular_kitchen: '🍳',
    gym: '💪',
    swimming_pool: '🏊',
    play_area: '🎪',
    community_hall: '🏛️',
    security_guard: '👮',
    cctv: '📹',
    intercom: '📞',
    backup_power: '⚡',
    water_storage: '💧',
    water_24_7: '💧',
    electricity_24_7: '⚡',
    gas: '🔥',
    laundry: '🧺',
    housekeeping: '🧹'
  }
  return icons[amenity] || '✓'
}

// Get amenity label
export const getAmenityLabel = (amenity: string): string => {
  const labels: Record<string, string> = {
    wifi: 'WiFi',
    parking_covered: 'Covered Parking',
    parking_open: 'Open Parking',
    ac: 'AC',
    fan: 'Fan',
    balcony: 'Balcony',
    terrace: 'Terrace',
    garden: 'Garden',
    modular_kitchen: 'Modular Kitchen',
    gym: 'Gym',
    swimming_pool: 'Swimming Pool',
    play_area: 'Play Area',
    community_hall: 'Community Hall',
    security_guard: 'Security Guard',
    cctv: 'CCTV',
    intercom: 'Intercom',
    backup_power: 'Backup Power',
    water_storage: 'Water Storage',
    water_24_7: '24/7 Water',
    electricity_24_7: '24/7 Electricity',
    gas: 'Gas',
    laundry: 'Laundry',
    housekeeping: 'Housekeeping'
  }
  return labels[amenity] || capitalize(amenity.replace(/_/g, ' '))
}

// Calculate total monthly expense
export const calculateTotalMonthlyExpense = (
  rent: number,
  maintenance?: number,
  parking?: number
): number => {
  return rent + (maintenance || 0) + (parking || 0)
}

// Check if property is available
export const isPropertyAvailable = (availableFrom: Date | string): boolean => {
  return new Date(availableFrom) <= new Date()
}

// Get days until available
export const daysUntilAvailable = (availableFrom: Date | string): number => {
  const available = new Date(availableFrom)
  const now = new Date()
  const diffTime = available.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Build query string
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  return searchParams.toString()
}

// Parse query string
export const parseQueryString = (query: string): Record<string, string> => {
  const params: Record<string, string> = {}
  const searchParams = new URLSearchParams(query)
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// Sleep/wait
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    return false
  }
}

// Check if object is empty
export const isEmpty = (obj: any): boolean => {
  if (Array.isArray(obj)) return obj.length === 0
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0
  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).length === 0
  }
  return !obj
}
