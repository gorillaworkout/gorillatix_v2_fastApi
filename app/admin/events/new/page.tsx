"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createEvent } from "@/lib/firebase-service";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1, { message: "Please enter a time" }),
  timeSelling: z.string().min(1, { message: "Please enter a time selling" }),
  venue: z.string().min(3, { message: "Venue must be at least 3 characters" }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  price: z.string().min(1, { message: "Please enter a price" }),
  totalTickets: z.string().min(1, { message: "Please enter total tickets" }),
  image: z
    .any()
    .refine((file) => !file || file instanceof File || file instanceof Blob, {
      message: "Please upload a valid image",
    })
    .optional(),
  startSellingDate: z.date({ required_error: "Please select a date" }),
  endSellingDate: z.date({ required_error: "Please select a date" }),
});

export default function NewEventPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  // const { addEvent } = useEvents()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: new Date(), // atau `undefined` kalau opsional
      time: "",
      venue: "",
      address: "",
      city: "",
      price: "",
      totalTickets: "",
      image: z.any().refine((file) => file instanceof File, {
        message: "Image is required",
      }),
      startSellingDate: new Date(),
      endSellingDate: new Date(),
    },
  });

  // async function onSubmit(values: z.infer<typeof formSchema>) {
  //   setIsLoading(true);

  //   try {
  //     // ✅ Upload image ke Firebase Storage
  //     const imageFile = values.image as File;

  //     const storageRef = ref(
  //       storage,
  //       `event-images/${Date.now()}-${imageFile.name}`
  //     );
  //     const snapshot = await uploadBytes(storageRef, imageFile);
  //     const downloadURL = await getDownloadURL(snapshot.ref);

  //     const location = `${values.address}, ${values.city}`;
  //     const newEvent = await createEvent({
  //       title: values.title,
  //       description: values.description,
  //       category: values.category,
  //       date: values.date.toISOString().split("T")[0],
  //       time: values.time,
  //       venue: values.venue,
  //       address: values.address,
  //       location: location,
  //       imageUrl: downloadURL,
  //       price: Number.parseFloat(values.price),
  //       ticketsAvailable: Number.parseInt(values.totalTickets),
  //       ticketsSold: 0,
  //       organizer: "ICA",
  //       organizerDescription: values.description,
  //       status: "Active",
  //       slug: "",
  //       userId: "",
  //       startSellingDate: values.startSellingDate.toISOString().split("T")[0],
  //       endSellingDate: values.startSellingDate.toISOString().split("T")[0],
  //       latitude:"",
  //       longitude:"",
  //       timeSelling: values.timeSelling
  //     });
  //     if (newEvent) {
  //       toast({
  //         title: "Event created",
  //         description: "Your event has been created successfully.",
  //       });
  //       window.location.href = "/admin/dashboard";
  //     } else {
  //       throw new Error("Failed to create event");
  //     }
  //   } catch (error) {
  //     console.error("Error creating event:", error);
  //     toast({
  //       variant: "destructive",
  //       title: "Something went wrong",
  //       description: "Failed to create event. Please try again.",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }
  async function onSubmit(values: z.infer<typeof formSchema>) {
  setIsLoading(true);

  try {
    const imageFile = values.image as File;
    const storageRef = ref(
      storage,
      `event-images/${Date.now()}-${imageFile.name}`
    );
    const snapshot = await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const eventPayload = {
      title: values.title,
      description: values.description,
      category: values.category,
      date: values.date.toISOString().split("T")[0],
      time: values.time,
      venue: values.venue,
      address: values.address,
      imageUrl: downloadURL,
      price: parseFloat(values.price),
      ticketsAvailable: parseInt(values.totalTickets, 10),
      ticketsSold: 0,
      organizer: "ICA",
      organizerDescription: values.description,
      status: "Active",
      slug: values.title.toLowerCase().replace(/\s+/g, "-"),
      userId: "", // Ganti jika punya UID
      startSellingDate: values.startSellingDate.toISOString().split("T")[0],
      endSellingDate: values.endSellingDate.toISOString().split("T")[0],
      latitude: "",
      longitude: "",
      timeSelling: values.timeSelling,
    };
    console.log(eventPayload, 'event payload')

    const res = await fetch("https://fastapi-gorillatix-production.up.railway.app/events/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    });

    if (!res.ok) {
      throw new Error(`Failed to create event. Status: ${res.status}`);
    }

    toast({
      title: "Event created",
      description: "Your event has been created successfully.",
    });

    window.location.href = "/admin/dashboard";
  } catch (error) {
    console.error("Error creating event:", error);
    toast({
      variant: "destructive",
      title: "Something went wrong",
      description: "Failed to create event. Please try again.",
    });
  } finally {
    setIsLoading(false);
  }
}



  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-muted-foreground">
          Add a new event to your platform
        </p>
      </div>

      <div className="space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Summer Music Festival 2023"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The name of your event as it will appear to attendees.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your event..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide details about what attendees can expect.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Music">Music</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Theater">Theater</SelectItem>
                          <SelectItem value="Comedy">Comedy</SelectItem>
                          <SelectItem value="Conference">Conference</SelectItem>
                          <SelectItem value="Art">Art & Culture</SelectItem>
                          <SelectItem value="Food">Food & Drink</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Categorize your event to help attendees find it.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Madison Square Garden" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket Price (RP)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        The price per ticket in Rupiah.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Event Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        The date when your event will take place.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startSellingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date Selling</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        The date when your event will take place.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endSellingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date Selling</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        The date when your event will take place.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>
                        The start time of your event.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeSelling"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Time Selling</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>
                        The start time selling of your event.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="4 Pennsylvania Plaza" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Image Upload Field */}
              <FormField
                control={form.control}
                name="image"
                render={({ }) => (
                  <FormItem>
                    <FormLabel>Event Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        // onChange={(e) => field.onChange(e.target.files?.[0])}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            form.setValue("image", file);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload an image to represent your event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalTickets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Tickets</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      The total number of tickets available for sale.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
