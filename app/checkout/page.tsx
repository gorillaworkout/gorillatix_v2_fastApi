"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarDays, CreditCard, Loader2, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useEvents } from "@/context/event-context"
import { processTicketPurchase } from "./actions"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatRupiah } from "@/lib/utils"

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  quantity: z.string().min(1, { message: "Please select quantity" }),
})

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [isLoadingEvent, setIsLoadingEvent] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")
  const { toast } = useToast()
  const { getEventById } = useEvents()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to purchase tickets.",
      })
      router.push(`/login?redirect=${encodeURIComponent(`/checkout?eventId=${eventId || ""}`)}`)
      return
    }

    async function loadEvent() {
      if (eventId) {
        try {
          const eventData = await getEventById(eventId)
          if (eventData) {
            setEvent(eventData)
          } else {
            toast({
              variant: "destructive",
              title: "Event not found",
              description: "The event you're trying to purchase tickets for could not be found.",
            })
            router.push("/events")
          }
        } catch (error) {
          console.error("Error loading event:", error)
          toast({
            variant: "destructive",
            title: "Error loading event",
            description: "There was a problem loading the event details.",
          })
        } finally {
          setIsLoadingEvent(false)
        }
      } else {
        setIsLoadingEvent(false)
        toast({
          variant: "destructive",
          title: "No event selected",
          description: "Please select an event to purchase tickets for.",
        })
        router.push("/events")
      }
    }

    if (!authLoading && user) {
      loadEvent()
    }
  }, [eventId, getEventById, router, toast, user, authLoading])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
      phone: "",
      quantity: "1",
    },
  })

  const quantity = Number.parseInt(form.watch("quantity") || "1")
  const subtotal = event && event.price ? event.price * quantity : 0
  const fees = subtotal * 0.05 // 5% service fee
  const total = subtotal + fees


  async function onSubmit(values: z.infer<typeof formSchema>) {
  if (!event || !user) return;

  setIsLoading(true);
  setError(null);

  try {
    // Prepare transaction data for Midtrans
    const transactionPayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      quantity: parseInt(values.quantity),
      price: total, // assumed number
    };

    const response = await fetch("/api/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transactionPayload),
    });

    if (!response.ok) throw new Error("Failed to create transaction");
    const data: { token: string } = await response.json();
    console.log(response, 'response 141')
    const snap = (window as any).snap as {
      pay: (
        token: string,
        callbacks?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
    console.log(snap, 'snap')
    snap?.pay(data.token, {
      onSuccess: async () => {
        // ✅ Submit ticket to Firestore after payment success
        const formData = new FormData();
        formData.append("eventId", event.id);
        formData.append("quantity", values.quantity);
        formData.append("price", event.price.toString());
        formData.append("userId", user.uid);

        try {
          const result = await processTicketPurchase(formData);
          console.log(result , 'result 165')
          if (result.success) {
            toast({
              title: "Payment successful",
              description: "Your tickets have been sent to your email.",
            });

            router.push(`/payment-success?ticketId=${result.ticketId}`);
          } else {
            setError(result.message || "Failed to save ticket after payment.");
            toast({
              variant: "destructive",
              title: "Ticket Processing Failed",
              description: "Your payment succeeded but ticket creation failed.",
            });
          }
        } catch (error) {
          console.error("Ticket process error:", error);
          setError("Something went wrong saving your ticket.");
          toast({
            variant: "destructive",
            title: "Ticket Save Error",
            description: "Please contact support.",
          });
        }
      },

      onPending: () => {
        toast({
          title: "Awaiting payment",
          description: "Please complete the transaction.",
        });
      },

      onError: () => {
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: "Please try again later.",
        });
      },

      onClose: () => {
        toast({
          title: "Payment cancelled",
          description: "You closed the payment popup.",
        });
      },
    });
  } catch (error) {
    console.error("Midtrans error:", error);
    toast({
      variant: "destructive",
      title: "Payment failed",
      description: "An unexpected error occurred. Please try again.",
    });
  } finally {
    setIsLoading(false);
  }
}


  if (authLoading || isLoadingEvent) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="mb-4">The event you're looking for could not be found.</p>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      </div>
    )
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
                      <FormLabel>Number of Tickets</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quantity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "ticket" : "tickets"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay {formatRupiah(total)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div>
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
                  <span>Service Fee</span>
                  <span>{formatRupiah(fees)}</span>
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
  )
}
