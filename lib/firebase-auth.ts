import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth } from "./firebase"
import { getAuth } from "firebase/auth";
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
// export async function createUserProfile(user: User) {
//   try {
//     const { db } = await import("./firebase")
//     const { doc, setDoc, getDoc, serverTimestamp } = await import("firebase/firestore")

//     // Check if profile already exists
//     const userRef = doc(db, "users", user.uid)
//     const userSnap = await getDoc(userRef)

//     if (!userSnap.exists()) {
//       // Create new profile with role set to "user" by default
//       await setDoc(userRef, {
//         uid: user.uid,
//         email: user.email,
//         displayName: user.displayName,
//         photoURL: user.photoURL,
//         createdAt: serverTimestamp(),
//         role: "user", // Default role is "user"
//       })
//     }

//     return true
//   } catch (error) {
//     console.error("Error creating user profile:", error)
//     throw error
//   }
// }

// Create a user profile in postgre
interface UserParam {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}


export async function createUserProfile(user:UserParam) {
  try {
    const res = await fetch("https://fastapi-gorillatix-production.up.railway.app/api/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })

    if (!res.ok) {
      throw new Error(`Failed to create user: ${res.status}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}





export async function getFirebaseIdToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  console.log(user, 'user getfirebase id token')
  if (!user) {
    console.warn("No user logged in");
    return null;
  }
  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error("Failed to get Firebase ID token:", error);
    return null;
  }
}

export const deleteEventById = async (eventId: string, token: string) => {
  try {
    const response = await fetch(
      `https://fastapi-gorillatix-production.up.railway.app/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to delete event");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("❌ Failed to delete event:", error.message);
    throw error;
  }
};


