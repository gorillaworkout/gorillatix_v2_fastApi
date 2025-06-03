import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Get the error from the URL
  const url = new URL(request.url)
  const error = url.searchParams.get("error") || "unknown"

  // Return a proper JSON response
  return NextResponse.json(
    {
      error: error,
      message: "Authentication error occurred",
      documentation: "https://next-auth.js.org/errors",
    },
    { status: 400 },
  )
}
