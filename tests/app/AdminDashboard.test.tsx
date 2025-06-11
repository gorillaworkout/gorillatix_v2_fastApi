/**
 * @jest-environment jsdom
 */
jest.mock("@/lib/firebase")
import React from "react"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import AdminDashboardPage from "@/app/admin/dashboard/page"
import * as authHook from "@/components/auth-provider"
import * as adminService from "@/lib/admin-service"
import { useRouter } from "next/navigation"


// Mock next/router's useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock user object with required fields and methods
const mockAdminUser = {
  uid: "123",
  email: "admin@example.com",
  role: "admin",
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: "mockRefreshToken",
  delete: jest.fn(),
  getIdToken: jest.fn().mockResolvedValue("mockToken"),
  getIdTokenResult: jest.fn().mockResolvedValue({ token: "mockToken" }),
  reload: jest.fn(),
  toJSON: jest.fn(),
  // Add any other methods your app might use here
} as any

describe("AdminDashboardPage", () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it("redirects to / if user is not admin", async () => {
    jest.spyOn(authHook, "useAuth").mockReturnValue({
      user: { ...mockAdminUser, role: "user" }, // simulate non-admin user
      loading: false,
      error: null,
      refreshAuthState: jest.fn(),
    })

    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/")
    })
  })

  it("shows loading state when auth or data loading", () => {
    jest.spyOn(authHook, "useAuth").mockReturnValue({
      user: null,
      loading: true,
      error: null,
      refreshAuthState: jest.fn(),
    })

    render(<AdminDashboardPage />)
    expect(screen.getByText(/loading dashboard data/i)).toBeInTheDocument()
  })

  it("renders dashboard data cards when user is admin and data loaded", async () => {
    jest.spyOn(authHook, "useAuth").mockReturnValue({
      user: mockAdminUser,
      loading: false,
      error: null,
      refreshAuthState: jest.fn(),
    })

    jest.spyOn(adminService, "getTotalRevenue").mockResolvedValue({ total: 1000000, percentChange: 5 })
    jest.spyOn(adminService, "getTicketsSold").mockResolvedValue({ total: 500, percentChange: -2 })
    jest.spyOn(adminService, "getActiveEventsCount").mockResolvedValue({ total: 10, newThisWeek: 1 })
    jest.spyOn(adminService, "getUsersCount").mockResolvedValue({ total: 200, newThisWeek: 5 })

    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText("Rp1.000.000")).toBeInTheDocument()
      expect(screen.getByText("+5.0% from last month")).toBeInTheDocument()

      expect(screen.getByText("+500")).toBeInTheDocument()
      expect(screen.getByText("-2.0% from last month")).toBeInTheDocument()

      expect(screen.getByText("10")).toBeInTheDocument()
      expect(screen.getByText("+1 new events this week")).toBeInTheDocument()

      expect(screen.getByText("200")).toBeInTheDocument()
      expect(screen.getByText("+5 new users this week")).toBeInTheDocument()
    })
  })

  it("allows tab navigation", async () => {
    jest.spyOn(authHook, "useAuth").mockReturnValue({
      user: mockAdminUser,
      loading: false,
      error: null,
      refreshAuthState: jest.fn(),
    })

    jest.spyOn(adminService, "getTotalRevenue").mockResolvedValue({ total: 0, percentChange: 0 })
    jest.spyOn(adminService, "getTicketsSold").mockResolvedValue({ total: 0, percentChange: 0 })
    jest.spyOn(adminService, "getActiveEventsCount").mockResolvedValue({ total: 0, newThisWeek: 0 })
    jest.spyOn(adminService, "getUsersCount").mockResolvedValue({ total: 0, newThisWeek: 0 })

    render(<AdminDashboardPage />)

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("tab", { name: /analytics/i }))
    expect(screen.getByText(/detailed analytics will be displayed here/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole("tab", { name: /reports/i }))
    expect(screen.getByText(/report generation tools will be displayed here/i)).toBeInTheDocument()
  })
})
