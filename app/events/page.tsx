// "use client"

// import { useState, useEffect, useCallback, SetStateAction } from "react"
// import { useSearchParams } from "next/navigation"
// import { EventCard } from "@/components/event-card"
// import { SearchForm } from "@/components/search-form"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Label } from "@/components/ui/label"
// import { Loader2 } from "lucide-react"
// import { useEvents } from "@/context/event-context"
// import { Button } from "@/components/ui/button"
// import { EventItem } from "@/types/event"

// function EventsLoading() {
//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-center w-full py-12">
//         <div className="flex flex-col items-center gap-2">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//           <p>Searching events...</p>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function EventsPage() {
//   const searchParams = useSearchParams()
//   const categoryParam = searchParams.get("category")
//   const queryParam = searchParams.get("query")

//   const { events } = useEvents()
//   const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([])
//   const [displayedEvents, setDisplayedEvents] = useState<EventItem[]>([])
//   const [category, setCategory] = useState(categoryParam || "all")
//   const [searchQuery, setSearchQuery] = useState(queryParam || "")
//   const [isLoading, setIsLoading] = useState(true)
//   const [page, setPage] = useState(1)
//   const eventsPerPage = 8

//   const filterEvents = useCallback(async () => {
//     setIsLoading(true)
//     try {
//       // Simulate API delay
//       await new Promise((resolve) => setTimeout(resolve, 500))

//       let filteredResults = [...events]

//       // Apply search filter if there's a search query
//       if (searchQuery) {
//         const query = searchQuery.toLowerCase()
//         filteredResults = filteredResults.filter(
//           (event) =>
//             event.title.toLowerCase().includes(query) ||
//             event.description.toLowerCase().includes(query) ||
//             event.location.toLowerCase().includes(query),
//         )
//       }

//       // Apply category filter if a specific category is selected
//       if (category && category !== "all") {
//         filteredResults = filteredResults.filter((event) => event.category === category)
//       }

//       setFilteredEvents(filteredResults)

//       // Reset pagination when filters change
//       setPage(1)
//       setDisplayedEvents(filteredResults.slice(0, eventsPerPage))
//     } catch (error) {
//       console.error("Error filtering events:", error)
//       // Show empty results on error
//       setFilteredEvents([])
//       setDisplayedEvents([])
//     } finally {
//       setIsLoading(false)
//     }
//   }, [category, searchQuery, events])

//   useEffect(() => {
//     filterEvents()
//   }, [filterEvents])

//   const handleSearch = (query: SetStateAction<string>) => {
//     setIsLoading(true)
//     setSearchQuery(query)
//   }

//   const handleCategoryChange = (value: SetStateAction<string>) => {
//     setIsLoading(true)
//     setCategory(value)
//   }

//   const loadMoreEvents = () => {
//     const nextPage = page + 1
//     const startIndex = (nextPage - 1) * eventsPerPage
//     const endIndex = startIndex + eventsPerPage
//     const newEvents = filteredEvents.slice(startIndex, endIndex)

//     setDisplayedEvents([...displayedEvents, ...newEvents])
//     setPage(nextPage)
//   }

//   const hasMoreEvents = displayedEvents.length < filteredEvents.length

//   const categories = [
//     { value: "all", label: "All Categories" },
//     { value: "Music", label: "Music" },
//     { value: "Sports", label: "Sports" },
//     { value: "Theater", label: "Theater" },
//     { value: "Comedy", label: "Comedy" },
//     { value: "Conference", label: "Conference" },
//     { value: "Art", label: "Art & Culture" },
//     { value: "Food", label: "Food & Drink" },
//   ]

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold mb-4">Events</h1>
//         <div className="flex flex-col gap-4 md:flex-row md:items-end">
//           <div className="flex-1">
//             <SearchForm onSearch={handleSearch} initialQuery={searchQuery} />
//           </div>
//           <div className="w-full md:w-64">
//             <Label htmlFor="category-filter" className="mb-2 block">
//               Filter by Category
//             </Label>
//             <Select value={category} onValueChange={handleCategoryChange}>
//               <SelectTrigger id="category-filter">
//                 <SelectValue placeholder="Select category" />
//               </SelectTrigger>
//               <SelectContent>
//                 {categories.map((cat) => (
//                   <SelectItem key={cat.value} value={cat.value}>
//                     {cat.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </div>

