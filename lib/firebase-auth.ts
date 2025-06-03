import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth } from "./firebase"

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error("Error signing in with Google:", error)
    throw error
  }
}

// Sign out
export async function signOut() {
  try {
    // Sign out from Firebase
    await firebaseSignOut(auth)

    // Clear any local storage or session storage items that might be caching auth state
    localStorage.removeItem("firebase:auth:session")
    sessionStorage.clear()

    // Force a hard refresh of the page to ensure all state is cleared
    window.location.href = "/"

    return true
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser
}

// Listen for auth state changes
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// Create a user profile in Firestore
export async function createUserProfile(user: User) {
  try {
    const { db } = await import("./firebase")
    const { doc, setDoc, getDoc, serverTimestamp } = await import("firebase/firestore")

    // Check if profile already exists
    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      // Create new profile with role set to "user" by default
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        role: "user", // Default role is "user"
      })
    }

    return true
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}
