"use client";
export const dynamic = "force-dynamic"; // required for dynamic routes that aren't pre-rendered

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { CalendarDays, Clock, MapPin, Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatRupiah } from "@/lib/utils";
import { useEvents } from "@/context/event-context";
import { EventItem } from "@/types/event";
import Head from "next/head";
import LocationSection from "./../../../components/locatioSection";
import { useRouter } from "next/navigation";
import { ShareEventSection } from "@/components/share-event-section";
import { DateTime } from "luxon";
import { toast } from "@/hooks/use-toast";
import { getEventBySlug } from "@/lib/firebase-service";

export default function EventPage() {
  const params = useParams();
  const { events } = useEvents();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isBeforeSelling, setIsBeforeSelling] = useState<boolean>(false);
  const [isAfterSelling, setIsAfterSelling] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [start, setStart] = useState<DateTime<true> | DateTime<false>>();
  useEffect(() => {
    async function fetchEvent() {
      if (params.slug) {
        try {
          // First try to find the event in the context
          const slug = params.slug as string;
          const foundEvent = events.find((e) => e.slug === slug);

          if (foundEvent) {
            const now = DateTime.now().setZone("Asia/Jakarta");

            const start = DateTime.fromFormat(
              `${foundEvent.startSellingDate} ${foundEvent.timeSelling}`,
              "yyyy-MM-dd HH:mm",
              { zone: "Asia/Jakarta" }
            );

            const end = DateTime.fromFormat(
              foundEvent.endSellingDate,
              "yyyy-MM-dd",
              {
                zone: "Asia/Jakarta",
              }
            ).endOf("day");
            setIsBeforeSelling(now < start);
            setIsAfterSelling(now > end);
            setIsDisabled(isBeforeSelling || isAfterSelling);
            setStart(start);
            setEvent(foundEvent);
          } else {
            // If not found in context, try to fetch it
            const fetchedEvent = await getEventBySlug(slug);
            if (fetchedEvent) {
              setEvent(fetchedEvent);
            }
          }
        } catch (error) {
          console.error("Error fetching event:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchEvent();
  }, [params.slug, events, getEventBySlug]);

  useEffect(() => {
    if (!loading && !event) {
      router.push("/");
    }
  }, [loading, event, router]);

//   const handleBuyTickets = async () => {
//   const eventFresh = await getEventBySlug(params.slug as string); // Firestore fetch
//   console.log(eventFresh, 'event fresh');
//   console.log(eventFresh?.ticketsAvailable, 'ticket')
//   if (eventFresh && eventFresh.ticketsAvailable > 0) {
//     // href={`/checkout?eventId=${event.id}
//     router.push(`/checkout?eventId=${event?.id}`);
//   } else {
//     toast({
//       variant: "destructive",
//       title: "Tickets Sold Out",
//       description: "Sorry, all tickets are already taken.",
//     });
//     // window.location.href = "/";  
//   }
// };
const handleBuyTickets = async () => {
  const eventFresh = await getEventBySlug(params.slug as string);
  const available = Number(eventFresh?.ticketsAvailable) || 0;

  if (eventFresh && available > 0) {
    router.push(`/checkout?eventId=${eventFresh.id}`);
  } else {
    toast({
      variant: "destructive",
      title: "Tickets Sold Out",
      description: "Sorry, all tickets are already taken.",
    });
    window.location.href = "/";  
  }
};

  if (loading) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }
  return (
    <>
      {event && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: `${event.title} - Tiket Event`,
                description: event.description,
                image: [event.imageUrl],
                brand: {
                  "@type": "Organization",
                  name: event.organizer,
                },
                offers: {
                  "@type": "Offer",
                  url: `https://www.gorillatix.com/event/${event.slug}`, // ← ganti sesuai domain
                  priceCurrency: "IDR",
                  price: event.price,
                  priceValidUntil: event.date,
                  availability:
                    event.ticketsAvailable > 0
                      ? "https://schema.org/InStock"
                      : "https://schema.org/SoldOut",
                  seller: {
                    "@type": "Organization",
                    name: "GorillaTix",
                  },
                },
              }),
            }}
          />
        </Head>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{event.category}</Badge>
                {event.ticketsAvailable > 0 ? (
                  <Badge variant="outline" className="text-xs">
                    {event.ticketsAvailable} tickets left
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Sold Out
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">{event.title}</h1>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center text-muted-foreground">
                  <CalendarDays className="mr-1 h-4 w-4" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden mb-8">
              <div className="relative w-full aspect-video">
                {/* Skeleton Loader */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
                )}

                {/* Actual Image */}
                <Image
                  src={
                    event.imageUrl || `/favicon-96x96.png?height=400&width=800`
                  }
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 800px"
                  className={`object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
              </div>
              {/* <div className="relative w-full aspect-video">
                <Image
                  src={
                    event.imageUrl || `/favicon-96x96.png?height=400&width=800`
                  }
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 800px"
                  className="object-cover"
                  priority
                />
              </div> */}
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <div className="prose max-w-none dark:prose-invert prose whitespace-pre-line">
                  <p>{event.description}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <p className="mb-2">{event.venue}</p>
                <p className="text-muted-foreground">{event.address}</p>
                <div className="mt-4 rounded-lg overflow-hidden h-[300px] bg-muted">
                  {/* Map would go here in a real implementation */}
                  <div className="bg-background w-full h-full flex items-center justify-center text-muted-foreground">
                    <LocationSection
                      event={{
                        venue: event.venue,
                        address: event.address,
                        latitude: Number(event.latitude),
                        longitude: Number(event.longitude),
                      }}
                    />
                    {/* 35.66781278107372, 139.6995449821261 */}
                    {/* -6.996301771459569, 107.52967155378118 */}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-2xl font-bold mb-4">Organizer</h2>
                <p className="font-medium">{event.organizer}</p>
                <p className="text-muted-foreground mt-1">
                  {event.organizerDescription}
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link
                    href="https://www.instagram.com/cheerleadingindonesia/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact Organizer
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-bold mb-4">Tickets</h3>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span className="font-bold">
                      {formatRupiah(event.price)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Availability:</span>
                    <span>
                      {event.ticketsAvailable > 0
                        ? `${event.ticketsAvailable} tickets left`
                        : "Out of Stock"}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">
                      Tickets will be sent to your email
                    </span>
                  </div>

                  {/* <Button
                    className="w-full"
                    size="lg"
                    disabled={event.ticketsAvailable <= 0}
                    asChild
                  >
                    <Link href={`/checkout?eventId=${event.id}`}>
                      {event.ticketsAvailable > 0 ? "Buy Tickets" : "Sold Out"}
                    </Link>
                  </Button> */}
                  {/* <TicketButton
                    slug={event.slug}
                    startSellingDate={event.startSellingDate}
                    endSellingDate={event.endSellingDate}
                    ticketsAvailable={event.ticketsAvailable}
                    status={event.status}
                    eventId={event.id}
                    timeSelling={event.timeSelling}
                  /> */}

                  {isBeforeSelling ? (
                    <>
                      {" "}
                      <Button
                        disabled
                        className="w-full cursor-not-allowed opacity-80"
                      >
                        Tickets available{" "}
                        {start?.toFormat("dd MMM yyyy, HH:mm")}
                      </Button>
                    </>
                  ) : isAfterSelling ? (
                    <>
                      <Button
                        disabled
                        className="w-full cursor-not-allowed opacity-80"
                      >
                        This event has ended
                      </Button>
                    </>
                  ) : event.ticketsAvailable > 0 ?
                    <>
                      {/* <Link href={`/checkout?eventId=${event.id}`}
                        className="w-full">
                      </Link> */}
                        <Button className="w-full" onClick={handleBuyTickets}>
                          Buy Tickets
                        </Button>
                    </>
                    :
                    (
                      <Button disabled className="w-full cursor-not-allowed opacity-80" >
                        Out of Stock
                      </Button>
                    )}

                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Secure checkout powered by Midtrans
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 mt-6">
                <ShareEventSection
                  title={event.title}
                  slug={event.slug}
                  imageUrl={event.imageUrl}
                  date={formatDate(event.date)}
                  description={event.description}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
