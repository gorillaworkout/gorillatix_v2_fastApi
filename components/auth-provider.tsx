"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { onAuthChange, createUserProfile } from "@/lib/firebase-auth"
import type { User } from "firebase/auth"

// Extended user type with role
interface ExtendedUser extends User {
  role?: string
}

// Auth context type
interface AuthContextType {
  user: ExtendedUser | null
  loading: boolean
  error: string | null
  refreshAuthState: () => void
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Function to refresh auth state
  const refreshAuthState = async () => {
    setLoading(true)
    try {
      // Get current user from Firebase
      const { getCurrentUser } = await import("@/lib/firebase-auth")
      const currentUser = getCurrentUser()

      if (currentUser) {
        // Get user role from Firestore
        const { db } = await import("@/lib/firebase")
        const { doc, getDoc } = await import("firebase/firestore")

        const userRef = doc(db, "users", currentUser.uid)
        const userSnap = await getDoc(userRef)

        const extendedUser = currentUser as ExtendedUser

        if (userSnap.exists()) {
          const userData = userSnap.data()
          extendedUser.role = userData.role || "user"
        } else {
          extendedUser.role = "user"
        }

        setUser(extendedUser)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("Auth refresh error:", err)
      setError("Authentication error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  const unsubscribe = onAuthChange(async (authUser) => {
    try {
      if (authUser) {
        if (!authUser.email) {
          throw new Error("User email is null");
        }
        await createUserProfile(authUser);

        const { db } = await import("@/lib/firebase");
        const { doc, getDoc } = await import("firebase/firestore");

        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);

        const extendedUser = authUser as ExtendedUser;

        if (userSnap.exists()) {
          const userData = userSnap.data();
          extendedUser.role = userData.role || "user";
        } else {
          extendedUser.role = "user";
        }

        setUser(extendedUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth state change error:", err);
      setError("Authentication error");
    } finally {
      setLoading(false);
      setAuthInitialized(true);
    }
  });

  return () => unsubscribe();
}, []);


  // Check for auth state on focus/visibility change
  useEffect(() => {
    if (!authInitialized) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshAuthState()
      }
    }

    const handleFocus = () => {
      refreshAuthState()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [authInitialized])

  return <AuthContext.Provider value={{ user, loading, error, refreshAuthState }}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
