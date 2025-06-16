const axios = require("axios")
const crypto = require("crypto")

const endpoint = "https://gorillatix.com/api/notification/pay-account" // ganti dengan URL endpoint kamu
const MIDTRANS_SERVER_KEY =  process.env.MIDTRANS_SERVER_KEY || "" // ganti sesuai env kamu

// Fungsi buat signature sesuai cara Midtrans
function generateSignature(order_id, status_code, gross_amount) {
  return crypto
    .createHash("sha512")
    .update(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
    .digest("hex")
}

async function sendCallback(orderId, statusCode, grossAmount, transactionStatus) {
  const signatureKey = generateSignature(orderId, statusCode, grossAmount)
  const body = {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: signatureKey,
    transaction_status: transactionStatus,
  }

  try {
    const res = await axios.post(endpoint, body)
    console.log(`Order ${orderId}: ${res.status} ${res.data.message}`)
  } catch (err) {
    console.error(`Order ${orderId}: Error`, err.response?.data || err.message)
  }
}

async function runTest() {
  const requests = []
  const totalRequests = 200 // banyaknya request paralel yang ingin kamu test

  for (let i = 1; i <= totalRequests; i++) {
    // Buat order_id unik supaya tidak bentrok, contoh "test-order-1", "test-order-2", dst
    const orderId = `test-order-${i}`
    const statusCode = "200"
    const grossAmount = "10000"
    const transactionStatus = "settlement" // coba settlement, bisa diganti juga pending, expire

    requests.push(sendCallback(orderId, statusCode, grossAmount, transactionStatus))
  }

  // Jalankan semua request paralel
  await Promise.all(requests)
  console.log("Test selesai.")
}

runTest()
