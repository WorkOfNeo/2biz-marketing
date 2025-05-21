"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { PostModalProvider } from "@/lib/post-modal-context"
import { PostsProvider } from "@/lib/posts-context"
import { DashboardSettingsProvider } from "@/lib/dashboard-settings-context"
import { ReportsProvider } from "@/lib/reports-context"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <PostsProvider>
          <DashboardSettingsProvider>
            <ReportsProvider>
              <PostModalProvider>{children}</PostModalProvider>
            </ReportsProvider>
          </DashboardSettingsProvider>
        </PostsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
