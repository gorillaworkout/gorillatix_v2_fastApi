// import { NextResponse } from "next/server"
// // import type { NextRequest } from "next/server"

// export async function middleware() { //.request: NextRequest
//   // For now, we'll just allow all requests through
//   return NextResponse.next()
// }

// export const config = {
//   matcher: ["/admin/:path*"],
// }
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {Redis} from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const WINDOW_SIZE_IN_SECONDS = 60
const MAX_REQUESTS = 10

export async function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  const key = `rate-limit:${ip}`
  
  const requests = await redis.incr(key)
  if (requests === 1) {
    await redis.expire(key, WINDOW_SIZE_IN_SECONDS)
  }

  if (requests > MAX_REQUESTS) {
    const ttl = await redis.ttl(key)
    const retryAfter = ttl > 0 ? ttl : WINDOW_SIZE_IN_SECONDS
    const res = NextResponse.json({ message: `Too many requests. Please wait ${retryAfter} seconds.` }, { status: 429 })
    res.headers.set("Retry-After", retryAfter.toString())
    return res
  }
  
  return NextResponse.next()
}
