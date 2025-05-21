"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/sidebar"
import { LoadingScreen } from "@/components/loading-screen"
import { PostModal } from "@/components/post-modal"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user && isMounted) {
      router.push("/login")
    }
  }, [user, isLoading, router, isMounted])

  if (isLoading || !isMounted) {
    return <LoadingScreen />
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 md:ml-64 overflow-auto">
        <main className="p-4 md:p-6 max-w-7xl mx-auto">{children}</main>
      </div>
      <PostModal />
    </div>
  )
}
