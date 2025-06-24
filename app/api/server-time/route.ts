import { NextResponse } from "next/server";
import { format, toZonedTime } from "date-fns-tz";

export async function GET() {
  try {
    const now = new Date();

    // Ubah ke zona waktu Jakarta (GMT+7)
    const jakartaDate = toZonedTime(now, "Asia/Jakarta");

    // Format ISO 8601 dengan offset +07:00
    const formatted = format(jakartaDate, "yyyy-MM-dd'T'HH:mm:ssXXX", {
      timeZone: "Asia/Jakarta",
    });

    return NextResponse.json({ serverTime: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to get server time" },
      { status: 500 }
    );
  }
}
