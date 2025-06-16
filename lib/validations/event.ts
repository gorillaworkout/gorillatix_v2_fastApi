import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  date: z.string(), // Keep as ISO string
  time: z.string(),
  location: z.string(),
  venue: z.string(),
  address: z.string(),
  category: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  price: z.number(),
  ticketsAvailable: z.number(),
  ticketsSold: z.number(),
  organizer: z.string(),
  organizerDescription: z.string(),
  createdAt: z.any(),
  updatedAt: z.any(),
  userId: z.string().optional(),
  status: z.enum(["Active", "upcoming", "completed"]),
  startSellingDate: z.string(),
  endSellingDate: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  timeSelling: z.string(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
