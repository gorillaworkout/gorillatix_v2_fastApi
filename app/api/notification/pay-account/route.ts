import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { releaseTicketsByOrderId } from "@/lib/firebase-service";

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
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";

export async function POST(req: NextRequest) {
  let body: any;

  try {
    body = await req.json();
    console.log("Received Midtrans notification:", body);

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      customer_name,
      event_id,
      event_name,
      quantity,
      total_price,
      user_id,
      venue,
    } = body;

    // ✅ Verify Signature
    const expectedSignature = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.warn("Signature mismatch");
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    // ✅ Tentukan status baru
    let newStatus = "";
    if (["settlement", "capture"].includes(transaction_status)) {
      newStatus = "confirmed";
    } else if (transaction_status === "pending") {
      newStatus = "pending";
    } else if (["expire", "cancel", "deny"].includes(transaction_status)) {
      newStatus = "cancelled";
    } else {
      newStatus = transaction_status;
    }

    // ✅ Cari tiket berdasarkan orderId
    const ticketsQuery = await db
      .collection("tickets")
      .where("orderId", "==", order_id)
      .get();

    if (ticketsQuery.empty) {
      // 🚨 Tiket belum ada
      if (newStatus === "confirmed") {
        if (!customer_name || !event_id) {
          console.warn("Missing required data for ticket creation.");
          return NextResponse.json({ message: "Missing ticket info" }, { status: 400 });
        }

        await db.collection("tickets").add({
          customerName: customer_name,
          eventId: event_id,
          eventName: event_name,
          orderId: order_id,
          quantity: Number(quantity) || 1,
          totalPrice: Number(total_price) || Number(gross_amount),
          userId: user_id || "unknown",
          venue: venue || "-",
          status: newStatus,
          purchaseDate: Timestamp.now(),
          createdFrom: "auto-webhook",
          updatedAt: Timestamp.now(),
        });

        console.log(`✅ Ticket created for paid order: ${order_id}`);
      } else {
        console.warn(`⚠️ Ticket not found for order_id: ${order_id}`);
        return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
      }
    } else {
      // ✅ Tiket sudah ada → update status
      const ticketRef = ticketsQuery.docs[0].ref;
      await ticketRef.update({
        status: newStatus,
        updatedAt: Timestamp.now(),
      });
      console.log(`🔄 Ticket updated for ${order_id} → ${newStatus}`);
    }

    // ✅ Jika transaksi gagal / dibatalkan → kembalikan tiket
    if (["pending", "expire", "cancel", "deny"].includes(transaction_status)) {
      try {
        await releaseTicketsByOrderId(order_id);
        console.log(`🔁 Tickets released back for orderId: ${order_id}`);
      } catch (releaseErr) {
        console.error("❌ Failed to release tickets:", releaseErr);
      }
    }

    return NextResponse.json({ message: "✅ Notification processed successfully" });

  } catch (error) {
    console.error("❌ Pay Account notification error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  } finally {
    // ✅ Logging ke Firestore
    try {
      await db.collection("midtrans_logs").add({
        receivedAt: Timestamp.now(),
        body: typeof body === "object" ? body : {},
      });
      console.log("📝 Logged Midtrans body to Firestore.");
    } catch (logError) {
      console.error("❌ Failed to log Midtrans body:", logError);
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Midtrans notification endpoint is active.",
    timestamp: new Date().toISOString(),
    method: "GET",
  });
}




// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";
// import { initializeApp, cert, getApps } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";

// if (!getApps().length) {
//   initializeApp({
//     credential: cert({
//       projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
//     }),
//   });
// }

// const db = getFirestore();
// const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";

// // Import your releaseTicketsByOrderId function
// import { releaseTicketsByOrderId } from "@/lib/firebase-service"; // adjust path accordingly

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     console.log("Received Midtrans notification:", body);

//     const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;

//     // Verify signature
//     const expectedSignature = crypto
//       .createHash("sha512")
//       .update(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
//       .digest("hex");

//     if (signature_key !== expectedSignature) {
//       console.warn("Signature mismatch");
//       return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
//     }

//     let newStatus = "";
//     if (transaction_status === "settlement" || transaction_status === "capture") {
//       newStatus = "paid";
//     } else if (transaction_status === "pending") {
//       newStatus = "pending";
//     } else if (transaction_status === "expire" || transaction_status === "cancel" || transaction_status === "deny") {
//       newStatus = "expire"; // Or "cancelled" depending on your status naming
//     } else {
//       // Other transaction statuses you want to handle
//       newStatus = transaction_status; // fallback: keep original
//     }

//     // Update ticket status in Firestore
//     await db.collection("tickets").doc(order_id).set(
//       {
//         status: newStatus,
//         updatedAt: new Date(),
//       },
//       { merge: true }
//     );

//     // If status is pending, expired/cancel/deny/error — release the tickets back
//     if (["pending", "expire", "cancel", "deny", "error"].includes(transaction_status)) {
//       try {
//         await releaseTicketsByOrderId(order_id);
//         console.log(`Tickets released back for orderId: ${order_id}`);
//       } catch (releaseErr) {
//         console.error("Failed to release tickets:", releaseErr);
//       }
//     }

//     return NextResponse.json({ message: "Notification processed successfully" });
//   } catch (error) {
//     console.error("Pay Account notification error:", error);
//     return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
//   } finally {
//     try {
//       const body = await req.json();
//       const logRef = db.collection("midtrans_logs").doc(); // auto ID
//       await logRef.set({
//         receivedAt: new Date(),
//         body: typeof body === "object" ? body : {},
//       });
//       console.log("Logged Midtrans body to Firestore.");
//     } catch (logError) {
//       console.error("Failed to log Midtrans body:", logError);
//     }
//   }
// }

