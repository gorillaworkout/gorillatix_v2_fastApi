"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTicket } from "@/lib/firebase-service";
import { useState } from "react";
import router from "next/router";

const manualTicketSchema = z.object({
  customerName: z.string().min(1),
  userId: z.string().min(1),
  eventId: z.string().min(1),
  eventName: z.string().min(1),
  venue: z.string().min(1),
  quantity: z.coerce.number().min(1),
  totalPrice: z.coerce.number().min(0),
  orderId: z.string().min(1),
  status: z.enum(["confirmed", "pending", "expired"]),
});

type ManualTicketFormValues = z.infer<typeof manualTicketSchema>;

export default function ManualTicketPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ManualTicketFormValues>({
    resolver: zodResolver(manualTicketSchema),
    defaultValues: {
      status: "confirmed",
    },
  });

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: ManualTicketFormValues) => {
    setLoading(true);
    try {
      await createTicket({
        ...values,
        purchaseDate: new Date(),
      });

      toast({
        title: "Ticket created",
        description: `Order ID: ${values.orderId}`,
      });

      reset();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error creating ticket",
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Manual Ticket</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input {...register("customerName")} placeholder="Customer Name" />
        <Input {...register("userId")} placeholder="User ID" />
        <Input {...register("eventId")} placeholder="Event ID" />
        <Input {...register("eventName")} placeholder="Event Name" />
        <Input {...register("venue")} placeholder="Venue" />
        <Input
          {...register("quantity", { valueAsNumber: true })}
          placeholder="Quantity"
          type="number"
        />
        <Input
          {...register("totalPrice", { valueAsNumber: true })}
          placeholder="Total Price (Rp)"
          type="number"
        />
        <Input {...register("orderId")} placeholder="Order ID" />
        <select
          {...register("status")}
          className="w-full border px-3 py-2 rounded-md"
        >
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
        </select>

        <Button type="submit" disabled={loading || isSubmitting}>
          {loading ? "Saving..." : "Create Ticket"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
}
