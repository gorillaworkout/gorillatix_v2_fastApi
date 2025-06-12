import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatRupiah } from "@/lib/utils";
import { EventItem } from "@/types/event";
import { useEffect, useState } from "react";

interface EventCardProps {
  event: EventItem;
}

export function EventCard({ event }: EventCardProps) {
  const {
    slug,
    title,
    date,
    imageUrl,
    venue,
    price,
    category,
    ticketsAvailable,
    startSellingDate,
    endSellingDate,
  } = event;

  const today = new Date();
  const start = new Date(startSellingDate);
  const end = new Date(endSellingDate);

  // Set times to 00:00:00 to compare by day only
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const isDisabled = today < start || today > end;

  // countdown

  // const [countdown, setCountdown] = useState("");

  // useEffect(() => {
  //   if (today >= start) return;

  //   const interval = setInterval(() => {
  //     const now = new Date().getTime();
  //     const distance = start.getTime() - now;

  //     if (distance < 0) {
  //       setCountdown("00d 00h 00m 00s");
  //       clearInterval(interval);
  //       return;
  //     }

  //     const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  //     const hours = Math.floor(
  //       (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  //     );
  //     const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  //     const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  //     setCountdown(
  //       `${days.toString().padStart(2, "0")}d ${hours
  //         .toString()
  //         .padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds
  //         .toString()
  //         .padStart(2, "0")}s`
  //     );
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [start]);
  // countdown
  return (
    <Card
      className={`overflow-hidden relative ${
        isDisabled ? "pointer-events-none grayscale opacity-70" : ""
      }`}
    >
      <div className="aspect-[16/9] relative">
        <Image
          src={imageUrl || `/favicon-96x96.png?height=225&width=400`}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          loading="lazy"
          style={{
            filter: isDisabled ? "grayscale(50%) brightness(0.9)" : "none",
            transition: "filter 0.3s ease",
          }}
        />
        {isDisabled && (
          <div className="absolute inset-0 bg-black bg-opacity-10 pointer-events-none" />
        )}
        <Badge className="absolute top-2 right-2">{category}</Badge>
      </div>
      <CardHeader className="p-4">
        {isDisabled ? (
          <h3 className="text-lg font-bold line-clamp-2 text-muted-foreground cursor-default">
            {title}
          </h3>
        ) : (
          <Link href={`/event/${slug}`} className="hover:underline">
            <h3 className="text-lg font-bold line-clamp-2">{title}</h3>
          </Link>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-1 h-4 w-4" />
          <span>{formatDate(date)}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-4 w-4" />
          <span className="truncate">{venue}</span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="font-semibold">{formatRupiah(price)}</div>
          {ticketsAvailable > 0 ? (
            <Badge variant="outline" className="text-xs">
              {ticketsAvailable} tickets left
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              Sold Out
            </Badge>
          )}
        </div>
        {/* {today < start && (
          <div className="text-xs text-orange-500 font-medium">
            Tickets open in: {countdown}
          </div>
        )} */}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {(() => {
          if (today < start) {
            return (
              <Button disabled className="w-full cursor-not-allowed opacity-80">
                Tickets available {formatDate(startSellingDate)}
              </Button>
            );
          }

          if (today > end) {
            return (
              <Button disabled className="w-full cursor-not-allowed opacity-80">
                This event has ended
              </Button>
            );
          }

          return (
            <Button asChild className="w-full">
              <Link href={`/event/${slug}`}>
                {ticketsAvailable > 0 ? "Buy Tickets" : "View Details"}
              </Link>
            </Button>
          );
        })()}
      </CardFooter>
    </Card>
  );
}
