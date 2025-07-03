"use client";

import { EventCard } from "@/components/event-card";
import { HeroSection } from "@/components/hero-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEvents } from "@/context/event-context";
import { SkeletonCard } from "@/components/skeleton-card";
// import { useEffect } from "react";

export default function Home() {
  // Get events from context
  const { events, loading } = useEvents();
  console.log(events, 'events app/page 14')


  const sortedEvents = events
    ? (() => {
        const now = new Date();

        const activeEvents = [];
        const upcomingEvents = [];
        const pastEvents = [];

        for (const event of events) {
          const sellingStart = new Date(
            typeof event.startSellingDate === "string"
              ? event.startSellingDate + "T00:00:00"
              : event.startSellingDate
          );

          const eventEnd = new Date(
            typeof event.endSellingDate === "string"
              ? event.endSellingDate + "T23:59:59"
              : event.endSellingDate
          );

          if (sellingStart <= now && eventEnd >= now) {
            activeEvents.push(event);
          } else if (sellingStart > now) {
            upcomingEvents.push(event);
          } else if (eventEnd < now) {
            pastEvents.push(event);
          }
        }

        const sortByStartSellingDate = (a: any, b: any) =>
          new Date(a.startSellingDate).getTime() -
          new Date(b.startSellingDate).getTime();

        activeEvents.sort(sortByStartSellingDate);
        upcomingEvents.sort(sortByStartSellingDate);
        pastEvents.sort(sortByStartSellingDate);

        return [...activeEvents, ...upcomingEvents, ...pastEvents];
      })()
    : [];
  console.log(sortedEvents, 'sortedEvents');
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />

      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Upcoming Events</h2>
          <Button asChild variant="outline">
            <Link href="/events">View All</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading || !events
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : sortedEvents
                .slice(0, 4)
                .map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </section>

      <section className="py-12">
        <div className="rounded-lg bg-muted p-8 md:p-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Organize Your Own Event
            </h2>
            <p className="max-w-[700px] text-muted-foreground">
              Are you an event organizer? Partner with GorillaTix to sell
              tickets for your events.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
