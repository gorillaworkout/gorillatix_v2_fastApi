// import { NextResponse } from "next/server"
// // import type { NextRequest } from "next/server"

// export async function middleware() { //.request: NextRequest
//   // For now, we'll just allow all requests through
//   return NextResponse.next()
// }

// export const config = {
//   matcher: ["/admin/:path*"],
// }
import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Inisialisasi Redis dari Upstash
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Aturan rate limit: max 10 requests per 60 detik
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60s"),
  analytics: true,
})

export async function middleware(request: NextRequest) {
  // Ambil IP dari header 'x-forwarded-for', gunakan fallback
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1"

  // Jalankan limit
  const { success, limit, remaining, reset } = await ratelimit.limit(ip)

  if (!success) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    })
  }

  return NextResponse.next()
}

// Batasi hanya route penting (bisa kamu sesuaikan)
export const config = {
  matcher: [
    "/checkout",
    "/orders",
    "/events/:path*",
    "/contact",
  ],
}
