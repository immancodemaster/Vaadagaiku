import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from "firebase/auth"
import { auth } from "./firebase"

// Global reference for RecaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
    confirmationResult?: any
  }
}

export const setupRecaptcha = (containerId: string) => {
  if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(containerId, {
      size: 'invisible',
      callback: (response: any) => {
        console.log('Recaptcha verified')
      },
      'expired-callback': () => {
        console.log('Recaptcha expired')
        window.recaptchaVerifier = undefined
      }
    }, auth)
  }
  return window.recaptchaVerifier
}

export const sendOTP = async (phoneNumber: string) => {
  const appVerifier = setupRecaptcha('recaptcha-container')

  if (!appVerifier) {
    throw new Error('Recaptcha not initialized')
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    )
    // Store globally for verification later
    window.confirmationResult = confirmationResult
    return confirmationResult
  } catch (error) {
    console.error('OTP send error:', error)
    throw error
  }
}

export const verifyOTP = async (otp: string) => {
  const confirmationResult = window.confirmationResult

  if (!confirmationResult) {
    throw new Error('Confirmation result not found. Please send OTP first.')
  }

  try {
    const result = await confirmationResult.confirm(otp)
    return result.user
  } catch (error) {
    console.error('OTP verification error:', error)
    throw error
  }
}

export const logout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
    window.confirmationResult = undefined
    window.recaptchaVerifier = undefined
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser
}

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await auth.currentUser?.getIdToken() || null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}
