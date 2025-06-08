import crypto from "crypto"

// 🔧 Ganti ini sesuai data transaksi yang kamu ingin uji
const orderId = "ORDER-123456"
const statusCode = "200"
const grossAmount = "10000" // harus string
const serverKey = "SB-Mid-server-xxxxxxxxxxxxxxxxxx" // ganti dengan MIDTRANS_SERVER_KEY kamu

// 🔐 Proses generate signature
const input = orderId + statusCode + grossAmount + serverKey
const signature = crypto.createHash("sha512").update(input).digest("hex")

console.log("Generated Signature Key:")
console.log(signature)
// 8d4bc63ef1b714c5aac25b173008b9b594698f1936bb1bc420cf96fbcf9ef74b9ece254c7b8354d1bd55e8c977c25d39995df85787372640db01566898fbc2cb