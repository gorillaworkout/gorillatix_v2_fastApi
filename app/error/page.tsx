import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"


export default function PaymentErrorPage() {

  return (
    <>
         <div className="container flex h-screen max-w-screen-md items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
          <CardDescription>There was a problem with authentication</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Authentication is currently disabled in this preview environment. Please continue as a guest.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
    </>
  )
}
