import midtransClient from "midtrans-client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const isProduction = process.env.MIDTRANS_ENV === "production";

  // Convert values to number safely
  const quantity = Number(body.quantity);
  const price = Number(body.price);
  const grossAmount = quantity * price;

  // ✅ Validate
  if (!quantity || !price || isNaN(grossAmount)) {
    return new Response("Invalid quantity or price", { status: 400 });
  }

  const snap = new midtransClient.Snap({
    isProduction: isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
  });

  const parameter = {
    transaction_details: {
      order_id: `ORDER-${Date.now()}`,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.email,
      phone: body.phone,
    },
    item_details: [
      {
        id: "TICKET",
        name: `Event Ticket - ${body.firstName} ${body.lastName}`,
        quantity: quantity,
        price: price, // ❗ Ensure this is a number
      },
    ],
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return Response.json({ token: transaction.token });
  } catch (error) {
    console.error("Midtrans Error:", error);
    return new Response("Failed to create transaction", { status: 500 });
  }
}