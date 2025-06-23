import { getFirestore } from "firebase-admin/firestore";
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
    const { eventId, quantity } = await req.json();

    if (!eventId || !quantity) {
      return NextResponse.json({ message: "Missing eventId or quantity" }, { status: 400 });
    }

    // Untuk firebase-admin, buat doc ref pakai method doc() dari db
    const eventRef = db.collection("events").doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const eventData = eventSnap.data();
    const currentStuck = eventData?.stuckPending || 0;

    await eventRef.update({
      stuckPending: currentStuck + quantity,
    });

    console.log(`🧊 Added ${quantity} stuckPending to event ${eventId}`);
    return NextResponse.json({ message: "stuckPending updated" });
  } catch (error) {
    console.error("❌ Error in stuck-payment route:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
