
// import Link from "next/link";
// import Image from "next/image";
// import { CalendarDays, MapPin } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { formatDate, formatRupiah } from "@/lib/utils";
// import { EventItem } from "@/types/event";

// interface EventCardProps {
//   event: EventItem;
// }

// export function EventCard({ event }: EventCardProps) {
//   const {
//     slug,
//     title,
//     date,
//     imageUrl,
//     venue,
//     price,
//     category,
//     ticketsAvailable,
//     startSellingDate,
//     endSellingDate,
//   } = event;

//   const now = new Date();
//   const start = new Date(startSellingDate);
//   const end = new Date(endSellingDate);

//   const isBeforeSelling = now < start;
//   const isAfterSelling = now > end;
//   const isDisabled = isBeforeSelling || isAfterSelling;

//   return (
//     <Card
//       className={`overflow-hidden relative transition ${
//         isDisabled ? "grayscale opacity-90" : ""
//       }`}
//     >
//       <div className="aspect-[16/9] relative">
//         <Image
//           src={imageUrl || `/favicon-96x96.png?height=225&width=400`}
//           alt={title}
//           fill
//           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//           className="object-cover"
//           loading="lazy"
//           style={{
//             filter: isDisabled ? "grayscale(50%) brightness(0.9)" : "none",
//             transition: "filter 0.3s ease",
//           }}
//         />
//         {isDisabled && (
//           <div className="absolute inset-0 bg-black bg-opacity-10 pointer-events-none" />
//         )}
//         <Badge className="absolute top-2 right-2">{category}</Badge>
//       </div>

//       <CardHeader className="p-4">
//         <Link href={`/event/${slug}`} className="hover:underline">
//           <h3
//             className={`text-lg font-bold line-clamp-2 ${
//               isDisabled ? "text-muted-foreground" : ""
//             }`}
//           >
//             {title}
//           </h3>
//         </Link>
//       </CardHeader>

//       <CardContent className="p-4 pt-0 space-y-2">
//         <div className="flex items-center text-sm text-muted-foreground">
//           <CalendarDays className="mr-1 h-4 w-4" />
//           <span>{formatDate(date)}</span>
//         </div>
//         <div className="flex items-center text-sm text-muted-foreground">
//           <MapPin className="mr-1 h-4 w-4" />
//           <span className="truncate">{venue}</span>
//         </div>
//         <div className="flex items-center justify-between mt-4">
//           <div className="font-semibold">{formatRupiah(price)}</div>
//           {ticketsAvailable > 0 ? (
//             <Badge variant="outline" className="text-xs">
//               {ticketsAvailable} tickets left
//             </Badge>
//           ) : (
//             <Badge variant="destructive" className="text-xs">
//               Sold Out
//             </Badge>
//           )}
//         </div>
//       </CardContent>

//       <CardFooter className="p-4 pt-0">
//         <Link href={`/event/${slug}`} className="w-full">
//           {isBeforeSelling ? (
//             <Button disabled className="w-full cursor-not-allowed opacity-80">
//               Tickets available {formatDate(startSellingDate)}
//             </Button>
//           ) : isAfterSelling ? (
//             <Button disabled className="w-full cursor-not-allowed opacity-80">
//               This event has ended
//             </Button>
//           ) : (
//             <Button className="w-full">
//               {ticketsAvailable > 0 ? "Buy Tickets" : "View Details"}
//             </Button>
//           )}
//         </Link>
//       </CardFooter>
//     </Card>
//   );
// }

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
import { DateTime } from "luxon";

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
    timeSelling = "00:00", // default if not set
  } = event;

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
  const isDisabled = isBeforeSelling || isAfterSelling;

  return (
    <Card
      className={`overflow-hidden relative transition ${
        isDisabled ? "grayscale opacity-90" : ""
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
          unoptimized
        />
        {isDisabled && (
          <div className="absolute inset-0 bg-black bg-opacity-10 pointer-events-none" />
        )}
        <Badge className="absolute top-2 right-2">{category}</Badge>
      </div>

      <CardHeader className="p-4">
        <Link href={`/event/${slug}`} className="hover:underline">
          <h3
            className={`text-lg font-bold line-clamp-2 ${
              isDisabled ? "text-muted-foreground" : ""
            }`}
          >
            {title}
          </h3>
        </Link>
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
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/event/${slug}`} className="w-full">
          {isBeforeSelling ? (
            <Button disabled className="w-full cursor-not-allowed opacity-80">
              Tickets available {start.toFormat("dd MMM yyyy, HH:mm")}
            </Button>
          ) : isAfterSelling ? (
            <Button disabled className="w-full cursor-not-allowed opacity-80">
              This event has ended
            </Button>
          ) : (
            <Button className="w-full">
              {ticketsAvailable > 0 ? "Buy Tickets" : "View Details"}
            </Button>
          )}
        </Link>
      </CardFooter>
    </Card>
  );
}
