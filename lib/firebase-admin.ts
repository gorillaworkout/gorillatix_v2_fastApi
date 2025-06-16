// lib/firebase-admin.ts
import admin from 'firebase-admin'

const serviceAccount = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const db = admin.firestore()
export { db }
