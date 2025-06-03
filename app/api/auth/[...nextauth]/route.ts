import { NextResponse } from "next/server"

export async function GET(request: Request) {
  return NextResponse.json(
    {
      message: "Authentication is currently disabled",
    },
    { status: 200 },
  )
}

export async function POST(request: Request) {
  return NextResponse.json(
    {
      message: "Authentication is currently disabled",
    },
    { status: 200 },
  )
}