//       {isLoading ? (
//         <EventsLoading />
//       ) : displayedEvents && displayedEvents?.length > 0 ? (
//         <>
//           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {displayedEvents && displayedEvents?.map((event) => (
//               <EventCard key={event.id} event={event} />
//             ))}
//           </div>

//           {hasMoreEvents && (
//             <div className="mt-8 flex justify-center">
//               <Button onClick={loadMoreEvents} variant="outline" size="lg">
//                 Load More Events
//               </Button>
//             </div>
//           )}
//         </>
//       ) : (
//         <div className="text-center py-12">
//           <h3 className="text-xl font-medium mb-2">No events found</h3>
//           <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
//         </div>
//       )}
//     </div>
//   )
// }
"use client";

import { useState, useEffect, useCallback, SetStateAction } from "react";
import { useSearchParams } from "next/navigation";
import { EventCard } from "@/components/event-card";
import { SearchForm } from "@/components/search-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEvents } from "@/context/event-context";
import { Button } from "@/components/ui/button";
import { EventItem } from "@/types/event";
import { SkeletonCard } from "@/components/skeleton-card";

function EventsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center w-full py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Searching events...</p>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const queryParam = searchParams.get("query");

  const { events } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<EventItem[]>([]);
  const [category, setCategory] = useState(categoryParam || "all");
  const [searchQuery, setSearchQuery] = useState(queryParam || "");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const eventsPerPage = 8;

  const filterEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      let filteredResults = [...events];

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredResults = filteredResults.filter(
          (event) =>
            event.title.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query) ||
            event.location.toLowerCase().includes(query)
        );
      }

      // Category filter
      if (category && category !== "all") {
        filteredResults = filteredResults.filter(
          (event) => event.category === category
        );
      }

      // Optional: only show active and upcoming ticket sales
      const now = new Date();
      filteredResults = filteredResults.filter((event) => {
        const saleStart = new Date(event.startSellingDate);
        const eventDate = new Date(event.date);
        return saleStart >= now || eventDate >= now;
      });

      // Sort by soonest ticket sale date
      filteredResults.sort((a, b) => {
        const aDate = new Date(a.startSellingDate).getTime();
        const bDate = new Date(b.startSellingDate).getTime();
        return aDate - bDate;
      });

      setFilteredEvents(filteredResults);
      setPage(1);
      setDisplayedEvents(filteredResults.slice(0, eventsPerPage));
    } catch (error) {
      console.error("Error filtering events:", error);
      setFilteredEvents([]);
      setDisplayedEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, searchQuery, events]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  const handleSearch = (query: SetStateAction<string>) => {
    setIsLoading(true);
    setSearchQuery(query);
  };

  const handleCategoryChange = (value: SetStateAction<string>) => {
    setIsLoading(true);
    setCategory(value);
  };

  const loadMoreEvents = () => {
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    const newEvents = filteredEvents.slice(startIndex, endIndex);

    setDisplayedEvents([...displayedEvents, ...newEvents]);
    setPage(nextPage);
  };

  const hasMoreEvents = displayedEvents.length < filteredEvents.length;

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Music", label: "Music" },
    { value: "Sports", label: "Sports" },
    { value: "Theater", label: "Theater" },
    { value: "Comedy", label: "Comedy" },
    { value: "Conference", label: "Conference" },
    { value: "Art", label: "Art & Culture" },
    { value: "Food", label: "Food & Drink" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Events</h1>
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <SearchForm onSearch={handleSearch} initialQuery={searchQuery} />
          </div>
          <div className="w-full md:w-64">
            <Label htmlFor="category-filter" className="mb-2 block">
              Filter by Category
            </Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : displayedEvents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {hasMoreEvents && (
            <div className="mt-8 flex justify-center">
              <Button onClick={loadMoreEvents} variant="outline" size="lg">
                Load More Events
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No events found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
