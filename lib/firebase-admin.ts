// // lib/firebase-admin.ts
// import admin from 'firebase-admin'

// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string)

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   })
// }

// const db = admin.firestore()
// export { db }

// lib/firebase-admin.ts
import admin from "firebase-admin";

const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "";
const formattedKey = rawKey.replace(/\\n/g, "\n");
const serviceAccount = JSON.parse(formattedKey);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
export { db };
