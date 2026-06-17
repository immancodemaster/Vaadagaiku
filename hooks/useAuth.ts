import { useState, useEffect, useCallback } from 'react'
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { User } from '@/types'

interface UseAuthReturn {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  error: string | null
  logout: () => Promise<void>
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true)
        setError(null)

        if (firebaseUser) {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            setUser(userDoc.data() as User)
          } else {
            // User exists in auth but not in Firestore yet
            setUser(null)
          }
          setFirebaseUser(firebaseUser)
        } else {
          setUser(null)
          setFirebaseUser(null)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        console.error('Auth state change error:', err)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      // Import logout from auth module
      const { logout: authLogout } = await import('./auth')
      await authLogout()
      setUser(null)
      setFirebaseUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    firebaseUser,
    loading,
    error,
    logout
  }
}

// Hook for checking if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const { firebaseUser, loading } = useAuth()
  return !loading && firebaseUser !== null
}

// Hook for getting user type
export const useUserType = (): 'tenant' | 'owner' | 'admin' | null => {
  const { user } = useAuth()
  return user?.userType || null
}
