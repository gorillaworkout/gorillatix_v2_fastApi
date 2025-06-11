// __mocks__/lib/firebase.ts
export const app = {}

export const auth = {
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: "123" } })),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((callback) => {
    // Optionally simulate immediate call for user change
    callback(null)
    return () => {} // unsubscribe function
  }),
  // add any methods your app uses from auth here
}

export const db = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
      set: jest.fn(() => Promise.resolve()),
    })),
  })),
  // add more Firestore mocks if needed
}

export const storage = {
  ref: jest.fn(() => ({
    put: jest.fn(() => Promise.resolve()),
    getDownloadURL: jest.fn(() => Promise.resolve("mock-url")),
  })),
}
