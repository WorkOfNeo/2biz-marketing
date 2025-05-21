"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"
import { BarChart3, Calendar, Database, FileText, Home, LogOut, Menu, Plus, Settings, Users } from "lucide-react"
import { usePostModal } from "@/lib/post-modal-context"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Posts",
    href: "/posts",
    icon: FileText,
  },
  {
    title: "Sources",
    href: "/sources",
    icon: Database,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { openPostModal } = usePostModal()
  const [pendingUsersCount, setPendingUsersCount] = useState(0)

  // Fetch pending users count
  useEffect(() => {
    const fetchPendingUsersCount = async () => {
      if (!user || user.role !== "super_admin") {
        return
      }

      try {
        // Create a query to only get pending users
        const pendingUsersQuery = query(collection(db, "users"), where("status", "==", "pending"))

        const pendingUsersSnapshot = await getDocs(pendingUsersQuery)
        setPendingUsersCount(pendingUsersSnapshot.size)
      } catch (error) {
        console.error("Error fetching pending users count:", error)
      }
    }

    fetchPendingUsersCount()

    // Set up a timer to check for new pending users every minute
    const intervalId = setInterval(fetchPendingUsersCount, 60000)

    return () => clearInterval(intervalId)
  }, [user])

  const adminItems =
    user?.role === "super_admin"
      ? [
          {
            title: "User Management",
            href: "/users",
            icon: Users,
            badge: pendingUsersCount > 0 ? pendingUsersCount : undefined,
          },
        ]
      : []

  const allNavItems = [...navItems, ...adminItems]

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <MobileSidebar
            items={allNavItems}
            pathname={pathname}
            user={user}
            onLogout={logout}
            onNavigate={() => setOpen(false)}
            onAddPost={openPostModal}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 bg-background">
        <DesktopSidebar
          items={allNavItems}
          pathname={pathname}
          user={user}
          onLogout={logout}
          onAddPost={openPostModal}
        />
      </div>
    </>
  )
}

function MobileSidebar({
  items,
  pathname,
  user,
  onLogout,
  onNavigate,
  onAddPost,
}: {
  items: any[]
  pathname: string
  user: any
  onLogout: () => Promise<void>
  onNavigate: () => void
  onAddPost: () => void
}) {
  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="px-3 py-4 border-b">
        <h2 className="text-xl font-bold">Marketing Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
        <Button onClick={onAddPost} className="w-full mt-4 gap-2">
          <Plus className="h-4 w-4" />
          Add Post
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
                pathname === item.href ? "bg-muted font-medium text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="flex items-center justify-center h-5 w-5 text-xs font-medium rounded-full bg-red-500 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

function DesktopSidebar({
  items,
  pathname,
  user,
  onLogout,
  onAddPost,
}: {
  items: any[]
  pathname: string
  user: any
  onLogout: () => Promise<void>
  onAddPost: () => void
}) {
  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="px-6 py-5 border-b">
        <h2 className="text-xl font-bold">Marketing Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
        <Button onClick={onAddPost} className="w-full mt-4 gap-2">
          <Plus className="h-4 w-4" />
          Add Post
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary ${
                pathname === item.href ? "bg-muted font-medium text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="flex items-center justify-center h-5 w-5 text-xs font-medium rounded-full bg-red-500 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
