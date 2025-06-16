"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EventFormValues, eventFormSchema } from "@/lib/validations/event";
import { getEventById, updateEvent } from "@/lib/firebase-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditEventPageProps {
  eventId: string;
}

export default function EditEventPage({ eventId }: EditEventPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<EventFormValues | null>(
    null
  );

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues ?? undefined,
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        const event = await getEventById(eventId);
        if (!event) return;

        const formatted: EventFormValues = {
          ...event,
          price: Number(event.price),
          ticketsAvailable: Number(event.ticketsAvailable),
          ticketsSold: Number(event.ticketsSold),
        };

        setInitialValues(formatted);
        form.reset(formatted);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Failed to load event",
          description: "Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const onSubmit = async (data: EventFormValues) => {
    setIsLoading(true);
    try {
      await updateEvent(eventId, data);
      toast({ title: "Event updated successfully." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Unable to update event data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !initialValues) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
      <p className="text-muted-foreground mb-6">
        Update your event details below.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      {/* <Input {...field} placeholder="Event title" /> */}
                      <Input
                        type="title"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Venue */}
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Venue name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Theater">Theater</SelectItem>
                        <SelectItem value="Comedy">Comedy</SelectItem>
                        <SelectItem value="Conference">Conference</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tickets Available */}
              <FormField
                control={form.control}
                name="ticketsAvailable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tickets Available</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      {/* <Input {...field} placeholder="e.g. Active, Cancelled" /> */}
                      <Input
                        type="status"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={5}
                        placeholder="Event description..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Organizer */}
              <FormField
                control={form.control}
                name="organizer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer</FormLabel>
                    <FormControl>
                      {/* <Input {...field} placeholder="Organizer name" /> */}
                      <Input
                        type="organizer"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Organizer Description */}
              <FormField
                control={form.control}
                name="organizerDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer Description</FormLabel>
                    <FormControl>
                      {/* <Input
                        {...field}
                        placeholder="Describe the organizer..."
                      /> */}
                      <Input
                        type="organizerDescription"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      {/* <Input {...field} placeholder="YYYY-MM-DD" /> */}
                      <Input
                        type="date"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Time */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Time</FormLabel>
                    <FormControl>
                      {/* <Input type="time" {...field} /> */}
                      <Input
                        type="time"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      The start time of your event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Start Selling Time */}
              <FormField
                control={form.control}
                name="timeSelling"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Selling Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>When ticket sales begin.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Start Selling Date */}
              <FormField
                control={form.control}
                name="startSellingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
