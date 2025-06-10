import { NextResponse } from "next/server"
// request: Request // This is a Next.js-specific type you can put it inside Get for now i deleted cause its not used
export async function GET() {
  return NextResponse.json(
    {
      message: "Authentication is currently disabled",
    },
    { status: 200 },
  )
}

export async function POST() {
  return NextResponse.json(
    {
      message: "Authentication is currently disabled",
    },
    { status: 200 },
  )
}
