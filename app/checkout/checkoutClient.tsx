"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarDays, CreditCard, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useEvents } from "@/context/event-context";
import { processTicketPurchase } from "./actions";
import { useAuth } from "@/components/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatRupiah } from "@/lib/utils";
import Loader from "@/components/loading";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  quantity: z.string().min(1, { message: "Please select quantity" }),
});

export default function CheckoutClient({
  eventId,
}: {
  eventId: string | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { getEventById } = useEvents();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to purchase tickets.",
      });
      router.push(
        `/login?redirect=${encodeURIComponent(
          `/checkout?eventId=${eventId || ""}`
        )}`
      );
      return;
    }

    async function loadEvent() {
      if (eventId) {
        try {
          const eventData = await getEventById(eventId);
          if (eventData) {
            setEvent(eventData);
          } else {
            toast({
              variant: "destructive",
              title: "Event not found",
              description:
                "The event you're trying to purchase tickets for could not be found.",
            });
            router.push("/events");
          }
        } catch (error) {
          console.error("Error loading event:", error);
          toast({
            variant: "destructive",
            title: "Error loading event",
            description: "There was a problem loading the event details.",
          });
        } finally {
          setIsLoadingEvent(false);
        }
      } else {
        setIsLoadingEvent(false);
        toast({
          variant: "destructive",
          title: "No event selected",
          description: "Please select an event to purchase tickets for.",
        });
        router.push("/events");
      }
    }

    if (!authLoading && user) {
      loadEvent();
    }
  }, [eventId, getEventById, router, toast, user, authLoading]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
      phone: "",
      quantity: "1",
    },
  });

  const quantity = Number.parseInt(form.watch("quantity") || "1");
  const subtotal = event && event.price ? event.price * quantity : 0;
  const fees = Math.ceil(subtotal * 0.02);
  const serviceCharge = 5000
  const total = subtotal + fees + serviceCharge;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!event || !user) return;

    setIsLoading(true);
    setError(null);
    try {
      const transactionPayload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        quantity: parseInt(values.quantity),
        price: total,
      };

      const response = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionPayload),
      });

      if (!response.ok) throw new Error("Failed to create transaction");
      setIsLoadingPayment(true);
      const data: { token: string } = await response.json();

      const snap = (window as any).snap;
      snap?.pay(data.token, {
        onSuccess: async () => {
          const formData = new FormData();
          formData.append("eventId", event.id);
          formData.append("quantity", values.quantity);
          formData.append("price", total.toString());
          formData.append("userId", user.uid);
          formData.append(
            "customerName",
            `${values.firstName} ${values.lastName}`
          );
          formData.append("venue", event.venue);

          try {
            const result = await processTicketPurchase(formData);
            if (result.success) {
              toast({
                title: "Payment successful",
                description: "Your tickets have been sent to your email.",
              });
              router.push(`/payment-success?ticketId=${result.ticketId}`);
            } else {
              setError(
                result.message || "Failed to save ticket after payment."
              );
              toast({
                variant: "destructive",
                title: "Ticket Processing Failed",
                description: "Payment succeeded but ticket creation failed.",
              });
            }
          } catch (err) {
            console.error("Ticket error:", err);
            toast({
              variant: "destructive",
              title: "Ticket Save Error",
              description: "Please contact support.",
            });
          } finally {
            setIsLoadingPayment(false);
          }
        },
        onPending: () => {
          toast({
            title: "Awaiting payment",
            description: "Please complete the transaction.",
          });
          setIsLoadingPayment(false);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Payment failed",
            description: "Please try again later.",
          });
          setIsLoadingPayment(false);
        },
        onClose: () => {
          toast({
            title: "Payment cancelled",
            description: "You closed the payment popup.",
          });
          setIsLoadingPayment(false);
        },
      });
    } catch (error) {
      console.error("Midtrans error:", error);
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "An unexpected error occurred. Please try again.",
      });
      setIsLoadingPayment(false);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingPayment) return <Loader title="Preparing your tickets" />;
  if (authLoading || isLoadingEvent)
    return <Loader title="Loading event details..." />;
  if (!event) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="mb-4">
            The event you're looking for could not be found.
          </p>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div>
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Ticket Information</h2>
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue="1"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quantity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(5).keys()].map((n) => (
                            <SelectItem key={n + 1} value={(n + 1).toString()}>
                              {n + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <CreditCard className="h-5 w-5" />
                Pay Now
              </Button>
            </form>
          </Form>
        </div>

        <div className="lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">{event.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <CalendarDays className="mr-1 h-4 w-4" />
                  <span>
                    {event.date} at {event.time}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tickets ({quantity})</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span> Fees (2% QRIS)</span>
                  <span>{formatRupiah(fees)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span> Service Charge</span>
                  <span>{formatRupiah(serviceCharge)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatRupiah(total)}</span>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">Important Information:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li>Tickets are non-refundable</li>
                  <li>E-tickets will be sent to your email</li>
                  <li>Please bring a valid ID for entry</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <p className="text-sm text-muted-foreground">
                By completing this purchase, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
