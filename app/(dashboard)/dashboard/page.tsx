"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Plus } from "lucide-react"
import { useDashboardSettings } from "@/lib/dashboard-settings-context"
import { WidgetRenderer } from "@/components/dashboard/widget-renderer"
import type { Dashboard } from "@/lib/types/dashboard"

export default function DashboardPage() {
  const { dashboards } = useDashboardSettings()
  const router = useRouter()
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null)

  // Find the default dashboard or the first one
  useEffect(() => {
    if (dashboards.length > 0) {
      const defaultDashboard = dashboards.find((d) => d.isDefault) || dashboards[0]
      setSelectedDashboard(defaultDashboard)
    }
  }, [dashboards])

  const handleEditDashboard = () => {
    router.push("/settings")
  }

  if (!selectedDashboard) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium mb-2">No Dashboards Available</h3>
          <p className="text-muted-foreground mb-4">Create your first dashboard to start visualizing your data.</p>
          <Button className="gap-1" onClick={() => router.push("/settings")}>
            <Plus className="h-4 w-4" /> Create Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {dashboards.length > 1 && (
            <Tabs
              defaultValue={selectedDashboard.id}
              onValueChange={(value) => {
                const dashboard = dashboards.find((d) => d.id === value)
                if (dashboard) setSelectedDashboard(dashboard)
              }}
            >
              <TabsList>
                {dashboards.map((dashboard) => (
                  <TabsTrigger key={dashboard.id} value={dashboard.id}>
                    {dashboard.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
          <Button variant="outline" size="sm" className="gap-1" onClick={handleEditDashboard}>
            <Edit className="h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      {selectedDashboard.widgets.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium mb-2">No Widgets</h3>
          <p className="text-muted-foreground mb-4">Add widgets to your dashboard to start visualizing your data.</p>
          <Button className="gap-1" onClick={handleEditDashboard}>
            <Plus className="h-4 w-4" /> Add Widget
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {selectedDashboard.widgets.map((widget) => (
            <Card key={widget.id} className="overflow-hidden">
              <WidgetRenderer widget={widget} />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
