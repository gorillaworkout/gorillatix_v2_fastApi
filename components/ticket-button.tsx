import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface TicketButtonProps {
  slug: string;
  startSellingDate: string;
  endSellingDate: string;
  ticketsAvailable: number;
  status: string; // optional
  eventId: string;
}

export function TicketButton({
  slug,
  startSellingDate,
  endSellingDate,
  ticketsAvailable,
  status,
  eventId,
}: TicketButtonProps) {
  const today = new Date();
  const start = new Date(startSellingDate);
  const end = new Date(endSellingDate);

  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const isBeforeSelling = today < start;
  const isAfterSelling = today > end;
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
