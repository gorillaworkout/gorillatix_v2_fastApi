import { db } from "./firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function releaseTicketsByOrderId(orderId: string) {
  const ticketsQuery = await db
    .collection("tickets")
    .where("orderId", "==", orderId)
    .get();

  if (ticketsQuery.empty) {
    console.log(`ℹ️ No tickets found for orderId: ${orderId}`);
    return;
  }

  const ticketDoc = ticketsQuery.docs[0];
  const ticketData = ticketDoc.data();
  const ticketRef = ticketDoc.ref;

  const eventId = ticketData.eventId;
  const quantity = ticketData.quantity;

  // Step 1: delete or mark as released
  await ticketRef.update({
    status: "released",
    updatedAt: Timestamp.now(),
  });

  console.log(`🗑️ Ticket marked as released for orderId: ${orderId}`);

  // Step 2: update holdTickets (kurangi)
  await updateHoldTickets(eventId, -quantity);
  console.log(`🔁 Reduced holdTickets by ${quantity} for event: ${eventId}`);
}


export async function updateHoldTickets(eventId: string, delta: number) {
  const eventRef = db.collection("events").doc(eventId);

  await db.runTransaction(async (transaction) => {
    const eventSnap = await transaction.get(eventRef);
    if (!eventSnap.exists) throw new Error("Event not found");

    const currentHold = parseInt(eventSnap.data()?.holdTickets || "0", 10);
    const newHold = Math.max(0, currentHold + delta); // prevent negative
    transaction.update(eventRef, {
      holdTickets: newHold,
      updatedAt: Timestamp.now(),
    });
  });

  console.log(`🔁 Updated holdTickets for event ${eventId}: delta ${delta}`);
}