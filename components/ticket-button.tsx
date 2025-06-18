import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { DateTime } from "luxon";

interface TicketButtonProps {
  slug: string;
  startSellingDate: string;
  endSellingDate: string;
  ticketsAvailable: number;
  status: string; // optional
  eventId: string;
  timeSelling:string;
}

export function TicketButton({
  slug,
  startSellingDate,
  endSellingDate,
  ticketsAvailable,
  status,
  eventId,
  timeSelling = "00:00",
}: TicketButtonProps) {
   const now = DateTime.now().setZone("Asia/Jakarta");
 
   const start = DateTime.fromFormat(
     `${startSellingDate} ${timeSelling}`,
     "yyyy-MM-dd HH:mm",
     { zone: "Asia/Jakarta" }
   );
 
   const end = DateTime.fromFormat(endSellingDate, "yyyy-MM-dd", {
     zone: "Asia/Jakarta",
   }).endOf("day");
 

  const isBeforeSelling = now < start;
  const isAfterSelling = now > end;
  const isInactive = status !== "Active";
  const isSoldOut = ticketsAvailable <= 0;
  
  if (isBeforeSelling) {
    return (
      <Button disabled className="w-full mt-4 cursor-not-allowed opacity-80">
        Tickets available {formatDate(startSellingDate)}
      </Button>
    );
  }

  if (isAfterSelling) {
    return (
      <Button disabled className="w-full mt-4 cursor-not-allowed opacity-80">
        This event has ended
      </Button>
    );
  }

  if (isInactive) {
    return (
      <Button disabled className="w-full mt-4 cursor-not-allowed opacity-80">
        Event Inactive
      </Button>
    );
  }

  if (isSoldOut) {
    return (
      <Button disabled className="w-full mt-4 cursor-not-allowed opacity-80">
        Sold Out
      </Button>
    );
  }

  // ✅ Active and available
  return (
    <Link href={`/checkout?eventId=${eventId}`} className="w-full mt-4 inline-block">
      <Button className="w-full">Buy Tickets</Button>
    </Link>
  );
}
