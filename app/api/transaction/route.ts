// 
import midtransClient from "midtrans-client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const isProduction = process.env.MIDTRANS_ENV === "production";

  // Convert values to number safely
  const quantity = Number(body.quantity);
  const price = Number(body.price);

  if (!quantity || !price || isNaN(quantity) || isNaN(price)) {
    return new Response("Invalid quantity or price", { status: 400 });
  }

  // Calculate subtotal, fees, and total (gross amount)
  const subtotal = price * quantity;
  const fees = Math.ceil(subtotal * 0.02); // 2% fee, rounded up
  const serviceCharge = 5000;
  const grossAmount = subtotal + fees + serviceCharge;

  const snap = new midtransClient.Snap({
    isProduction: isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
  });

  const parameter = {
    transaction_details: {
      order_id: body.orderId,
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
        name: `${body.eventName} - ${body.firstName} ${body.lastName}`,
        quantity: quantity,
        price: price, // unit price (3500)
      },
      {
        id: "FEES",
        name: "Transaction Fees (2%)",
        quantity: 1,
        price: fees,
      },
      {
        id: "SERVICE_CHARGE",
        name: "Service Charge",
        quantity: 1,
        price: serviceCharge,
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
