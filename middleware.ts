import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"

export async function middleware() { //.request: NextRequest
  // For now, we'll just allow all requests through
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
