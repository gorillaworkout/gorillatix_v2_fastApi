import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const orderId = "ORDER-1749730862083";
const statusCode = "202";
const grossAmount = "6020.00";
const serverKey = process.env.MIDTRANS_SERVER_KEY!;

const input = orderId + statusCode + grossAmount + serverKey;
const signature = crypto.createHash("sha512").update(input).digest("hex");

console.log("Server Key:", serverKey);
console.log("Generated Signature Key:");
console.log(signature);
