import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { NextRequest, NextResponse } from "next/server";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, quantity = 1 } = body;

    if (!eventId || quantity <= 0) {
      return NextResponse.json({ message: "Missing or invalid data" }, { status: 400 });
    }

    const eventRef = db.collection("events").doc(eventId);

    await db.runTransaction(async (tx) => {
      const docSnap = await tx.get(eventRef);
      if (!docSnap.exists) throw new Error("Event not found");

      const currentHold = docSnap.data()?.holdTickets || 0;
      const currentStuck = docSnap.data()?.stuckPending || 0;

      const newHold = Math.max(0, currentHold - quantity);
      const newStuck = currentStuck + quantity;

      tx.update(eventRef, {
        holdTickets: newHold,
        stuckPending: newStuck,
        updatedAt: Timestamp.now(),
      });
    });

    await db.collection("stuckPayments").add({
      eventId,
      quantity,
      timestamp: Timestamp.now(),
      source: "onClose",
    });

    return NextResponse.json({ message: "🧼 Hold released & stuckPending updated & logged stuck payment" });
  } catch (err) {
    console.error("🚨 Error in /api/stuck-payment", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
