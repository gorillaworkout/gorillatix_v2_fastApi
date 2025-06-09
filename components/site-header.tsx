"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Menu, ShoppingCart, User } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/components/auth-provider"
import { signOut } from "@/lib/firebase-auth"
import { useToast } from "@/hooks/use-toast"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Safely check for admin role
  const isAdmin = user?.role === "admin"

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/events",
      label: "Events",
      active: pathname === "/events",
    },
    {
      href: "/about",
      label: "About Us",
      active: pathname === "/about",
    },
  ]

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      toast({
        title: "Signing out...",
        description: "You are being signed out of your account.",
      })

      // Short delay to allow toast to show
      await new Promise((resolve) => setTimeout(resolve, 500))

      await signOut()

      // The page should reload from the signOut function,
      // but just in case, we'll force it here too after a delay
      setTimeout(() => {
        window.location.href = "/"
      }, 500)
    } catch (error) {
      console.error("Error signing out:", error)
      setIsSigningOut(false)
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
      })
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-10">
              <Image
                src="/images/gorillatix-logo.png"
                alt="GorillaTix Logo"
                fill
                sizes="40px"
                priority
                className="object-contain"
              />
            </div>
            <span className="font-bold text-xl">GorillaTix</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  route.active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!loading && user && !isSigningOut ? (
            <>
              {/* <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Cart</span>
                </Link>
              </Button> */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    {user.photoURL ? (
                      <div className="relative h-8 w-8 rounded-full overflow-hidden">
                        <Image
                          src={user.photoURL || "/placeholder.svg"}
                          alt={user.displayName || "User"}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Tickets</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
                    {isSigningOut ? "Signing out..." : "Log out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex items-center mb-6">
                <div className="relative h-8 w-8 mr-2">
                  <Image
                    src="/images/gorillatix-logo.png"
                    alt="GorillaTix Logo"
                    fill
                    sizes="32px"
                    className="object-contain"
                  />
                </div>
                <span className="font-bold">GorillaTix</span>
              </div>
              <nav className="flex flex-col gap-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      route.active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {route.label}
                  </Link>
                ))}
                {!loading && !user ? (
                  <Link href="/login" className="text-sm font-medium">
                    Sign in
                  </Link>
                ) : (
                  <>
                    <Link href="/profile" className="text-sm font-medium">
                      Profile
                    </Link>
                    <Link href="/orders" className="text-sm font-medium">
                      My Tickets
                    </Link>
                    {isAdmin && (
                      <Link href="/admin/dashboard" className="text-sm font-medium">
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleSignOut} className="text-sm font-medium text-left" disabled={isSigningOut}>
                      {isSigningOut ? "Signing out..." : "Log out"}
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
