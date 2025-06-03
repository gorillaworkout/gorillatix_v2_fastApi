// 'use client'

// import { ThemeProvider } from "@/components/theme-provider"
// import { ReduxProvider } from "@/redux/provider"
// import { AuthProvider } from "@/components/auth-provider"
// import { Toaster } from "@/components/ui/toaster"

// export function ClientProviders({ children }: { children: React.ReactNode }) {
//   return (
//     <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
//       <ReduxProvider>
//         <AuthProvider>
//           {children}
//           <Toaster />
//         </AuthProvider>
//       </ReduxProvider>
//     </ThemeProvider>
//   )
// }
"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { ReduxProvider } from "@/redux/provider"
import { EventProvider } from "@/context/event-context"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ReduxProvider>
        <AuthProvider>
          <EventProvider>
            {children}
            <Toaster />
          </EventProvider>
        </AuthProvider>
      </ReduxProvider>
    </ThemeProvider>
  )
}
